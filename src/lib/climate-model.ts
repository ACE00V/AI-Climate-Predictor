type NumericFeatures = number[];

interface RegressionModel {
  weights: number[];
  bias: number;
  means: number[];
  stds: number[];
}

interface ModelResult {
  model: RegressionModel;
  predict(input: NumericFeatures): number;
}

function normalize(samples: NumericFeatures[]) {
  const featureCount = samples[0]?.length || 0;
  const means = Array(featureCount).fill(0);
  const stds = Array(featureCount).fill(0);

  samples.forEach(sample => {
    sample.forEach((value, index) => {
      means[index] += value;
    });
  });

  for (let index = 0; index < featureCount; index++) {
    means[index] /= samples.length;
  }

  samples.forEach(sample => {
    sample.forEach((value, index) => {
      stds[index] += Math.pow(value - means[index], 2);
    });
  });

  for (let index = 0; index < featureCount; index++) {
    stds[index] = Math.sqrt(stds[index] / samples.length) || 1;
  }

  const normalized = samples.map(sample => sample.map((value, index) => (value - means[index]) / stds[index]));
  return { normalized, means, stds };
}

function createRegressionModel(featureCount: number): RegressionModel {
  return {
    weights: Array(featureCount).fill(0),
    bias: 0,
    means: Array(featureCount).fill(0),
    stds: Array(featureCount).fill(1),
  };
}

function predictWithModel(model: RegressionModel, input: NumericFeatures) {
  const normalized = input.map((value, index) => (value - model.means[index]) / model.stds[index]);
  const prediction = normalized.reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
  return prediction;
}

function trainLinearRegression(samples: NumericFeatures[], targets: number[], epochs = 1200, learningRate = 0.005) {
  if (samples.length === 0) {
    throw new Error('No training samples provided');
  }

  const featureCount = samples[0].length;
  const { normalized, means, stds } = normalize(samples);
  const model = createRegressionModel(featureCount);
  model.means = means;
  model.stds = stds;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const weightGradients = Array(featureCount).fill(0);
    let biasGradient = 0;

    for (let i = 0; i < normalized.length; i++) {
      const x = normalized[i];
      const prediction = x.reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
      const error = prediction - targets[i];

      for (let j = 0; j < featureCount; j++) {
        weightGradients[j] += error * x[j];
      }
      biasGradient += error;
    }

    for (let j = 0; j < featureCount; j++) {
      model.weights[j] -= (learningRate * weightGradients[j]) / normalized.length;
    }
    model.bias -= (learningRate * biasGradient) / normalized.length;
  }

  return model;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeSeasonality(month: number) {
  return Math.sin(((month - 1) / 12) * 2 * Math.PI);
}

function buildTemperatureModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 2200; i++) {
    const month = Math.floor(randomBetween(1, 13));
    const elevation = randomBetween(0, 1500);
    const humidity = randomBetween(25, 95);
    const pressure = randomBetween(980, 1035);
    const windSpeed = randomBetween(0, 25);
    const cloudCover = randomBetween(0, 100);
    const seaSurfaceTemp = randomBetween(22, 32);
    const previousTemp = randomBetween(10, 38);
    const solarIndex = makeSeasonality(month);
    const dayOfYear = month * 30 + randomBetween(0, 29);

    const temperature =
      14 +
      10 * solarIndex -
      0.004 * elevation +
      0.1 * humidity -
      0.05 * (pressure - 1013) +
      0.3 * seaSurfaceTemp -
      0.02 * cloudCover +
      0.18 * previousTemp +
      0.04 * windSpeed +
      randomBetween(-1.5, 1.5);

    features.push([month, elevation, humidity, pressure, windSpeed, cloudCover, seaSurfaceTemp, previousTemp, dayOfYear]);
    targets.push(clamp(temperature, -10, 52));
  }

  return trainLinearRegression(features, targets, 1800, 0.003);
}

function buildRainfallModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 2200; i++) {
    const month = Math.floor(randomBetween(1, 13));
    const humidity = randomBetween(30, 100);
    const pressure = randomBetween(980, 1035);
    const windSpeed = randomBetween(0, 25);
    const cloudCover = randomBetween(0, 100);
    const temperature = randomBetween(10, 38);
    const elevation = randomBetween(0, 1500);
    const seasonality = Math.max(0, makeSeasonality(month));
    const monsoonBoost = month >= 6 && month <= 9 ? 1.4 : 1.0;

    const rainfall =
      2.2 * humidity +
      1.8 * cloudCover -
      1.2 * (pressure - 1013) +
      0.5 * windSpeed -
      0.1 * elevation +
      6 * seasonality * monsoonBoost +
      randomBetween(-10, 10);

    features.push([month, humidity, pressure, windSpeed, cloudCover, temperature, elevation]);
    targets.push(clamp(rainfall, 0, 320));
  }

  return trainLinearRegression(features, targets, 1800, 0.0025);
}

function buildAqiModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 2200; i++) {
    const pm25 = randomBetween(5, 180);
    const pm10 = randomBetween(10, 220);
    const no2 = randomBetween(5, 120);
    const so2 = randomBetween(1, 70);
    const temperature = randomBetween(5, 38);
    const humidity = randomBetween(10, 95);
    const windSpeed = randomBetween(0.5, 18);
    const month = Math.floor(randomBetween(1, 13));
    const winterFactor = month === 12 || month <= 2 ? 1.1 : 1.0;

    const aqi =
      0.55 * pm25 +
      0.25 * pm10 +
      0.18 * no2 +
      0.12 * so2 -
      0.8 * windSpeed +
      0.08 * (100 - humidity) +
      0.15 * winterFactor * (temperature < 10 ? 10 : 0) +
      randomBetween(-5, 8);

    features.push([pm25, pm10, no2, so2, temperature, humidity, windSpeed, month]);
    targets.push(clamp(aqi, 0, 500));
  }

  return trainLinearRegression(features, targets, 2200, 0.0025);
}

function buildCycloneRiskModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 1800; i++) {
    const speed = randomBetween(0, 180);
    const centralPressure = randomBetween(960, 1015);
    const seaSurfaceTemp = randomBetween(24, 32);
    const humidity = randomBetween(45, 100);
    const convectiveActivity = randomBetween(0, 1);
    const vorticity = randomBetween(0.0001, 0.0012);
    const verticalShear = randomBetween(0, 20);
    const cloudTopTemp = randomBetween(-80, -30);
    const precipitation = randomBetween(0, 120);

    const probability = clamp(
      0.22 * (speed / 180) +
      0.25 * Math.max(0, (1013 - centralPressure) / 60) +
      0.18 * Math.max(0, (seaSurfaceTemp - 26) / 6) +
      0.15 * (humidity / 100) +
      0.12 * convectiveActivity +
      0.08 * Math.min(1, vorticity / 0.0012) -
      0.09 * Math.min(1, verticalShear / 20) +
      0.05 * Math.max(0, (-cloudTopTemp - 40) / 40) +
      0.02 * Math.min(1, precipitation / 120) +
      randomBetween(-0.05, 0.05),
      0,
      1
    );

    features.push([speed, centralPressure, seaSurfaceTemp, humidity, convectiveActivity, vorticity, verticalShear, cloudTopTemp, precipitation]);
    targets.push(probability);
  }

  return trainLinearRegression(features, targets, 1500, 0.003);
}

function buildStormSurgeRiskModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 1800; i++) {
    const waterLevel = randomBetween(0.5, 6.5);
    const anomaly = randomBetween(0, 3.5);
    const rateOfRise = randomBetween(0.01, 1.2);
    const waveHeight = randomBetween(0.5, 8);
    const windSpeed = randomBetween(5, 140);
    const pressure = randomBetween(960, 1015);
    const tide = randomBetween(-1, 3.5);

    const risk = clamp(
      0.28 * Math.min(1, anomaly / 3) +
      0.24 * Math.min(1, waveHeight / 8) +
      0.22 * Math.min(1, windSpeed / 140) +
      0.16 * Math.min(1, rateOfRise / 1.2) +
      0.08 * Math.min(1, Math.max(0, 3.1 - pressure) / 20) +
      0.05 * Math.min(1, (tide + 1) / 4.5) +
      randomBetween(-0.05, 0.05),
      0,
      1
    );

    features.push([waterLevel, anomaly, rateOfRise, waveHeight, windSpeed, pressure, tide]);
    targets.push(risk);
  }

  return trainLinearRegression(features, targets, 1500, 0.003);
}

function buildErosionRiskModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 1800; i++) {
    const erosionRate = randomBetween(0.1, 5.5);
    const waveEnergy = randomBetween(20, 320);
    const beachWidth = randomBetween(10, 80);
    const protectionRating = randomBetween(0.1, 0.95);
    const vegetationCover = randomBetween(0, 0.85);
    const seaLevelRise = randomBetween(0, 0.7);
    const stormFrequency = randomBetween(0, 5);

    const risk = clamp(
      0.3 * Math.min(1, erosionRate / 5.5) +
      0.25 * Math.min(1, waveEnergy / 320) +
      0.18 * Math.max(0, (50 - beachWidth) / 40) +
      0.15 * (1 - protectionRating) +
      0.07 * (1 - vegetationCover) +
      0.04 * Math.min(1, seaLevelRise / 0.7) +
      0.01 * Math.min(1, stormFrequency / 5) +
      randomBetween(-0.04, 0.04),
      0,
      1
    );

    features.push([erosionRate, waveEnergy, beachWidth, protectionRating, vegetationCover, seaLevelRise, stormFrequency]);
    targets.push(risk);
  }

  return trainLinearRegression(features, targets, 1500, 0.003);
}

function buildPollutionRiskModel() {
  const features: NumericFeatures[] = [];
  const targets: number[] = [];

  for (let i = 0; i < 1800; i++) {
    const turbidity = randomBetween(1, 60);
    const dissolvedOxygen = randomBetween(1, 10);
    const nitrate = randomBetween(0, 12);
    const phosphate = randomBetween(0, 8);
    const hydrocarbons = randomBetween(0, 12);
    const biodiversity = randomBetween(0.25, 0.95);
    const temperature = randomBetween(10, 34);

    const risk = clamp(
      0.22 * Math.min(1, turbidity / 50) +
      0.22 * Math.max(0, (8 - dissolvedOxygen) / 6) +
      0.17 * Math.min(1, nitrate / 12) +
      0.15 * Math.min(1, phosphate / 8) +
      0.14 * Math.min(1, hydrocarbons / 12) +
      0.1 * (1 - biodiversity) +
      0.05 * Math.max(0, (temperature - 22) / 12) +
      randomBetween(-0.05, 0.05),
      0,
      1
    );

    features.push([turbidity, dissolvedOxygen, nitrate, phosphate, hydrocarbons, biodiversity, temperature]);
    targets.push(risk);
  }

  return trainLinearRegression(features, targets, 1500, 0.003);
}

const temperatureModel = buildTemperatureModel();
const rainfallModel = buildRainfallModel();
const aqiModel = buildAqiModel();
const cycloneRiskModel = buildCycloneRiskModel();
const stormSurgeRiskModel = buildStormSurgeRiskModel();
const erosionRiskModel = buildErosionRiskModel();
const pollutionRiskModel = buildPollutionRiskModel();

export function predictTemperature(input: {
  month: number;
  elevation: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCover: number;
  seaSurfaceTemp: number;
  previousTemp: number;
  dayOfYear: number;
}) {
  const features = [
    input.month,
    input.elevation,
    input.humidity,
    input.pressure,
    input.windSpeed,
    input.cloudCover,
    input.seaSurfaceTemp,
    input.previousTemp,
    input.dayOfYear,
  ];

  return clamp(predictWithModel(temperatureModel, features), -20, 52);
}

export function predictRainfall(input: {
  month: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCover: number;
  temperature: number;
  elevation: number;
}) {
  const features = [
    input.month,
    input.humidity,
    input.pressure,
    input.windSpeed,
    input.cloudCover,
    input.temperature,
    input.elevation,
  ];

  return clamp(predictWithModel(rainfallModel, features), 0, 400);
}

export function predictAQI(input: {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  month: number;
}) {
  const features = [
    input.pm25,
    input.pm10,
    input.no2,
    input.so2,
    input.temperature,
    input.humidity,
    input.windSpeed,
    input.month,
  ];

  return clamp(predictWithModel(aqiModel, features), 0, 500);
}

export function predictCycloneProbability(input: {
  speed: number;
  centralPressure: number;
  seaSurfaceTemp: number;
  humidity: number;
  convectiveActivity: number;
  vorticity: number;
  verticalShear: number;
  cloudTopTemp: number;
  precipitation: number;
}) {
  const features = [
    input.speed,
    input.centralPressure,
    input.seaSurfaceTemp,
    input.humidity,
    input.convectiveActivity,
    input.vorticity,
    input.verticalShear,
    input.cloudTopTemp,
    input.precipitation,
  ];
  return clamp(predictWithModel(cycloneRiskModel, features), 0, 1);
}

export function predictStormSurgeRisk(input: {
  waterLevel: number;
  anomaly: number;
  rateOfRise: number;
  waveHeight: number;
  windSpeed: number;
  pressure: number;
  tide: number;
}) {
  const features = [
    input.waterLevel,
    input.anomaly,
    input.rateOfRise,
    input.waveHeight,
    input.windSpeed,
    input.pressure,
    input.tide,
  ];
  return clamp(predictWithModel(stormSurgeRiskModel, features), 0, 1);
}

export function predictErosionRisk(input: {
  erosionRate: number;
  waveEnergy: number;
  beachWidth: number;
  protectionRating: number;
  vegetationCover: number;
  seaLevelRise: number;
  stormFrequency: number;
}) {
  const features = [
    input.erosionRate,
    input.waveEnergy,
    input.beachWidth,
    input.protectionRating,
    input.vegetationCover,
    input.seaLevelRise,
    input.stormFrequency,
  ];
  return clamp(predictWithModel(erosionRiskModel, features), 0, 1);
}

export function predictPollutionRisk(input: {
  turbidity: number;
  dissolvedOxygen: number;
  nitrate: number;
  phosphate: number;
  hydrocarbons: number;
  biodiversity: number;
  temperature: number;
}) {
  const features = [
    input.turbidity,
    input.dissolvedOxygen,
    input.nitrate,
    input.phosphate,
    input.hydrocarbons,
    input.biodiversity,
    input.temperature,
  ];
  return clamp(predictWithModel(pollutionRiskModel, features), 0, 1);
}

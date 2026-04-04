import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../init';
import {
  predictCycloneProbability,
  predictStormSurgeRisk,
  predictErosionRisk,
  predictPollutionRisk,
  predictTemperature,
  predictRainfall,
  predictAQI,
} from '../../lib/climate-model';

// Generate realistic cyclone sensor data
function generateCycloneData(baseLocation: { lat: number; lng: number }) {
    const now = new Date();

    // Simulate a developing cyclone system
    const cycloneIntensity = Math.random(); // 0-1 scale
    const timeVariation = Math.sin(Date.now() / 10000) * 0.3; // Temporal variation

    return {
        timestamp: now.toISOString(),
        latitude: baseLocation.lat + (Math.random() - 0.5) * 0.1,
        longitude: baseLocation.lng + (Math.random() - 0.5) * 0.1,
        region: "Gujarat Coast", // Example region

        // Primary Cyclone Indicators
        centralPressure: 1013 - (cycloneIntensity * 40) + (Math.random() - 0.5) * 5, // 973-1018 hPa
        pressureTrend: -2 * cycloneIntensity + (Math.random() - 0.5) * 1.5, // hPa/hour
        seaLevelPressure: 1015 - (cycloneIntensity * 35) + (Math.random() - 0.5) * 3,

        speed: 20 + (cycloneIntensity * 150) + (Math.random() - 0.5) * 20, // 0-170 km/h
        direction: 180 + (Math.random() - 0.5) * 60, // degrees
        gusts: 25 + (cycloneIntensity * 180) + (Math.random() - 0.5) * 25, // km/h
        verticalShear: 5 + (Math.random() * 15), // m/s (lower is better for cyclones)

        seaSurfaceTemp: 26 + (cycloneIntensity * 4) + timeVariation, // 26-30°C
        waveHeight: 1 + (cycloneIntensity * 8) + (Math.random() - 0.5) * 2, // meters
        tidalLevel: 2.5 + (cycloneIntensity * 2) + Math.sin(Date.now() / 6000) * 0.8, // meters
        currentSpeed: 0.5 + (cycloneIntensity * 2), // m/s
        salinity: 35 + (Math.random() - 0.5) * 1, // psu

        temperature: 28 + (cycloneIntensity * 3) + timeVariation, // °C
        humidity: 70 + (cycloneIntensity * 25) + (Math.random() - 0.5) * 10, // %
        precipitation: cycloneIntensity * 50 + (Math.random() - 0.5) * 20, // mm/hour
        visibility: 10 - (cycloneIntensity * 8), // km
        cloudCover: 30 + (cycloneIntensity * 60), // %
        
        // Advanced Parameters for ML
        cloudTopTemp: -40 - (cycloneIntensity * 30), // °C (colder = higher clouds)
        vorticity: cycloneIntensity * 0.001, // s⁻¹
        divergence: -cycloneIntensity * 0.0005, // s⁻¹
        convectiveActivity: cycloneIntensity * 0.8, // 0-1 scale

        // Risk Assessment
        cycloneFormationProbability: Math.min(0.95, cycloneIntensity * 1.2),
        intensificationRate: cycloneIntensity > 0.6 ? (cycloneIntensity - 0.6) * 2.5 : 0,
        landfallETA: cycloneIntensity > 0.7 ? Math.round(48 - cycloneIntensity * 24) : null, // hours
        category: getCycloneCategory(20 + (cycloneIntensity * 150)),

        // Data Quality Indicators
        dataReliability: 0.85 + Math.random() * 0.15, // 0-1 scale
        lastCalibration: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 70 + Math.random() * 30, // %
        signalStrength: -50 + Math.random() * 20, // dBm
    };
}

function getCycloneCategory(windSpeed: number): number {
    if (windSpeed < 62) return 0; // Depression
    if (windSpeed < 88) return 1; // Cyclonic Storm
    if (windSpeed < 118) return 2; // Severe Cyclonic Storm
    if (windSpeed < 166) return 3; // Very Severe Cyclonic Storm
    if (windSpeed < 221) return 4; // Extremely Severe Cyclonic Storm
    return 5; // Super Cyclonic Storm
}

// Generate storm surge data
function generateStormSurgeData() {
    const intensity = Math.random();
    const timeVariation = Math.sin(Date.now() / 8000) * 0.2;
    
    return {
        timestamp: new Date().toISOString(),
        waterLevel: {
            currentLevel: 2 + (intensity * 4) + timeVariation,
            predictedLevel: 2.5 + (intensity * 5),
            anomaly: intensity * 2,
            rateOfRise: intensity * 0.5,
        },
        waves: {
            significantHeight: 1 + (intensity * 6),
            period: 8 + (intensity * 4),
        },
        meteorology: {
            windSpeed: 20 + (intensity * 80),
            atmosphericPressure: 1013 - (intensity * 30),
        },
        tidalData: {
            currentTide: Math.sin(Date.now() / 12000) * 2,
            highTide: 3.2,
            lowTide: -0.8,
        },
        surge: {
            height: intensity * 3,
            inundationDistance: intensity * 500, // meters inland
            duration: intensity * 8, // hours
        }
    };
}

// Generate coastal erosion data
function generateCoastalErosionData() {
    const erosionIntensity = Math.random();
    
    return {
        timestamp: new Date().toISOString(),
        shoreline: {
            erosionRate: 0.5 + (erosionIntensity * 2), // m/year
            beachWidth: 50 - (erosionIntensity * 20), // meters
            shorelineRetreat: erosionIntensity * 10, // meters
            sedimentLoss: erosionIntensity * 100, // cubic meters
        },
        hydrodynamics: {
            waveEnergy: 50 + (erosionIntensity * 200), // kW/m
            waveHeight: 1.5 + (erosionIntensity * 3),
            waveDirection: 180 + (Math.random() - 0.5) * 60,
        },
        geology: {
            soilType: "sandy",
            rockHardness: 3 + Math.random() * 4, // 1-7 scale
            vegetationCover: 0.8 - (erosionIntensity * 0.4), // 0-1 scale
        },
        protection: {
            naturalBarriers: {
                mangroves: 0.6 - (erosionIntensity * 0.3),
                coralReefs: 0.4 - (erosionIntensity * 0.2),
                vegetation: 0.7 - (erosionIntensity * 0.3),
            },
            artificialStructures: {
                seawalls: 0.5,
                breakwaters: 0.3,
                effectivenessRating: 0.8 - (erosionIntensity * 0.2),
            },
        },
    };
}

// Generate water pollution data
function generateWaterPollutionData() {
    const pollutionLevel = Math.random();
    
    return {
        timestamp: new Date().toISOString(),
        waterQuality: {
            pH: 7.2 + (Math.random() - 0.5) * 1.5,
            dissolvedOxygen: 8 - (pollutionLevel * 3), // mg/L
            turbidity: 5 + (pollutionLevel * 25), // NTU
            temperature: 25 + (Math.random() * 5),
            conductivity: 50000 + (pollutionLevel * 10000), // µS/cm
            salinity: 35 + (Math.random() - 0.5) * 2, // psu
        },
        chemicals: {
            nitrateLevel: pollutionLevel * 10, // mg/L
            phosphateLevel: pollutionLevel * 5, // mg/L
            hydrocarbons: pollutionLevel * 8, // mg/L
            heavyMetals: pollutionLevel * 0.5, // mg/L
            pesticides: pollutionLevel * 2, // µg/L
        },
        biological: {
            biodiversityIndex: 0.9 - (pollutionLevel * 0.4),
            phytoplanktonCount: 1000 + (pollutionLevel * 5000),
            bacterialCount: 100 + (pollutionLevel * 900),
        },
        microplastics: {
            concentration: pollutionLevel * 500, // particles/m³
            sizeDistribution: {
                small: pollutionLevel * 0.6,
                medium: pollutionLevel * 0.3,
                large: pollutionLevel * 0.1,
            },
        },
    };
}

// Calculate ML prediction scores
function calculateCyclonePrediction(data: any): number {
    return predictCycloneProbability({
        speed: data.speed,
        centralPressure: data.centralPressure,
        seaSurfaceTemp: data.seaSurfaceTemp,
        humidity: data.humidity,
        convectiveActivity: data.convectiveActivity,
        vorticity: data.vorticity,
        verticalShear: data.verticalShear,
        cloudTopTemp: data.cloudTopTemp,
        precipitation: data.precipitation,
    });
}

function calculateStormSurgePrediction(data: any): number {
    return predictStormSurgeRisk({
        waterLevel: data.waterLevel?.currentLevel,
        anomaly: data.waterLevel?.anomaly,
        rateOfRise: data.waterLevel?.rateOfRise,
        waveHeight: data.waves?.significantHeight,
        windSpeed: data.meteorology?.windSpeed,
        pressure: data.meteorology?.atmosphericPressure,
        tide: data.tidalData?.currentTide ?? 0,
    });
}

function calculateErosionPrediction(data: any): number {
    return predictErosionRisk({
        erosionRate: data.shoreline?.erosionRate,
        waveEnergy: data.hydrodynamics?.waveEnergy,
        beachWidth: data.shoreline?.beachWidth,
        protectionRating: data.protection?.artificialStructures?.effectivenessRating ?? 0.5,
        vegetationCover: data.protection?.naturalBarriers?.vegetation ?? 0.5,
        seaLevelRise: data.drivers?.seaLevelRise ?? 0,
        stormFrequency: data.drivers?.stormFrequency ?? 1,
    });
}

function calculatePollutionPrediction(data: any): number {
    return predictPollutionRisk({
        turbidity: data.waterQuality?.turbidity,
        dissolvedOxygen: data.waterQuality?.dissolvedOxygen,
        nitrate: data.chemicals?.nitrateLevel ?? 0,
        phosphate: data.chemicals?.phosphateLevel ?? 0,
        hydrocarbons: data.chemicals?.hydrocarbons ?? 0,
        biodiversity: data.biological?.biodiversityIndex ?? 0.7,
        temperature: data.waterQuality?.temperature ?? 25,
    });
}

export const predictionsRouter = createTRPCRouter({
    // Generate cyclone data with prediction
    generateCycloneData: publicProcedure
        .input(z.object({
            lat: z.number().default(22.15),
            lng: z.number().default(71.05),
        }))
        .query(async ({ input }) => {
            const data = generateCycloneData(input);
            const mlPrediction = calculateCyclonePrediction(data);
            
            return {
                ...data,
                mlPrediction,
                riskLevel: mlPrediction > 0.8 ? 'EXTREME' : 
                          mlPrediction > 0.6 ? 'HIGH' : 
                          mlPrediction > 0.4 ? 'MODERATE' : 'LOW',
                shouldTriggerAlert: mlPrediction > 0.7, // Threshold for alert generation
            };
        }),

    // Generate storm surge data with prediction
    generateStormSurgeData: publicProcedure
        .query(async () => {
            const data = generateStormSurgeData();
            const mlPrediction = calculateStormSurgePrediction(data);
            
            return {
                ...data,
                mlPrediction,
                riskLevel: mlPrediction > 0.8 ? 'EXTREME' : 
                          mlPrediction > 0.6 ? 'HIGH' : 
                          mlPrediction > 0.4 ? 'MODERATE' : 'LOW',
                shouldTriggerAlert: mlPrediction > 0.65,
            };
        }),

    // Generate coastal erosion data with prediction
    generateCoastalErosionData: publicProcedure
        .query(async () => {
            const data = generateCoastalErosionData();
            const mlPrediction = calculateErosionPrediction(data);
            
            return {
                ...data,
                mlPrediction,
                riskLevel: mlPrediction > 0.8 ? 'EXTREME' : 
                          mlPrediction > 0.6 ? 'HIGH' : 
                          mlPrediction > 0.4 ? 'MODERATE' : 'LOW',
                shouldTriggerAlert: mlPrediction > 0.6,
            };
        }),

    // Generate water pollution data with prediction
    generateWaterPollutionData: publicProcedure
        .query(async () => {
            const data = generateWaterPollutionData();
            const mlPrediction = calculatePollutionPrediction(data);
            
            return {
                ...data,
                mlPrediction,
                riskLevel: mlPrediction > 0.8 ? 'EXTREME' : 
                          mlPrediction > 0.6 ? 'HIGH' : 
                          mlPrediction > 0.4 ? 'MODERATE' : 'LOW',
                shouldTriggerAlert: mlPrediction > 0.75,
            };
        }),

    // Get all current predictions
    getAllPredictions: publicProcedure
        .query(async ({ ctx }) => {
            const cyclone = generateCycloneData({ lat: 22.15, lng: 71.05 });
            const stormSurge = generateStormSurgeData();
            const erosion = generateCoastalErosionData();
            const pollution = generateWaterPollutionData();

            const cyclonePrediction = calculateCyclonePrediction(cyclone);
            const surgePrediction = calculateStormSurgePrediction(stormSurge);
            const erosionPrediction = calculateErosionPrediction(erosion);
            const pollutionPrediction = calculatePollutionPrediction(pollution);

            return {
                cyclone: {
                    ...cyclone,
                    mlPrediction: cyclonePrediction,
                    shouldTriggerAlert: cyclonePrediction > 0.7,
                },
                stormSurge: {
                    ...stormSurge,
                    mlPrediction: surgePrediction,
                    shouldTriggerAlert: surgePrediction > 0.65,
                },
                erosion: {
                    ...erosion,
                    mlPrediction: erosionPrediction,
                    shouldTriggerAlert: erosionPrediction > 0.6,
                },
                pollution: {
                    ...pollution,
                    mlPrediction: pollutionPrediction,
                    shouldTriggerAlert: pollutionPrediction > 0.75,
                },
            };
        }),

    forecastClimateMetrics: publicProcedure
        .input(z.object({
            month: z.number().min(1).max(12).default(new Date().getMonth() + 1),
            elevation: z.number().min(0).max(4000).default(10),
            humidity: z.number().min(0).max(100).default(75),
            pressure: z.number().min(900).max(1050).default(1013),
            windSpeed: z.number().min(0).max(50).default(10),
            cloudCover: z.number().min(0).max(100).default(50),
            seaSurfaceTemp: z.number().min(-5).max(40).default(28),
            previousTemp: z.number().min(-20).max(50).default(26),
            pm25: z.number().min(0).max(500).default(35),
            pm10: z.number().min(0).max(500).default(60),
            no2: z.number().min(0).max(200).default(30),
            so2: z.number().min(0).max(150).default(8),
        }))
        .query(async ({ input }) => {
            return {
                temperature: predictTemperature({
                    month: input.month,
                    elevation: input.elevation,
                    humidity: input.humidity,
                    pressure: input.pressure,
                    windSpeed: input.windSpeed,
                    cloudCover: input.cloudCover,
                    seaSurfaceTemp: input.seaSurfaceTemp,
                    previousTemp: input.previousTemp,
                    dayOfYear: input.month * 30,
                }),
                rainfall: predictRainfall({
                    month: input.month,
                    humidity: input.humidity,
                    pressure: input.pressure,
                    windSpeed: input.windSpeed,
                    cloudCover: input.cloudCover,
                    temperature: input.previousTemp,
                    elevation: input.elevation,
                }),
                aqi: predictAQI({
                    pm25: input.pm25,
                    pm10: input.pm10,
                    no2: input.no2,
                    so2: input.so2,
                    temperature: input.previousTemp,
                    humidity: input.humidity,
                    windSpeed: input.windSpeed,
                    month: input.month,
                }),
            };
        }),
});

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from typing import Dict, List, Tuple, Any
import json

class ClimateSeverityPredictor:
    """
    Python implementation of climate prediction model with severity assessment
    """

    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_names = {}
        self.severity_thresholds = {
            'temperature': {'LOW': 20, 'MODERATE': 30, 'HIGH': 35, 'EXTREME': 40},
            'rainfall': {'LOW': 10, 'MODERATE': 50, 'HIGH': 100, 'EXTREME': 200},
            'aqi': {'LOW': 50, 'MODERATE': 100, 'HIGH': 150, 'EXTREME': 300},
            'cyclone_risk': {'LOW': 0.2, 'MODERATE': 0.4, 'HIGH': 0.6, 'EXTREME': 0.8},
            'storm_surge_risk': {'LOW': 0.15, 'MODERATE': 0.35, 'HIGH': 0.55, 'EXTREME': 0.75},
            'erosion_risk': {'LOW': 0.2, 'MODERATE': 0.4, 'HIGH': 0.6, 'EXTREME': 0.8},
            'pollution_risk': {'LOW': 0.2, 'MODERATE': 0.4, 'HIGH': 0.6, 'EXTREME': 0.8}
        }

    def generate_temperature_data(self, n_samples: int = 5000) -> Tuple[pd.DataFrame, pd.Series]:
        """Generate synthetic temperature training data"""
        np.random.seed(42)

        data = {
            'month': np.random.randint(1, 13, n_samples),
            'elevation': np.random.uniform(0, 1500, n_samples),
            'humidity': np.random.uniform(25, 95, n_samples),
            'pressure': np.random.uniform(980, 1035, n_samples),
            'wind_speed': np.random.uniform(0, 25, n_samples),
            'cloud_cover': np.random.uniform(0, 100, n_samples),
            'sea_surface_temp': np.random.uniform(22, 32, n_samples),
            'previous_temp': np.random.uniform(10, 38, n_samples),
            'day_of_year': np.random.uniform(1, 365, n_samples)
        }

        df = pd.DataFrame(data)

        # Create seasonality factor
        df['seasonality'] = np.sin((df['month'] - 1) / 12 * 2 * np.pi)

        # Generate target temperature with realistic relationships
        temperature = (
            14 +
            10 * df['seasonality'] -
            0.004 * df['elevation'] +
            0.1 * df['humidity'] -
            0.05 * (df['pressure'] - 1013) +
            0.3 * df['sea_surface_temp'] -
            0.02 * df['cloud_cover'] +
            0.18 * df['previous_temp'] +
            0.04 * df['wind_speed'] +
            np.random.normal(0, 1.5, n_samples)
        )

        targets = np.clip(temperature, -10, 52)

        features = ['month', 'elevation', 'humidity', 'pressure', 'wind_speed',
                   'cloud_cover', 'sea_surface_temp', 'previous_temp', 'day_of_year']

        return df[features], pd.Series(targets, name='temperature')

    def generate_rainfall_data(self, n_samples: int = 5000) -> Tuple[pd.DataFrame, pd.Series]:
        """Generate synthetic rainfall training data"""
        np.random.seed(43)

        data = {
            'month': np.random.randint(1, 13, n_samples),
            'humidity': np.random.uniform(30, 100, n_samples),
            'pressure': np.random.uniform(980, 1035, n_samples),
            'wind_speed': np.random.uniform(0, 25, n_samples),
            'cloud_cover': np.random.uniform(0, 100, n_samples),
            'temperature': np.random.uniform(10, 38, n_samples),
            'elevation': np.random.uniform(0, 1500, n_samples)
        }

        df = pd.DataFrame(data)

        # Seasonality and monsoon factors
        df['seasonality'] = np.maximum(0, np.sin((df['month'] - 1) / 12 * 2 * np.pi))
        df['monsoon_boost'] = np.where((df['month'] >= 6) & (df['month'] <= 9), 1.4, 1.0)

        # Generate rainfall with realistic relationships
        rainfall = (
            2.2 * df['humidity'] +
            1.8 * df['cloud_cover'] -
            1.2 * (df['pressure'] - 1013) +
            0.5 * df['wind_speed'] -
            0.1 * df['elevation'] +
            6 * df['seasonality'] * df['monsoon_boost'] +
            np.random.normal(0, 8, n_samples)
        )

        targets = np.clip(rainfall, 0, 320)

        features = ['month', 'humidity', 'pressure', 'wind_speed', 'cloud_cover', 'temperature', 'elevation']

        return df[features], pd.Series(targets, name='rainfall')

    def generate_aqi_data(self, n_samples: int = 5000) -> Tuple[pd.DataFrame, pd.Series]:
        """Generate synthetic AQI training data"""
        np.random.seed(44)

        data = {
            'pm25': np.random.uniform(5, 180, n_samples),
            'pm10': np.random.uniform(10, 220, n_samples),
            'no2': np.random.uniform(5, 120, n_samples),
            'so2': np.random.uniform(1, 70, n_samples),
            'temperature': np.random.uniform(5, 38, n_samples),
            'humidity': np.random.uniform(10, 95, n_samples),
            'wind_speed': np.random.uniform(0.5, 18, n_samples),
            'month': np.random.randint(1, 13, n_samples)
        }

        df = pd.DataFrame(data)

        # Winter factor for pollution
        df['winter_factor'] = np.where((df['month'] == 12) | (df['month'] <= 2), 1.1, 1.0)

        # Generate AQI with realistic relationships
        aqi = (
            0.55 * df['pm25'] +
            0.25 * df['pm10'] +
            0.18 * df['no2'] +
            0.12 * df['so2'] -
            0.8 * df['wind_speed'] +
            0.08 * (100 - df['humidity']) +
            0.15 * df['winter_factor'] * np.where(df['temperature'] < 10, 10, 0) +
            np.random.normal(0, 5, n_samples)
        )

        targets = np.clip(aqi, 0, 500)

        features = ['pm25', 'pm10', 'no2', 'so2', 'temperature', 'humidity', 'wind_speed', 'month']

        return df[features], pd.Series(targets, name='aqi')

    def generate_risk_data(self, risk_type: str, n_samples: int = 4000) -> Tuple[pd.DataFrame, pd.Series]:
        """Generate synthetic risk training data for various climate risks"""
        np.random.seed(45 + hash(risk_type) % 100)

        if risk_type == 'cyclone':
            data = {
                'speed': np.random.uniform(0, 180, n_samples),
                'central_pressure': np.random.uniform(960, 1015, n_samples),
                'sea_surface_temp': np.random.uniform(24, 32, n_samples),
                'humidity': np.random.uniform(45, 100, n_samples),
                'convective_activity': np.random.uniform(0, 1, n_samples),
                'vorticity': np.random.uniform(0.0001, 0.0012, n_samples),
                'vertical_shear': np.random.uniform(0, 20, n_samples),
                'cloud_top_temp': np.random.uniform(-80, -30, n_samples),
                'precipitation': np.random.uniform(0, 120, n_samples)
            }

            df = pd.DataFrame(data)

            risk = (
                0.22 * (df['speed'] / 180) +
                0.25 * np.maximum(0, (1013 - df['central_pressure']) / 60) +
                0.18 * np.maximum(0, (df['sea_surface_temp'] - 26) / 6) +
                0.15 * (df['humidity'] / 100) +
                0.12 * df['convective_activity'] +
                0.08 * np.minimum(1, df['vorticity'] / 0.0012) -
                0.09 * np.minimum(1, df['vertical_shear'] / 20) +
                0.05 * np.maximum(0, (-df['cloud_top_temp'] - 40) / 40) +
                0.02 * np.minimum(1, df['precipitation'] / 120) +
                np.random.normal(0, 0.03, n_samples)
            )

            features = list(data.keys())

        elif risk_type == 'storm_surge':
            data = {
                'water_level': np.random.uniform(0.5, 6.5, n_samples),
                'anomaly': np.random.uniform(0, 3.5, n_samples),
                'rate_of_rise': np.random.uniform(0.01, 1.2, n_samples),
                'wave_height': np.random.uniform(0.5, 8, n_samples),
                'wind_speed': np.random.uniform(5, 140, n_samples),
                'pressure': np.random.uniform(960, 1015, n_samples),
                'tide': np.random.uniform(-1, 3.5, n_samples)
            }

            df = pd.DataFrame(data)

            risk = (
                0.28 * np.minimum(1, df['anomaly'] / 3) +
                0.24 * np.minimum(1, df['wave_height'] / 8) +
                0.22 * np.minimum(1, df['wind_speed'] / 140) +
                0.16 * np.minimum(1, df['rate_of_rise'] / 1.2) +
                0.08 * np.minimum(1, np.maximum(0, 3.1 - df['pressure']) / 20) +
                0.05 * np.minimum(1, (df['tide'] + 1) / 4.5) +
                np.random.normal(0, 0.03, n_samples)
            )

            features = list(data.keys())

        elif risk_type == 'erosion':
            data = {
                'erosion_rate': np.random.uniform(0.1, 5.5, n_samples),
                'wave_energy': np.random.uniform(20, 320, n_samples),
                'beach_width': np.random.uniform(10, 80, n_samples),
                'protection_rating': np.random.uniform(0.1, 0.95, n_samples),
                'vegetation_cover': np.random.uniform(0, 0.85, n_samples),
                'sea_level_rise': np.random.uniform(0, 0.7, n_samples),
                'storm_frequency': np.random.uniform(0, 5, n_samples)
            }

            df = pd.DataFrame(data)

            risk = (
                0.3 * np.minimum(1, df['erosion_rate'] / 5.5) +
                0.25 * np.minimum(1, df['wave_energy'] / 320) +
                0.18 * np.maximum(0, (50 - df['beach_width']) / 40) +
                0.15 * (1 - df['protection_rating']) +
                0.07 * (1 - df['vegetation_cover']) +
                0.04 * np.minimum(1, df['sea_level_rise'] / 0.7) +
                0.01 * np.minimum(1, df['storm_frequency'] / 5) +
                np.random.normal(0, 0.02, n_samples)
            )

            features = list(data.keys())

        elif risk_type == 'pollution':
            data = {
                'turbidity': np.random.uniform(1, 60, n_samples),
                'dissolved_oxygen': np.random.uniform(1, 10, n_samples),
                'nitrate': np.random.uniform(0, 12, n_samples),
                'phosphate': np.random.uniform(0, 8, n_samples),
                'hydrocarbons': np.random.uniform(0, 12, n_samples),
                'biodiversity': np.random.uniform(0.25, 0.95, n_samples),
                'temperature': np.random.uniform(10, 34, n_samples)
            }

            df = pd.DataFrame(data)

            risk = (
                0.22 * np.minimum(1, df['turbidity'] / 50) +
                0.22 * np.maximum(0, (8 - df['dissolved_oxygen']) / 6) +
                0.17 * np.minimum(1, df['nitrate'] / 12) +
                0.15 * np.minimum(1, df['phosphate'] / 8) +
                0.14 * np.minimum(1, df['hydrocarbons'] / 12) +
                0.1 * (1 - df['biodiversity']) +
                0.05 * np.maximum(0, (df['temperature'] - 22) / 12) +
                np.random.normal(0, 0.03, n_samples)
            )

            features = list(data.keys())

        targets = np.clip(risk, 0, 1)

        return df[features], pd.Series(targets, name=f'{risk_type}_risk')

    def train_model(self, X: pd.DataFrame, y: pd.Series, model_name: str) -> Dict[str, Any]:
        """Train a linear regression model with scaling"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train model
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        # Store model and scaler
        self.models[model_name] = model
        self.scalers[model_name] = scaler
        self.feature_names[model_name] = X.columns.tolist()

        return {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'feature_importance': dict(zip(X.columns, np.abs(model.coef_)))
        }

    def train_all_models(self) -> Dict[str, Any]:
        """Train all climate prediction models"""
        results = {}

        # Train temperature model
        print("Training temperature model...")
        X_temp, y_temp = self.generate_temperature_data()
        results['temperature'] = self.train_model(X_temp, y_temp, 'temperature')

        # Train rainfall model
        print("Training rainfall model...")
        X_rain, y_rain = self.generate_rainfall_data()
        results['rainfall'] = self.train_model(X_rain, y_rain, 'rainfall')

        # Train AQI model
        print("Training AQI model...")
        X_aqi, y_aqi = self.generate_aqi_data()
        results['aqi'] = self.train_model(X_aqi, y_aqi, 'aqi')

        # Train risk models
        risk_types = ['cyclone', 'storm_surge', 'erosion', 'pollution']
        for risk_type in risk_types:
            print(f"Training {risk_type} risk model...")
            X_risk, y_risk = self.generate_risk_data(risk_type)
            results[f'{risk_type}_risk'] = self.train_model(X_risk, y_risk, f'{risk_type}_risk')

        return results

    def predict(self, model_name: str, features: Dict[str, float]) -> float:
        """Make prediction with trained model"""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not trained")

        # Prepare features in correct order
        feature_order = self.feature_names[model_name]
        feature_values = [features[feat] for feat in feature_order]

        # Scale and predict
        scaled_features = self.scalers[model_name].transform([feature_values])
        prediction = self.models[model_name].predict(scaled_features)[0]

        return float(prediction)

    def predict_severity(self, model_name: str, features: Dict[str, float]) -> Dict[str, Any]:
        """Predict value and determine severity level"""
        prediction = self.predict(model_name, features)

        thresholds = self.severity_thresholds[model_name]

        if model_name in ['cyclone_risk', 'storm_surge_risk', 'erosion_risk', 'pollution_risk']:
            # Probability-based severity
            if prediction >= thresholds['EXTREME']:
                severity = 'EXTREME'
            elif prediction >= thresholds['HIGH']:
                severity = 'HIGH'
            elif prediction >= thresholds['MODERATE']:
                severity = 'MODERATE'
            else:
                severity = 'LOW'
        else:
            # Value-based severity
            if prediction >= thresholds['EXTREME']:
                severity = 'EXTREME'
            elif prediction >= thresholds['HIGH']:
                severity = 'HIGH'
            elif prediction >= thresholds['MODERATE']:
                severity = 'MODERATE'
            else:
                severity = 'LOW'

        return {
            'prediction': prediction,
            'severity': severity,
            'confidence': min(0.95, max(0.5, 1 - abs(prediction - thresholds[severity.lower()]) / max(prediction, 0.1)))
        }

    def save_models(self, filepath: str = 'climate_models.pkl'):
        """Save trained models to file"""
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'feature_names': self.feature_names,
            'severity_thresholds': self.severity_thresholds
        }
        joblib.dump(model_data, filepath)
        print(f"Models saved to {filepath}")

    def load_models(self, filepath: str = 'climate_models.pkl'):
        """Load trained models from file"""
        if os.path.exists(filepath):
            model_data = joblib.load(filepath)
            self.models = model_data['models']
            self.scalers = model_data['scalers']
            self.feature_names = model_data['feature_names']
            self.severity_thresholds = model_data.get('severity_thresholds', self.severity_thresholds)
            print(f"Models loaded from {filepath}")
            return True
        return False

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about trained models"""
        return {
            'available_models': list(self.models.keys()),
            'feature_names': self.feature_names,
            'severity_thresholds': self.severity_thresholds
        }


def main():
    """Main function to train and test the climate model"""
    predictor = ClimateSeverityPredictor()

    # Try to load existing models
    if not predictor.load_models():
        print("Training new models...")
        results = predictor.train_all_models()

        # Save results
        with open('model_training_results.json', 'w') as f:
            json.dump(results, f, indent=2)

        predictor.save_models()

    # Example predictions
    print("\n=== Climate Severity Predictions ===")

    # Temperature prediction
    temp_input = {
        'month': 7,
        'elevation': 100,
        'humidity': 75,
        'pressure': 1010,
        'wind_speed': 10,
        'cloud_cover': 60,
        'sea_surface_temp': 28,
        'previous_temp': 30,
        'day_of_year': 200
    }

    temp_result = predictor.predict_severity('temperature', temp_input)
    print(f"Temperature: {temp_result['prediction']:.1f}°C (Severity: {temp_result['severity']})")

    # AQI prediction
    aqi_input = {
        'pm25': 45,
        'pm10': 75,
        'no2': 35,
        'so2': 12,
        'temperature': 28,
        'humidity': 65,
        'wind_speed': 8,
        'month': 7
    }

    aqi_result = predictor.predict_severity('aqi', aqi_input)
    print(f"AQI: {aqi_result['prediction']:.0f} (Severity: {aqi_result['severity']})")

    # Cyclone risk prediction
    cyclone_input = {
        'speed': 120,
        'central_pressure': 980,
        'sea_surface_temp': 29,
        'humidity': 85,
        'convective_activity': 0.8,
        'vorticity': 0.0008,
        'vertical_shear': 8,
        'cloud_top_temp': -60,
        'precipitation': 80
    }

    cyclone_result = predictor.predict_severity('cyclone_risk', cyclone_input)
    print(f"Cyclone Risk: {cyclone_result['prediction']:.3f} (Severity: {cyclone_result['severity']})")


if __name__ == "__main__":
    main()</content>
<parameter name="filePath">d:\CE\Sem 7\FRONTEND\climate_model.py
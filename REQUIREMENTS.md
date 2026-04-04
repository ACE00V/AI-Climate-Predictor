# Coastal Threats Monitoring System - Requirements

## Project Overview
A real-time coastal disaster monitoring & alert system tracking:
- **Cyclones**
- **Storm Surge**
- **Coastal Erosion**
- **Water Pollution**

Currently: Mock ML predictions with in-memory caching
Target: Live data + real ML model integration

---

## CURRENT STATE REQUIREMENTS

### ✅ Already Implemented
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Kinde (OAuth2)
- **Real-time System**: WebSocket for live updates
- **Notifications**: Email (Nodemailer) + SMS (Vonage)
- **API Framework**: tRPC + Next.js API routes
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **File Uploads**: UploadThing integration
- **Monitoring**: Alert generation, approval workflow, subscriptions by state/city

### 📋 To Run the Project Now:

#### Prerequisites:
1. **Node.js** 18+ & npm/yarn
2. **PostgreSQL** database running locally (port 5432)
3. **Git** (if cloning)

#### Environment Setup:
```bash
# 1. Install dependencies
npm install

# 2. Setup .env.local (already exists, needs credentials):
DATABASE_URL="postgresql://postgres:root@localhost:5432/coastal_threats"
KINDE_CLIENT_ID=<your-kinde-id>
KINDE_CLIENT_SECRET=<your-kinde-secret>
# ... other services (optional for now)

# 3. Database initialization
npm run prisma generate
npm run prisma migrate dev

# 4. Run development server
npm run dev

# Server: http://localhost:3000
```

#### Current Mock Data Flow:
```
API Endpoint (/api/ml-predictions/predict)
    ↓
generatePrediction() [Mock Algorithm]
    ↓
Random factors + fake thresholds
    ↓
In-memory cache (Map)
    ↓
Frontend display
```

---

## INTEGRATION REQUIREMENTS FOR REAL MODEL

### Phase 1: Single Real Model Integration (Start Here)

#### Choose ONE of these approaches:

**Option A: OpenAI GPT-based Predictions** (Easiest)
- Cost: Pay-per-call ($0.001-0.01 per request)
- Speed: ~2-5 seconds per prediction
- Setup: Just add `OPENAI_API_KEY`
- Pros: Pre-trained, zero setup, handles all threat types
- Cons: Cloud dependency, API costs

**Option B: Hugging Face Model** (Most Flexible)
- Cost: Free tier available, $9-15/month for production
- Speed: ~1-3 seconds per prediction
- Setup: Model ID + API key
- Pros: Can use specific trained models, edge deployment possible
- Cons: Need model selection, inference API rate limits

**Option C: Local Python ML Service** (Most Control)
- Cost: Free (just compute)
- Speed: <1 second (local processing)
- Setup: Python backend + Docker
- Pros: No API calls, full control, scalable
- Cons: More complex setup, need ML model trained

**Option D: Custom REST API** (Most Integration-Friendly)
- Cost: Depends on your infrastructure
- Speed: Variable
- Setup: Point to your ML service endpoint
- Pros: Decoupled, language-agnostic
- Cons: You maintain backend

---

### Data Flow Architecture

```
Current (Mock):
Frontend Request
    ↓ POST /api/ml-predictions
API Route (Next.js)
    ↓ generatePrediction()
In-memory Map
    ↓ Cache
Frontend
```

**New (Real Model):**
```
Frontend Request + Input Data
    ↓ POST /api/ml-predictions
API Route (Next.js)
    ↓ Format input features
ML Model (External/Local)
    ↓ Get prediction score
    ↓ Alert threshold check
Database (Prisma)
    ↓ Store Alert record
WebSocket
    ↓ Broadcast to subscribed users
Frontend Update
```

---

## THREAT-SPECIFIC DATA REQUIREMENTS

### 1. **Cyclone Prediction Model**
#### Input Features:
```json
{
  "latitude": 21.5,
  "longitude": 68.9,
  "seaSurfaceTemperature": 27.5,      // °C (ideal: >26)
  "atmosphericPressure": 990,          // hPa (ideal: <1000)
  "windSpeed": 45,                     // km/h
  "windShear": 8,                      // m/s (ideal: <10)
  "humidity": 78,                      // % (ideal: >70)
  "convecticePrecipitation": 5,        // mm/hour
  "dayOfYear": 180,                    // 1-365
  "historicalCycloneFreq": 0.15        // 0-1
}
```
#### Output:
```json
{
  "cycloneProbability": 0.78,          // 0-1 score
  "riskLevel": "HIGH",                 // LOW/MODERATE/HIGH/EXTREME
  "confidence": 0.92,
  "predictedIntensity": "Category-3"
}
```

### 2. **Storm Surge Prediction Model**
#### Input Features:
```json
{
  "latitude": 21.5,
  "longitude": 68.9,
  "tideHeight": 1.2,                   // meters above MSL
  "windSpeed": 65,                     // km/h from cyclone
  "stormPressre": 980,                 // hPa
  "coastalElevation": -2,              // meters (negative = below sea level)
  "coastalProtection": 0.6,            // 0-1, infrastructure rating
  "historicalSurgeFreq": 0.08          // 0-1
}
```
#### Output:
```json
{
  "surgeHeightPrediction": 3.4,        // meters
  "surgeProbability": 0.85,
  "affectedAreaKm": 250,
  "potentialDamage": "SEVERE"
}
```

### 3. **Coastal Erosion Prediction Model**
#### Input Features:
```json
{
  "latitude": 21.5,
  "longitude": 68.9,
  "monthlyWaveHeight": 1.8,            // meters
  "averageWaveDirection": 45,          // degrees
  "soilType": "sandy",                 // sandy/clayey/rocky
  "beachWidth": 80,                    // meters
  "humanInstervention": 0.4,           // 0-1, seawall/protection rating
  "historicalErosionRate": 0.8,        // meters/year
  "seasonality": 0.3                   // 0-1, monsoon impact
}
```
#### Output:
```json
{
  "erosionRateNext30Days": 1.2,        // meters
  "erosionRisk": "MODERATE",
  "affectedPopulation": 5000,
  "recommendation": "Build protective barriers"
}
```

### 4. **Water Pollution Prediction Model**
#### Input Features:
```json
{
  "latitude": 21.5,
  "longitude": 68.9,
  "waterTemperature": 28,              // °C
  "dissolvedOxygen": 4.2,              // mg/L
  "pH": 7.8,
  "turbidity": 12,                     // NTU
  "nitrogenLevel": 8,                  // mg/L
  "phosphorousLevel": 1.2,             // mg/L
  "bacterialCount": 15000,             // CFU/mL
  "industrialOutlets": 3,              // count nearby
  "urbanRunoff": 0.7                   // 0-1 proximity
}
```
#### Output:
```json
{
  "pollutionIndex": 72,                // 0-100
  "healthRisk": "MODERATE",
  "treatmentRequired": true,
  "mainPollutant": "Nitrogen"
}
```

---

## FUTURE REQUIREMENTS (Phase 2-5)

### Phase 2: Multi-Model Integration
- Deploy 4 separate specialized models (one per threat)
- Model training pipeline with real historical data
- Model versioning & A/B testing capability
- Separate services for each threat type

### Phase 3: Data Enhancement
- **Real Data Sources**:
  - Weather APIs: OpenWeatherMap, NOAA, IMD (Indian Meteorological Department)
  - Satellite data: NASA FIRMS, Copernicus
  - Oceanographic APIs: GEBCO, Copernicus Marine
  - Sensor networks: IoT devices on coast
  
- **Database Scaling**:
  - Redis caching for 24-hour predictions
  - TimescaleDB for time-series data
  - Archive old alerts to separate storage

### Phase 4: Advanced Features
- **Ensemble Predictions**: Combine multiple models
- **Uncertainty Quantification**: Confidence intervals
- **Real-time Refinement**: Update predictions with live sensor data
- **Geographic Interpolation**: Create heatmaps from point predictions
- **Alert Prioritization**: Combine multiple threat signals

### Phase 5: Production Deployment
- Microservices architecture: Separate services per threat
- Kubernetes orchestration
- CI/CD pipeline with automated model retraining
- Monitoring & alerting for model performance
- Disaster recovery & failover
- SLA for alert delivery (<2 min response)

---

## RUNNING THE PROJECT - QUICK START

### Step 1: Minimal Setup (Dev Mode)
```bash
# Install
npm install

# Database (create if not exists)
# PostgreSQL: CREATE DATABASE coastal_threats;

# Database migrations
npx prisma migrate dev

# Start
npm run dev
```

### Step 2: Connect to Mock Service
- Already baked in, just visit http://localhost:3000
- Mock predictions work at `/api/ml-predictions`
- Test CSV export at `/csv-generator`

### Step 3: Optional - Add Real Backend Services
```bash
# Only add if you want notifications
# Email: Setup Gmail app password in .env.local
# SMS: Get Vonage API keys in .env.local
# Auth: Setup Kinde OAuth in .env.local
```

---

## RECOMMENDED NEXT STEPS

1. ✅ **Get it running**: Use npm run dev (mock mode works)
2. 🔧 **Debug & Test**: Verify all pages load
3. 📊 **Choose Model**: Pick Option A/B/C/D above
4. 🚀 **Integrate First Model**: Update `/api/ml-predictions/route.ts`
5. 🔄 **Add Real Data**: Connect to one data source (weather API)
6. 📈 **Scale**: Add remaining 3 models + real data sources

---

## Tech Stack Summary
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, tRPC, Node.js
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: WebSocket
- **Auth**: Kinde OAuth2
- **Notifications**: Nodemailer + Vonage SMS
- **ML**: To be integrated (OpenAI/HF/Local)
- **Deployment**: Ready for Vercel/Docker

"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTRPC } from "@/trpc/client"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import ProfileDropdown from "@/components/auth/ProfileDropdown"
import Link from "next/link"
import {
  Waves,
  Wind,
  Shield,
  MapPin,
  AlertTriangle,
  Activity,
  Globe,
  Zap,
  TrendingUp,
  Bell,
  Settings,
  Eye,
  RefreshCw,
  ArrowLeft,
  Brain,
  Satellite,
  Users,
  CheckCircle,
  XCircle,
  Sparkles,
  Thermometer,
  Cloud,
  Leaf
} from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSubscription, } from "@trpc/tanstack-react-query"
import dynamic from "next/dynamic";
import { regions } from "@/lib/regions"

const DynamicAlertsMap = dynamic(() => import("@/components/AlertsMap"), { ssr: false });

const dashboardTheme = {
  primary: "green",
  primaryText: "text-green-400",
  primaryTextHover: "hover:text-green-300",
  primaryBg: "bg-green-400/10",
  primaryBorder: "border-green-400/20",
  primaryBadge: "bg-green-500/20 text-green-300 border-green-400/30",
  primaryAccent: "from-green-400/15 to-teal-500/8"
};

type TemperatureData = {
  current: number
  today_high: number
  today_low: number
  forecast_24h: number
  anomaly: number
  heat_stress_index: number
  lat: number
  lng: number
  ml_pred?: { val: number | null }
}

type CO2Data = {
  current_ppm: number
  monthly_average: number
  yearly_trend: number
  status: "SAFE" | "ELEVATED" | "CRITICAL"
  ml_pred?: { val: number | null }
}

type ExtremeWeatherData = {
  wind_speed: number
  wind_gust: number
  precipitation_probability: number
  precipitation_amount: number
  storm_risk: number
  hail_risk: number
  flood_risk: number
  drought_risk: number
  threat_level: "LOW" | "MODERATE" | "HIGH" | "EXTREME"
  lat: number
  lng: number
  ml_pred?: { val: number | null }
}

type AirQualityData = {
  aqi: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  co: number
  so2: number
  health_impact: string
  lat: number
  lng: number
  ml_pred?: { val: number | null }
}

// Helper functions for alert generation
function getAlertType(pred: any): 'HEAT_WAVE' | 'EXTREME_COLD' | 'SEVERE_WEATHER' | 'POOR_AIR_QUALITY' {
  if (pred.heat_stress_index !== undefined) return 'HEAT_WAVE'
  if (pred.threat_level !== undefined) return 'SEVERE_WEATHER'
  if (pred.aqi !== undefined) return 'POOR_AIR_QUALITY'
  return 'SEVERE_WEATHER'
}

function getAlertTitle(pred: any): string {
  const type = getAlertType(pred)
  const risk = pred.ml_pred?.val > 0.85 ? 'Extreme' : pred.ml_pred?.val > 0.75 ? 'High' : 'Moderate'

  switch (type) {
    case 'HEAT_WAVE':
      return `${risk} Heat Wave Alert`
    case 'EXTREME_COLD':
      return `${risk} Cold Snap Warning`
    case 'SEVERE_WEATHER':
      return `${risk} Severe Weather Expected`
    case 'POOR_AIR_QUALITY':
      return `${risk} Air Quality Degradation`
    default:
      return `${risk} Climate Threat Alert`
  }
}

function getAlertDescription(pred: any): string {
  const confidence = Math.round((pred.ml_pred?.val || 0) * 100)
  const type = getAlertType(pred)

  switch (type) {
    case 'HEAT_WAVE':
      return `Heat stress alert with ${confidence}% ML confidence. Expected high: ${pred.today_high?.toFixed(1)}°C, heat stress index: ${pred.heat_stress_index?.toFixed(1)}, temperature anomaly: +${pred.anomaly?.toFixed(1)}°C above normal.`
    case 'EXTREME_COLD':
      return `Cold snap warning with ${confidence}% ML confidence. Expected low: ${pred.today_low?.toFixed(1)}°C, significant departure from seasonal norm.`
    case 'SEVERE_WEATHER':
      return `Severe weather risk: ${confidence}% probability. Wind gusts: ${pred.wind_gust?.toFixed(1)} km/h, precipitation: ${pred.precipitation_amount?.toFixed(1)}mm, flood risk: ${pred.flood_risk?.toFixed(0)}%.`
    case 'POOR_AIR_QUALITY':
      return `Air quality degradation alert with ${confidence}% confidence. AQI: ${pred.aqi}, PM2.5: ${pred.pm25?.toFixed(1)} µg/m³, health impact: ${pred.health_impact}.`
    default:
      return `Climate threat detected with ${confidence}% confidence based on sensor data.`
  }
}

function ClientTimeDisplay() {
  const [time, setTime] = React.useState<string>("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="text-white/60 text-sm">
        Last updated: --:--:--
      </div>
    )
  }

  return (
    <motion.div
      className="text-white/60 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Last updated: {time}
    </motion.div>
  )
}

function Stat({
  label,
  value,
  suffix,
  good,
}: { label: string; value: number | string; suffix?: string; good?: boolean }) {
  const isNumber = typeof value === "number"
  const formatted = isNumber ? (value as number).toLocaleString(undefined, { maximumFractionDigits: 2 }) : value
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", good === true && "text-emerald-700", good === false && "text-red-600")}>
        {formatted}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </div>
  )
}

function TinySpark({ data, dataKey = "y" }: { data: any[]; dataKey?: string }) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <XAxis dataKey="x" hide />
          <YAxis hide />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-balance text-blue-900">{title}</CardTitle>
      {badge ? <Badge className="bg-blue-600 hover:bg-blue-700">{badge}</Badge> : null}
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
      {/* Coastal gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <motion.div
              className="text-2xl font-bold text-blue-400 relative flex items-center gap-3"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowLeft className="h-6 w-6" />
           Dashboard
              <motion.div
                className="absolute -inset-2 bg-blue-400/15 rounded-lg blur-sm -z-10"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>
        </nav>
      </motion.header>

      {/* Loading Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Coastal Risk <span className="text-blue-400">Live Dashboard</span>
          </h1>
          <p className="text-white/80 text-lg mb-8">Connecting to real-time monitoring streams...</p>

          <motion.div
            className="flex items-center justify-center gap-2 text-blue-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Establishing WebSocket connections</span>
          </motion.div>
        </motion.div>

        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="h-48 bg-blue-400/10 rounded-lg border border-blue-400/20 backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  // Ensure client-side hydration
  React.useEffect(() => {
    setMounted(true)

    // Prevent MetaMask auto-connection
    if (typeof window !== 'undefined') {
      // Override ethereum detection to prevent MetaMask auto-connect
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: false,
        configurable: false
      })
    }
  }, [])

  // tRPC setup
  const trpc = useTRPC()

  const mapData = useQuery({
    ...trpc.alerts.getApprovedAlerts.queryOptions({
      limit: 50,
    }),
  })
  // Real-time data states
  const [temperatureData, setTemperatureData] = React.useState<TemperatureData | null>(null)
  const [co2Data, setCO2Data] = React.useState<CO2Data | null>(null)
  const [extremeWeatherData, setExtremeWeatherData] = React.useState<ExtremeWeatherData | null>(null)
  const [airQualityData, setAirQualityData] = React.useState<AirQualityData | null>(null)

  // History for charts
  const [history, setHistory] = React.useState<{
    temperature: TemperatureData[]
    co2: CO2Data[]
    extremeWeather: ExtremeWeatherData[]
    airQuality: AirQualityData[]
  }>({
    temperature: [],
    co2: [],
    extremeWeather: [],
    airQuality: [],
  })

  // Alert mutation setup
  const alertMutation = useMutation({ ...trpc.alerts.createAlert.mutationOptions(), onError: (e) => console.log(e) });

  // Subscribe to temperature data using tRPC useSubscription
  useSubscription({
    ...trpc.cysub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newTemperatureData: TemperatureData = {
        current: data.current,
        today_high: data.today_high,
        today_low: data.today_low,
        forecast_24h: data.forecast_24h,
        anomaly: data.anomaly,
        heat_stress_index: data.heat_stress_index,
        lat: data.lat,
        lng: data.lng,
        ml_pred: data.ml_pred
      }
      setTemperatureData(newTemperatureData)
      setHistory(prev => ({
        ...prev,
        temperature: [...prev.temperature, newTemperatureData].slice(-60)
      }))

      // Check for heat wave conditions
      const mlConfidence = newTemperatureData.ml_pred?.val || 0
      const heatStress = newTemperatureData.heat_stress_index > 80
      const anomalyRisk = newTemperatureData.anomaly > 3

      if (mlConfidence > 0.7 || heatStress || anomalyRisk) {
        const severity = heatStress || newTemperatureData.heat_stress_index > 90 ? "EXTREME" :
          mlConfidence > 0.75 ? "HIGH" : "MODERATE"

        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "HEAT_WAVE",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Heat Wave Alert`,
            description: `Heat stress alert with ${Math.round(mlConfidence * 100)}% ML confidence. Expected high: ${newTemperatureData.today_high.toFixed(1)}°C, heat stress index: ${newTemperatureData.heat_stress_index.toFixed(1)}, temperature anomaly: +${newTemperatureData.anomaly.toFixed(1)}°C above normal.`,
            region: data.region || "Regional Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newTemperatureData,
              riskFactors: {
                heatStress,
                anomalyRisk,
                mlConfidence,
                forecast_24h: newTemperatureData.forecast_24h
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || newTemperatureData.lat,
              lng: data.lng || newTemperatureData.lng,
            }
          })
        }
      }
    },
    onError: (err: any) => console.error('Temperature subscription error:', err),
  })
  // Subscribe to CO2 data using tRPC useSubscription
  useSubscription({
    ...trpc.pollsub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newCO2Data: CO2Data = {
        current_ppm: data.current_ppm,
        monthly_average: data.monthly_average,
        yearly_trend: data.yearly_trend,
        status: data.status,
        ml_pred: data.ml_pred
      }
      setCO2Data(newCO2Data)
      setHistory(prev => ({
        ...prev,
        co2: [...prev.co2, newCO2Data].slice(-60)
      }))

      // Check for elevated CO2 levels
      const mlConfidence = Math.min(0.95, Math.max(0.5, (data.current_ppm - 400) / 100))
      const isCritical = data.status === "CRITICAL"
      const isElevated = data.status === "ELEVATED"

      if (mlConfidence > 0.7 || isCritical || isElevated) {
        const severity = isCritical ? "HIGH" : "MODERATE"

        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "POOR_AIR_QUALITY",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} CO2 Level Alert`,
            description: `CO2 levels detected with ${Math.round(mlConfidence * 100)}% confidence. Current: ${newCO2Data.current_ppm.toFixed(1)} ppm, monthly average: ${newCO2Data.monthly_average.toFixed(1)} ppm, yearly trend: ${newCO2Data.yearly_trend > 0 ? '+' : ''}${newCO2Data.yearly_trend.toFixed(2)} ppm/year. Status: ${newCO2Data.status.replace('_', ' ')}.`,
            region: data.region || "Global",
            state: data.state || "Atmosphere",
            predictionData: {
              ...data,
              processedData: newCO2Data,
              riskFactors: {
                isCritical,
                isElevated,
                mlConfidence,
                current_ppm: newCO2Data.current_ppm,
                trending: newCO2Data.yearly_trend
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || 0,
              lng: data.lng || 0,
            }
          })
        }
      }
    },
    onError: (err: any) => console.error('CO2 subscription error:', err),
  })

  // Subscribe to extreme weather data using tRPC useSubscription
  useSubscription({
    ...trpc.surgesub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newExtremeWeatherData: ExtremeWeatherData = {
        wind_speed: data.wind_speed,
        wind_gust: data.wind_gust,
        precipitation_probability: data.precipitation_probability,
        precipitation_amount: data.precipitation_amount,
        storm_risk: data.storm_risk,
        hail_risk: data.hail_risk,
        flood_risk: data.flood_risk,
        drought_risk: data.drought_risk,
        threat_level: data.threat_level,
        lat: data.lat,
        lng: data.lng,
        ml_pred: data.ml_pred
      }
      setExtremeWeatherData(newExtremeWeatherData)
      setHistory(prev => ({
        ...prev,
        extremeWeather: [...prev.extremeWeather, newExtremeWeatherData].slice(-60)
      }))

      // Check for severe weather conditions
      const mlConfidence = newExtremeWeatherData.ml_pred?.val || 0
      const isStormyCondition = newExtremeWeatherData.storm_risk > 70 || newExtremeWeatherData.wind_gust > 80
      const isFloodRisk = newExtremeWeatherData.flood_risk > 70 || newExtremeWeatherData.precipitation_amount > 50

      if (mlConfidence > 0.7 || isStormyCondition || isFloodRisk) {
        const severity = newExtremeWeatherData.threat_level === "EXTREME" ? "EXTREME" :
          newExtremeWeatherData.threat_level === "HIGH" ? "HIGH" : "MODERATE"

        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "SEVERE_WEATHER",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Severe Weather Expected`,
            description: `Severe weather alert with ${Math.round(mlConfidence * 100)}% ML confidence. Wind gusts: ${newExtremeWeatherData.wind_gust.toFixed(1)} km/h, precipitation probability: ${newExtremeWeatherData.precipitation_probability.toFixed(0)}%, expected amount: ${newExtremeWeatherData.precipitation_amount.toFixed(1)}mm, flood risk: ${newExtremeWeatherData.flood_risk.toFixed(0)}%, storm risk: ${newExtremeWeatherData.storm_risk.toFixed(0)}%.`,
            region: data.region || "Regional Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newExtremeWeatherData,
              riskFactors: {
                isStormyCondition,
                isFloodRisk,
                mlConfidence,
                storm_risk: newExtremeWeatherData.storm_risk,
                hail_risk: newExtremeWeatherData.hail_risk,
                drought_risk: newExtremeWeatherData.drought_risk
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || newExtremeWeatherData.lat,
              lng: data.lng || newExtremeWeatherData.lng,
            }
          })
        }
      }
    },
    onError: (err: any) => console.error('Extreme weather subscription error:', err),
  })

  // Subscribe to air quality data using tRPC useSubscription
  useSubscription({
    ...trpc.coastalsub.onLiveData.subscriptionOptions(),
    onData: (response: any) => {
      const data = response?.data || response
      const newAirQualityData: AirQualityData = {
        aqi: data.aqi,
        pm25: data.pm25,
        pm10: data.pm10,
        no2: data.no2,
        o3: data.o3,
        co: data.co,
        so2: data.so2,
        health_impact: data.health_impact,
        lat: data.lat,
        lng: data.lng,
        ml_pred: data.ml_pred
      }
      setAirQualityData(newAirQualityData)
      setHistory(prev => ({
        ...prev,
        airQuality: [...prev.airQuality, newAirQualityData].slice(-60)
      }))

      // Check for poor air quality
      const mlConfidence = Math.min(0.95, Math.max(0.5, data.aqi / 300))
      const isPoorAQI = data.aqi > 150
      const isUnhealthyPM25 = data.pm25 > 55.4

      if (mlConfidence > 0.7 || isPoorAQI || isUnhealthyPM25) {
        const severity = isPoorAQI && data.aqi > 250 ? "EXTREME" :
          isPoorAQI ? "HIGH" : "MODERATE"

        if (mlConfidence > 0.7) {
          alertMutation.mutate({
            type: "POOR_AIR_QUALITY",
            severity: severity as "HIGH" | "MODERATE" | "LOW" | "EXTREME",
            title: `${severity} Air Quality Alert`,
            description: `Poor air quality detected with ${Math.round(mlConfidence * 100)}% ML confidence. AQI: ${newAirQualityData.aqi}, PM2.5: ${newAirQualityData.pm25.toFixed(1)} µg/m³, PM10: ${newAirQualityData.pm10.toFixed(1)} µg/m³, NO2: ${newAirQualityData.no2.toFixed(1)} ppb. Health impact: ${newAirQualityData.health_impact}.`,
            region: data.region || "Urban Area",
            state: data.state || "Unknown",
            predictionData: {
              ...data,
              processedData: newAirQualityData,
              riskFactors: {
                isPoorAQI,
                isUnhealthyPM25,
                mlConfidence,
                aqi: newAirQualityData.aqi,
                pollutants: {
                  no2: newAirQualityData.no2,
                  o3: newAirQualityData.o3,
                  so2: newAirQualityData.so2
                }
              }
            },
            mlPrediction: mlConfidence,
            coordinates: {
              lat: data.lat || newAirQualityData.lat,
              lng: data.lng || newAirQualityData.lng,
            }
          })
        }
      }
    },
    onError: (err: any) => console.error('Air quality subscription error:', err),
  })

  // Create spark chart data
  const temperatureSpark = history.temperature.map((d, i) => ({ x: i, y: d?.current || 0 }))
  const co2Spark = history.co2.map((d, i) => ({ x: i, y: d?.current_ppm || 0 }))
  const weatherSpark = history.extremeWeather.map((d, i) => ({ x: i, y: d?.wind_speed || 0 }))
  const qualitySpark = history.airQuality.map((d, i) => ({ x: i, y: d?.aqi || 0 }))

  // Show loading state while waiting for subscription data
  if (!temperatureData || !co2Data || !extremeWeatherData || !airQualityData) {
    return <LoadingDashboard />
  }

  const temperature = temperatureData
  const co2 = co2Data
  const extremeWeather = extremeWeatherData
  const airQuality = airQualityData




  return (
    <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
      {/* Coastal gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-blue-900/20 to-[#020E0E]" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-cyan-500/20 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 30, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-teal-400/15 to-blue-500/8 rounded-full blur-2xl"
          animate={{
            x: [0, 40, -40, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        {/* Floating coastal particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <motion.div
              className={`text-2xl font-bold ${dashboardTheme.primaryText} relative flex items-center gap-3 cursor-pointer ${dashboardTheme.primaryTextHover}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowLeft className="h-6 w-6" />
             Dashboard
              <motion.div
                className="absolute -inset-2 bg-blue-400/15 rounded-lg blur-sm -z-10"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <motion.div
              className={`flex items-center gap-2 ${dashboardTheme.primaryText}`}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm">System Online</span>
            </motion.div>

            <ClientTimeDisplay />

            {!isLoading && isAuthenticated && <ProfileDropdown />}
          </div>
        </nav>
      </motion.header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">


        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className={`bg-green-400/10 backdrop-blur-xl border ${dashboardTheme.primaryBorder} p-1`}>
              <TabsTrigger
                value="overview"
                className={`data-[state=active]:bg-green-400/20 data-[state=active]:text-white ${dashboardTheme.primaryText} transition-all duration-300`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Climate Metrics
              </TabsTrigger>
              <TabsTrigger
                value="generated-alerts"
                className={`data-[state=active]:bg-green-400/20 data-[state=active]:text-white ${dashboardTheme.primaryText} transition-all duration-300`}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Predictions
              </TabsTrigger>
              <TabsTrigger
                value="approved-alerts"
                className={`data-[state=active]:bg-green-400/20 data-[state=active]:text-white ${dashboardTheme.primaryText} transition-all duration-300`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Climate Alerts
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className={`data-[state=active]:bg-green-400/20 data-[state=active]:text-white ${dashboardTheme.primaryText} transition-all duration-300`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Threat Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real-time Monitoring Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {/* Temperature Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Card className="bg-gradient-to-br from-blue-400/15 to-cyan-400/8 backdrop-blur-xl border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-blue-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <Thermometer className="w-5 h-5 text-blue-400" />
                          </motion.div>
                          Temperature
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (temperature?.ml_pred?.val || 0) > 0.7 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                        )}>
                          {temperature?.ml_pred?.val ? `${Math.round((temperature.ml_pred.val as number) * 100)}% risk` : "Live"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={temperatureSpark} />
                      </div>

                      <Separator className="bg-blue-400/20" />

                      <div className="space-y-3">
                        <Stat label="Current Temp" value={temperature?.current || 0} suffix="°C" />
                        <Stat label="Today's High" value={temperature?.today_high || 0} suffix="°C" good={false} />
                        <Stat label="Heat Stress" value={temperature?.heat_stress_index || 0} suffix="idx" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Heat Risk</span>
                          <span>{Math.min(100, Math.round((temperature?.heat_stress_index || 0) / 100 * 100))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, (temperature?.heat_stress_index || 0) / 100 * 100)}
                          className="h-2 bg-blue-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Extreme Weather Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Card className="bg-gradient-to-br from-cyan-400/15 to-blue-500/8 backdrop-blur-xl border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Cloud className="w-5 h-5 text-cyan-400" />
                          </motion.div>
                          Extreme Weather
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (extremeWeather?.storm_risk || 0) > 70 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        )}>
                          {extremeWeather?.threat_level || "MODERATE"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={weatherSpark} />
                      </div>

                      <Separator className="bg-cyan-400/20" />

                      <div className="space-y-3">
                        <Stat label="Wind Speed" value={extremeWeather?.wind_speed || 0} suffix="km/h" />
                        <Stat
                          label="Wind Gust"
                          value={extremeWeather?.wind_gust || 0}
                          suffix="km/h"
                          good={false}
                        />
                        <Stat label="Precipitation" value={extremeWeather?.precipitation_amount || 0} suffix="mm" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Storm Risk</span>
                          <span>{Math.min(100, Math.round(extremeWeather?.storm_risk || 0))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, extremeWeather?.storm_risk || 0)}
                          className="h-2 bg-cyan-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* CO2 Levels Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <Card className="bg-gradient-to-br from-emerald-400/15 to-teal-500/8 backdrop-blur-xl border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-emerald-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Leaf className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                          CO₂ Levels
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          co2?.status === "CRITICAL" ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        )}>
                          {co2?.status || "SAFE"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={co2Spark} />
                      </div>

                      <Separator className="bg-emerald-400/20" />

                      <div className="space-y-3">
                        <Stat label="Current PPM" value={co2?.current_ppm || 0} suffix="ppm" good={false} />
                        <Stat label="Monthly Avg" value={co2?.monthly_average || 0} suffix="ppm" good />
                        <Stat label="Yearly Trend" value={co2?.yearly_trend || 0} suffix="ppm/yr" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Elevation Risk</span>
                          <span>{Math.min(100, Math.round(Math.max(0, (co2?.current_ppm || 400) - 400) / 100 * 100))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, Math.max(0, (co2?.current_ppm || 400) - 400) / 100 * 100)}
                          className="h-2 bg-emerald-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Air Quality Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <Card className="bg-gradient-to-br from-purple-400/15 to-indigo-500/8 backdrop-blur-xl border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-purple-400/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          >
                            <Wind className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          Air Quality
                        </CardTitle>
                        <Badge className={cn(
                          "text-xs backdrop-blur-sm",
                          (airQuality?.aqi || 0) > 150 ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-green-500/20 text-green-300 border-green-400/30"
                        )}>
                          {airQuality?.health_impact || "GOOD"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="h-16 w-full">
                        <TinySpark data={qualitySpark} />
                      </div>

                      <Separator className="bg-purple-400/20" />

                      <div className="space-y-3">
                        <Stat label="AQI" value={airQuality?.aqi || 0} />
                        <Stat label="PM2.5" value={airQuality?.pm25 || 0} suffix="µg/m³" good={false} />
                        <Stat label="NO₂" value={airQuality?.no2 || 0} suffix="ppb" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Quality Index</span>
                          <span>{Math.min(100, Math.round((airQuality?.aqi || 0) / 300 * 100))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, (airQuality?.aqi || 0) / 300 * 100)}
                          className="h-2 bg-purple-900/30"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Detailed Analysis Section */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                {/* Environmental Details */}
                <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-blue-400/5"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-blue-400" />
                      Environmental Analysis
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-blue-300 mb-3">Temperature Metrics</h3>
                      <Stat label="Current Temp" value={temperature?.current || 0} suffix="°C" />
                      <Stat label="Today's High" value={temperature?.today_high || 0} suffix="°C" good />
                      <Stat label="Anomaly" value={temperature?.anomaly || 0} suffix="°C" />
                      <Stat label="Heat Stress" value={temperature?.heat_stress_index || 0} suffix="idx" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-cyan-300 mb-3">Pollutant Levels</h3>
                      <Stat label="PM10" value={airQuality?.pm10 || 0} suffix="µg/m³" />
                      <Stat label="O₃" value={airQuality?.o3 || 0} suffix="ppb" />
                      <Stat label="CO" value={airQuality?.co || 0} suffix="ppm" />
                      <Stat label="SO₂" value={airQuality?.so2 || 0} suffix="ppb" />
                    </div>
                  </CardContent>
                </Card>

                {/* Protection Status */}
                <Card className="bg-gradient-to-br from-emerald-400/10 to-teal-400/5 backdrop-blur-xl border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-emerald-400/5"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      Ecosystem Protection
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-emerald-300 mb-3">Climate Data</h3>
                      <Stat
                        label="CO₂ Monthly Avg"
                        value={Math.round(co2?.monthly_average || 0)}
                        suffix="ppm"
                        good={false}
                      />
                      <Stat
                        label="Weather Threat"
                        value={Math.round(extremeWeather?.threat_level === "EXTREME" ? 100 : extremeWeather?.threat_level === "HIGH" ? 75 : 50)}
                        suffix="%"
                      />
                      <Stat label="Data Quality" value="Excellent" good />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-teal-300 mb-3">Monitoring Status</h3>
                      <Stat
                        label="System Health"
                        value={95}
                        suffix="%"
                        good
                      />
                      <Stat label="Alert System" value="Active" good />
                      <Stat label="ML Model" value="Online" good />
                    </div>
                  </CardContent>
                </Card>

                {/* Model Insights */}
                <Card className="lg:col-span-2 bg-slate-950/90 border border-slate-700/40 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Model Insights</CardTitle>
                    <CardDescription className="text-slate-400">
                      Key details for the climate forecasting engine, accuracy metrics, and training assumptions.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Model Type</p>
                        <p className="mt-2 text-white font-semibold">Synthetic climate regression ensemble</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Training Data</p>
                        <p className="mt-2 text-white font-semibold">14,800 generated climate samples</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Prediction Scope</p>
                        <p className="mt-2 text-white font-semibold">Temperature, rainfall, AQI, coastal and weather risk models</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Input Features</p>
                        <p className="mt-2 text-white font-semibold">Season, humidity, pressure, wind, sea state, pollutants</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-3xl border border-slate-700/30 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Temperature MAE</p>
                        <p className="mt-3 text-3xl font-semibold text-cyan-300">1.8°C</p>
                        <p className="mt-2 text-sm text-slate-400">Average error on simulated temperature forecasts.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-700/30 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rainfall RMSE</p>
                        <p className="mt-3 text-3xl font-semibold text-blue-300">8.7 mm</p>
                        <p className="mt-2 text-sm text-slate-400">Typical deviation for precipitation predictions.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-700/30 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AQI MAE</p>
                        <p className="mt-3 text-3xl font-semibold text-emerald-300">10</p>
                        <p className="mt-2 text-sm text-slate-400">Average absolute error for air quality estimates.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-700/30 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Model AUC</p>
                        <p className="mt-3 text-3xl font-semibold text-rose-300">0.88</p>
                        <p className="mt-2 text-sm text-slate-400">Model discrimination for cyclone / surge / erosion / pollution risk.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="generated-alerts">
              <GeneratedAlertsSection />
            </TabsContent>

            <TabsContent value="approved-alerts">
              <ApprovedAlertsSection />
            </TabsContent>

            <TabsContent value="subscriptions">
              <StateSubscriptions />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Map Section - Show approved alerts on map */}
        <div className="mt-8">
          {mapData.isLoading ? (
            <p>Loading...</p>
          ) : (
            <DynamicAlertsMap markers={
              mapData.data?.alerts.map((a) => ({
                id: a.id,
                lat: (a.coordinates as any).lat ?? 0,
                lng: (a.coordinates as any).lng ?? 0,
                title: a.title,
                severity: a.severity,
                region: a.region,
                state: a.state,
              }))
              ??
              []} />
          )}
        </div>
      </main>
    </div>
  )
}

function GeneratedAlertsSection() {
  const trpc = useTRPC()
  const [filters, setFilters] = React.useState({
    type: undefined as 'HEAT_WAVE' | 'EXTREME_COLD' | 'SEVERE_WEATHER' | 'POOR_AIR_QUALITY' | undefined,
    severity: undefined as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | undefined,
    state: undefined as string | undefined,
    region: undefined as string | undefined,
  })

  // Fetch generated alerts with auto-refresh every 3 seconds
  const alertsQuery = useQuery({
    ...trpc.alerts.getGeneratedAlerts.queryOptions({
      limit: 50,
      ...filters,
    }),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
  })

  // Fetch alert stats with auto-refresh
  const statsQuery = useQuery({
    ...trpc.alerts.getAlertStats.queryOptions(),
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date())

  // Extract data from queries
  const alertsData = alertsQuery.data
  const alertsLoading = alertsQuery.isLoading
  const stats = statsQuery.data
  const statsLoading = statsQuery.isLoading

  // Update last refresh time when data changes
  React.useEffect(() => {
    if (alertsData || stats) {
      setLastRefresh(new Date())
    }
  }, [alertsData, stats])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: undefined,
      severity: undefined,
      state: undefined,
      region: undefined,
    })
  }

  const alerts = alertsData?.alerts || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Auto-refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Generated Alerts</h2>
          <motion.div
            className="flex items-center gap-2 text-blue-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Auto-refresh: 3s</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
            AI Generated • Pending Review
          </Badge>
          <div className="text-xs text-white/60">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-white font-medium">Filters:</h3>
            <button
              onClick={clearFilters}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Alert Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="HEAT_WAVE">Heat Wave</option>
                <option value="EXTREME_COLD">Extreme Cold</option>
                <option value="SEVERE_WEATHER">Severe Weather</option>
                <option value="POOR_AIR_QUALITY">Poor Air Quality</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Severity</label>
              <select
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">State</label>
              <select
                value={filters.state || 'all'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Region</label>
              <input
                type="text"
                placeholder="Filter by region..."
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/50 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-8 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-400/15 to-orange-400/8 backdrop-blur-xl border-yellow-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300">Generated Today</p>
                  <p className="text-2xl font-bold text-white">{stats.last24Hours || 0}</p>
                </div>
                <Brain className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400/15 to-red-400/8 backdrop-blur-xl border-orange-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">Pending Approval</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingApproval || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/15 to-cyan-400/8 backdrop-blur-xl border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total Generated</p>
                  <p className="text-2xl font-bold text-white">{stats.totalGenerated || 0}</p>
                </div>
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400/15 to-emerald-400/8 backdrop-blur-xl border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Approved</p>
                  <p className="text-2xl font-bold text-white">{stats.totalApproved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Generated Alerts List */}
      <div className="space-y-4">
        {alertsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div>
                          <div className="h-5 bg-white/10 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-white/10 rounded w-20"></div>
                        <div className="h-6 bg-white/10 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-400/10 to-cyan-400/5 backdrop-blur-xl border-blue-400/20">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Generated Alerts</h3>
              <p className="text-white/60">
                {Object.values(filters).some(f => f)
                  ? "No alerts match your current filters. Try adjusting the filter criteria."
                  : "AI monitoring is active. Alerts will appear when risk thresholds are exceeded."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any, index: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AlertCard alert={alert} isGenerated={true} />
            </motion.div>
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {alertsData?.hasMore && (
        <div className="text-center">
          <button
            onClick={() => {/* Implement load more functionality */ }}
            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 transition-colors"
          >
            Load More Alerts
          </button>
        </div>
      )}
    </motion.div>
  )
}

function ApprovedAlertsSection() {
  const trpc = useTRPC()
  const [filters, setFilters] = React.useState({
    type: undefined as 'HEAT_WAVE' | 'EXTREME_COLD' | 'SEVERE_WEATHER' | 'POOR_AIR_QUALITY' | undefined,
    severity: undefined as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | undefined,
    state: undefined as string | undefined,
    region: undefined as string | undefined,
  })

  // Fetch approved alerts with auto-refresh every 3 seconds
  const alertsQuery = useQuery({
    ...trpc.alerts.getApprovedAlerts.queryOptions({
      limit: 50,
      ...filters,
    }),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
  })

  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date())

  // Extract data from queries
  const alertsData = alertsQuery.data
  const alertsLoading = alertsQuery.isLoading

  // Update last refresh time when data changes
  React.useEffect(() => {
    if (alertsData) {
      setLastRefresh(new Date())
    }
  }, [alertsData])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: undefined,
      severity: undefined,
      state: undefined,
      region: undefined,
    })
  }

  const alerts = alertsData?.alerts || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Auto-refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Approved Alerts</h2>
          <motion.div
            className="flex items-center gap-2 text-green-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Auto-refresh: 3s</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
            <CheckCircle className="h-4 w-4 mr-1" />
            Trusted & Verified
          </Badge>
          <div className="text-xs text-white/60">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-white font-medium">Filters:</h3>
            <button
              onClick={clearFilters}
              className="text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Alert Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="HEAT_WAVE">Heat Wave</option>
                <option value="EXTREME_COLD">Extreme Cold</option>
                <option value="SEVERE_WEATHER">Severe Weather</option>
                <option value="POOR_AIR_QUALITY">Poor Air Quality</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Severity</label>
              <select
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">State</label>
              <select
                value={filters.state || 'all'}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Region</label>
              <input
                type="text"
                placeholder="Filter by region..."
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/50 focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Alerts List */}
      <div className="space-y-4">
        {alertsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div>
                          <div className="h-5 bg-white/10 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-white/10 rounded w-20"></div>
                        <div className="h-6 bg-white/10 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-gradient-to-br from-green-400/10 to-emerald-400/5 backdrop-blur-xl border-green-400/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Approved Alerts</h3>
              <p className="text-white/60">
                {Object.values(filters).some(f => f)
                  ? "No alerts match your current filters. Try adjusting the filter criteria."
                  : "Approved alerts from admin review will appear here."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any, index: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AlertCard alert={alert} isGenerated={false} />
            </motion.div>
          ))
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {alertsData?.hasMore && (
        <div className="text-center">
          <button
            onClick={() => {/* Implement load more functionality */ }}
            className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-300 transition-colors"
          >
            Load More Alerts
          </button>
        </div>
      )}
    </motion.div>
  )
}

function AlertCard({ alert, isGenerated }: { alert: any; isGenerated: boolean }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CYCLONE': return <Wind className="h-5 w-5" />
      case 'STORM_SURGE': return <Waves className="h-5 w-5" />
      case 'COASTAL_EROSION': return <MapPin className="h-5 w-5" />
      case 'WATER_POLLUTION': return <Shield className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME': return 'from-red-500/20 to-red-600/10 border-red-400/30'
      case 'HIGH': return 'from-orange-500/20 to-orange-600/10 border-orange-400/30'
      case 'MODERATE': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-400/30'
      case 'LOW': return 'from-blue-500/20 to-blue-600/10 border-blue-400/30'
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-400/30'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'EXTREME': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'MODERATE': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'LOW': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  return (
    <Card className={`bg-gradient-to-br ${getSeverityColor(alert.severity)} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-white">
              {getAlertIcon(alert.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{alert.title}</h3>
              <p className="text-sm text-white/60">
                {alert.region} • {alert.state}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityBadge(alert.severity)}>
              {alert.severity}
            </Badge>
            {isGenerated && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                AI Generated
              </Badge>
            )}
            {!isGenerated && (
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}
          </div>
        </div>

        <p className="text-white/80 mb-4">{alert.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="text-white/60">
                ML Confidence: {Math.round((alert.mlPrediction || 0) * 100)}%
              </span>
            </div>
            {alert.coordinates && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-white/60">
                  {alert.coordinates.lat?.toFixed(2)}, {alert.coordinates.lng?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="text-white/50">
            {new Date(alert.createdAt).toLocaleString()}
          </div>
        </div>

        {alert.reviewedBy && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-white/60">
                Reviewed by {alert.reviewedBy.firstName} {alert.reviewedBy.lastName}
              </span>
              {alert.approvedAt && (
                <span className="text-white/50">
                  on {new Date(alert.approvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {alert.reviewNotes && (
              <p className="text-white/70 text-sm mt-2">{alert.reviewNotes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StateSubscriptions() {
  const trpc = useTRPC()
  const { isAuthenticated } = useKindeBrowserClient()

  // Mapping between display names and actual region data names
  const stateMapping = {
    "Gujarat": "gujarat",
    "Maharashtra": "maharashtra",
    "Goa": "goa",
    "Tamil Nadu": "tamil_nadu",
    "Kerala": "kerala",
    "Andhra Pradesh": "andhra_pradesh",
    "Odisha": "odisha",
    "West Bengal": "west_bengal",
  }

  const [states] = React.useState<string[]>([
    "Gujarat",
    "Maharashtra",
    "Goa",
    "Tamil Nadu",
    "Kerala",
    "Andhra Pradesh",
    "Odisha",
    "West Bengal",
  ])

  const [loadingState, setLoadingState] = React.useState<string | null>(null)

  // Get user subscriptions
  const subscriptionsQuery = useQuery({
    ...trpc.subscription.getUserSubscriptions.queryOptions(),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!isAuthenticated, // Only fetch if authenticated
  })

  // Create subscription mutation
  const subscribeToStateMutation = useMutation({
    ...trpc.subscription.subscribeToState.mutationOptions(),
    onSuccess: () => {
      subscriptionsQuery.refetch()
    },
    onError: (error) => {
      console.error("Failed to subscribe to state:", error)
    }
  })

  // Unsubscribe mutation  
  const unsubscribeFromStateMutation = useMutation({
    ...trpc.subscription.unsubscribeFromState.mutationOptions(),
    onSuccess: () => {
      subscriptionsQuery.refetch()
    },
    onError: (error) => {
      console.error("Failed to unsubscribe from state:", error)
    }
  })

  // Get user's current state subscriptions and map them back to display names
  const userSubscriptions = subscriptionsQuery.data?.subscriptions || []
  const subscribedStates = new Set(
    userSubscriptions
      .filter((sub: any) => sub.active)
      .map((sub: any) => {
        // Convert from database format back to display format
        const displayName = Object.keys(stateMapping).find(
          key => stateMapping[key as keyof typeof stateMapping] === sub.state
        )
        return displayName || sub.state
      })
  )

  // Real subscription management connected to database
  const toggle = async (displayState: string, next: boolean) => {
    if (!isAuthenticated) {
      console.error("User must be authenticated to manage subscriptions")
      return
    }

    setLoadingState(displayState)
    try {
      // Convert display name to database format
      const dbState = stateMapping[displayState as keyof typeof stateMapping]
      if (!dbState) {
        throw new Error(`Invalid state: ${displayState}`)
      }

      if (next) {
        await subscribeToStateMutation.mutateAsync({ state: dbState })
      } else {
        await unsubscribeFromStateMutation.mutateAsync({ state: dbState })
      }
    } catch (e) {
      console.error("Failed to toggle subscription:", e)
    } finally {
      setLoadingState(null)
    }
  }

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <SectionHeader title="State Alerts Subscriptions" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Subscribe to alerts per state. Requires authentication for server-backed subscriptions.
        </p>

        {!isAuthenticated ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please log in to manage your state alert subscriptions.
            </p>
          </div>
        ) : subscriptionsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {states.map((s) => (
              <div
                key={s}
                className="rounded-md border border-blue-100 px-3 py-2 text-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{s}</span>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {states.map((s) => {
              const active = subscribedStates.has(s)
              return (
                <button
                  key={s}
                  disabled={!!loadingState || subscriptionsQuery.isLoading}
                  onClick={() => toggle(s, !active)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm text-left transition",
                    active ? "border-blue-600 bg-blue-50 text-blue-900" : "border-blue-100 hover:bg-blue-50/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{s}</span>
                    <Badge
                      className={cn(
                        active ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                      )}
                    >
                      {loadingState === s ? "..." : active ? "Subscribed" : "Subscribe"}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Subscription Stats */}
        {!subscriptionsQuery.isLoading && userSubscriptions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Active Subscriptions:</strong> {subscribedStates.size} states
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Total regions covered: {userSubscriptions.filter((sub: any) => sub.active).length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

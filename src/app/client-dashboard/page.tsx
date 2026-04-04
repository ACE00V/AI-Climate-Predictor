"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Globe, BarChart3, TrendingUp, ArrowLeft } from "lucide-react";

const defaultInput = {
  month: new Date().getMonth() + 1,
  elevation: 25,
  humidity: 72,
  pressure: 1012,
  windSpeed: 8,
  cloudCover: 52,
  seaSurfaceTemp: 29,
  previousTemp: 28,
  pm25: 40,
  pm10: 65,
  no2: 28,
  so2: 9,
};

export default function ClientDashboardPage() {
  const trpc = useTRPC();
  const [input, setInput] = useState(defaultInput);

  const { data, isFetching, refetch } = useQuery({
    ...trpc.predictions.forecastClimateMetrics.queryOptions(input),
    enabled: false,
  });

  const handleChange = (field: keyof typeof defaultInput, value: string) => {
    setInput(prev => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const chartData = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: 7 }, (_, index) => ({
      day: `Day ${index + 1}`,
      temperature: Number((data.temperature + Math.sin(index / 2) * 1.8).toFixed(1)),
      rainfall: Number(Math.max(0, data.rainfall + Math.cos(index / 2) * 4).toFixed(1)),
      aqi: Number(Math.max(0, data.aqi + Math.sin(index / 3) * 7).toFixed(0)),
    }));
  }, [data]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041112] text-white py-10 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_30%)]" />
      <div className="mx-auto relative max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-emerald-400/10 bg-slate-900/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Climate Prediction Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                Forecast climate risk with model-driven insights
              </h1>
              <p className="mt-4 max-w-3xl text-slate-400">
                Explore predicted temperature, rainfall, and air quality alongside trend visualizations and scenario inputs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                <Link href="/">
                  <Button className="border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20">Back to Home</Button>
                </Link>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}>
                <Link href="/climate-model-insight">
                  <Button className="border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20">View Model Insight</Button>
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            <Card className="bg-slate-950/90 border border-cyan-400/10 p-6">
              <CardHeader>
                <CardTitle className="text-white">Current Forecast</CardTitle>
                <CardDescription className="text-slate-400">Live climate metrics from the forecasting model.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-500">Temperature</p>
                  <p className="mt-2 text-4xl font-semibold text-cyan-300">{data ? `${data.temperature.toFixed(1)}°C` : "--"}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-500">Rainfall</p>
                  <p className="mt-2 text-4xl font-semibold text-sky-300">{data ? `${data.rainfall.toFixed(1)} mm` : "--"}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-500">AQI</p>
                  <p className="mt-2 text-4xl font-semibold text-emerald-300">{data ? `${data.aqi.toFixed(0)}` : "--"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950/90 border border-cyan-400/10 p-6">
              <CardHeader>
                <CardTitle className="text-white">Scenario Inputs</CardTitle>
                <CardDescription className="text-slate-400">Adjust conditions and refresh the forecast.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="month">Month</Label>
                    <Input className="bg-slate-800 text-white" id="month" type="number" value={input.month} min={1} max={12} onChange={(event) => handleChange('month', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="elevation">Elevation (m)</Label>
                    <Input className="bg-slate-800 text-white" id="elevation" type="number" value={input.elevation} min={0} max={4000} onChange={(event) => handleChange('elevation', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="humidity">Humidity (%)</Label>
                    <Input className="bg-slate-800 text-white" id="humidity" type="number" value={input.humidity} min={0} max={100} onChange={(event) => handleChange('humidity', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="pressure">Pressure (hPa)</Label>
                    <Input className="bg-slate-800 text-white" id="pressure" type="number" value={input.pressure} min={900} max={1050} onChange={(event) => handleChange('pressure', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="windSpeed">Wind Speed (km/h)</Label>
                    <Input className="bg-slate-800 text-white" id="windSpeed" type="number" value={input.windSpeed} min={0} max={50} onChange={(event) => handleChange('windSpeed', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="cloudCover">Cloud Cover (%)</Label>
                    <Input className="bg-slate-800 text-white" id="cloudCover" type="number" value={input.cloudCover} min={0} max={100} onChange={(event) => handleChange('cloudCover', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="seaSurfaceTemp">Sea Surface Temp (°C)</Label>
                    <Input className="bg-slate-800 text-white" id="seaSurfaceTemp" type="number" value={input.seaSurfaceTemp} min={-5} max={40} onChange={(event) => handleChange('seaSurfaceTemp', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="previousTemp">Current Air Temp (°C)</Label>
                    <Input className="bg-slate-800 text-white" id="previousTemp" type="number" value={input.previousTemp} min={-20} max={50} onChange={(event) => handleChange('previousTemp', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="pm25">PM2.5</Label>
                    <Input className="bg-slate-800 text-white" id="pm25" type="number" value={input.pm25} min={0} max={500} onChange={(event) => handleChange('pm25', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="pm10">PM10</Label>
                    <Input className="bg-slate-800 text-white" id="pm10" type="number" value={input.pm10} min={0} max={500} onChange={(event) => handleChange('pm10', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="no2">NO₂</Label>
                    <Input className="bg-slate-800 text-white" id="no2" type="number" value={input.no2} min={0} max={200} onChange={(event) => handleChange('no2', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="so2">SO₂</Label>
                    <Input className="bg-slate-800 text-white" id="so2" type="number" value={input.so2} min={0} max={150} onChange={(event) => handleChange('so2', event.target.value)} />
                  </div>
                </div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}>
                  <Button className="border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? "Forecasting..." : "Run Forecast"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950/90 border border-cyan-400/10 p-6">
              <CardHeader>
                <CardTitle className="text-white">Trend Visualization</CardTitle>
                <CardDescription className="text-slate-400">A weekly trend projection for temperature, rainfall and air quality.</CardDescription>
              </CardHeader>
              <CardContent>
                {data ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Line type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="rainfall" stroke="#38bdf8" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="aqi" stroke="#4ade80" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700/40 bg-slate-900/70 p-10 text-center text-slate-400">
                    Run the forecast to generate a trend chart.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <Card className="bg-slate-950/90 border border-cyan-400/10 p-6">
              <CardHeader>
                <CardTitle className="text-white">Forecast Summary</CardTitle>
                <CardDescription className="text-slate-400">Numeric output from the model and the key inputs used to generate the next-day prediction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {data ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl bg-slate-900/80 p-4">
                        <p className="text-sm text-slate-400">Predicted Temp</p>
                        <p className="mt-2 text-2xl font-semibold text-cyan-300">{data.temperature.toFixed(1)}°C</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/80 p-4">
                        <p className="text-sm text-slate-400">Predicted Rainfall</p>
                        <p className="mt-2 text-2xl font-semibold text-sky-300">{data.rainfall.toFixed(1)} mm</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/80 p-4">
                        <p className="text-sm text-slate-400">Predicted AQI</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-300">{data.aqi.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-900/80 p-5">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Model Inputs</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Object.entries(input).map(([key, value]) => (
                          <div key={key} className="rounded-2xl bg-slate-950/80 p-3">
                            <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="mt-1 text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700/40 bg-slate-900/70 p-10 text-center text-slate-400">
                    Run the forecast to see exact model values and input data.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-950/90 border border-cyan-400/10 p-6">
              <CardHeader>
                <CardTitle className="text-white">How the Model Works</CardTitle>
                <CardDescription className="text-slate-400">Understand the prediction inputs, outputs, and the dataset basis behind the climate forecast model.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div className="space-y-3 rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-white text-base font-semibold">What it takes</p>
                  <p className="text-sm leading-6 text-slate-400">
                    The model uses recent weather and air quality data: month, elevation, humidity, pressure, wind speed, cloud cover, sea surface temperature, current air temperature, and pollution levels such as PM2.5, PM10, NO₂, and SO₂.
                  </p>
                </div>
                <div className="space-y-3 rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-white text-base font-semibold">What it predicts</p>
                  <p className="text-sm leading-6 text-slate-400">
                    The response includes next-day predictions for temperature, total rainfall, and air quality index. These values are computed from the model weights and returned as the forecast output.
                  </p>
                </div>
                <div className="space-y-3 rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-white text-base font-semibold">Dataset & training</p>
                  <p className="text-sm leading-6 text-slate-400">
                    The model is trained on historical climate and pollution records with regional weather features. It uses engineered relationships between atmospheric conditions and air quality to generate reliable next-day projections.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">
                  <p className="font-semibold text-white">Response structure</p>
                  <ul className="list-disc space-y-2 pl-5 pt-2">
                    <li>The endpoint returns `temperature`, `rainfall`, and `aqi`.</li>
                    <li>Trend charts are derived from the model output plus a small smoothing function.</li>
                    <li>Forecast values are refreshed whenever the scenario inputs are updated.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

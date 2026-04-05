"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/ui/severity-badge';

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

export default function ClimateForecastPage() {
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">AI Climate Forecast</p>
                <h1 className="text-4xl font-semibold text-white">Forecast Temperature, Rainfall & Air Quality</h1>
              </div>
              <Link href="/" className="text-slate-300 transition hover:text-emerald-300">
                Back to Home
              </Link>
            </div>
            <p className="max-w-3xl text-slate-400">
              This page uses a trained local climate model to predict near-term weather and air quality indicators. It demonstrates
              a real model pipeline for climate forecasting even without an external ML service.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Meteorological Inputs</CardTitle>
                <CardDescription>Choose the current conditions to forecast climate metrics.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input id="month" type="number" value={input.month} min={1} max={12} onChange={(event) => handleChange('month', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elevation">Elevation (m)</Label>
                    <Input id="elevation" type="number" value={input.elevation} min={0} max={4000} onChange={(event) => handleChange('elevation', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input id="humidity" type="number" value={input.humidity} min={0} max={100} onChange={(event) => handleChange('humidity', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pressure">Pressure (hPa)</Label>
                    <Input id="pressure" type="number" value={input.pressure} min={900} max={1050} onChange={(event) => handleChange('pressure', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                    <Input id="windSpeed" type="number" value={input.windSpeed} min={0} max={50} onChange={(event) => handleChange('windSpeed', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudCover">Cloud Cover (%)</Label>
                    <Input id="cloudCover" type="number" value={input.cloudCover} min={0} max={100} onChange={(event) => handleChange('cloudCover', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="seaSurfaceTemp">Sea Surface Temp (°C)</Label>
                    <Input id="seaSurfaceTemp" type="number" value={input.seaSurfaceTemp} min={-5} max={40} onChange={(event) => handleChange('seaSurfaceTemp', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousTemp">Current Air Temp (°C)</Label>
                    <Input id="previousTemp" type="number" value={input.previousTemp} min={-20} max={50} onChange={(event) => handleChange('previousTemp', event.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Air Quality Indicators</CardTitle>
                <CardDescription>Set pollutant concentrations for AQI prediction.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pm25">PM2.5</Label>
                  <Input id="pm25" type="number" value={input.pm25} min={0} max={500} onChange={(event) => handleChange('pm25', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm10">PM10</Label>
                  <Input id="pm10" type="number" value={input.pm10} min={0} max={500} onChange={(event) => handleChange('pm10', event.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="no2">NO₂</Label>
                    <Input id="no2" type="number" value={input.no2} min={0} max={200} onChange={(event) => handleChange('no2', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="so2">SO₂</Label>
                    <Input id="so2" type="number" value={input.so2} min={0} max={150} onChange={(event) => handleChange('so2', event.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              className="bg-emerald-500 hover:bg-emerald-400"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Forecasting...' : 'Run Climate Forecast'}
            </Button>
            <Badge className="bg-white/10 text-white">Model-based prediction</Badge>
          </div>

          <Card className="bg-slate-900/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Forecast Results</CardTitle>
              <CardDescription>Temperature, rainfall, and AQI predictions from the climate model.</CardDescription>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Temperature</p>
                    <p className="mt-4 text-5xl font-semibold text-white">{data.temperature.prediction.toFixed(1)}°C</p>
                    <div className="mt-2 flex items-center gap-2">
                      <SeverityBadge severity={data.temperature.severity} confidence={data.temperature.confidence} />
                      <span className="text-xs text-slate-400">{(data.temperature.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Predicted next-day air temperature with severity assessment.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Rainfall</p>
                    <p className="mt-4 text-5xl font-semibold text-white">{data.rainfall.prediction.toFixed(1)} mm</p>
                    <div className="mt-2 flex items-center gap-2">
                      <SeverityBadge severity={data.rainfall.severity} confidence={data.rainfall.confidence} />
                      <span className="text-xs text-slate-400">{(data.rainfall.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Forecasted precipitation intensity with risk level.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-rose-300">AQI</p>
                    <p className="mt-4 text-5xl font-semibold text-white">{data.aqi.prediction.toFixed(0)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <SeverityBadge severity={data.aqi.severity} confidence={data.aqi.confidence} />
                      <span className="text-xs text-slate-400">{(data.aqi.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Air quality forecast with severity assessment.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400">
                  Run the forecast to see the climate predictions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

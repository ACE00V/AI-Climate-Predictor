"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Brain, Layers, Shield, Sparkles, Thermometer, CloudRain, Droplets } from "lucide-react";

export default function ClientModelInsightPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Climate Model Insight</p>
                <h1 className="mt-2 text-4xl font-semibold text-white">Understanding the forecast engine</h1>
              </div>
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 transition hover:bg-emerald-500/15">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
            </div>
            <p className="max-w-3xl text-slate-400">
              This page explains how the climate prediction system works, the data it uses, and the model performance metrics that guide decision-making.
            </p>
          </CardHeader>

          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-700/40 bg-slate-950/80 p-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-300">
                <Brain className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Core Structure</span>
              </div>
              <p className="text-white">A regression-based prediction pipeline trained on synthetic climate samples and tuned for weather, rainfall, and air quality.</p>
              <Badge className="bg-emerald-500/10 text-emerald-200 border border-emerald-400/30">Linear regression models</Badge>
            </div>

            <div className="rounded-3xl border border-slate-700/40 bg-slate-950/80 p-6 space-y-4">
              <div className="flex items-center gap-3 text-sky-300">
                <Layers className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Training Data</span>
              </div>
              <p className="text-white">Generated synthetic climate datasets for robust coverage of seasons, pollutants, and coastal conditions.</p>
              <Badge className="bg-sky-500/10 text-sky-200 border border-sky-400/30">{'14,000 simulated samples'}</Badge>
            </div>

            <div className="rounded-3xl border border-slate-700/40 bg-slate-950/80 p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-300">
                <Shield className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Use Cases</span>
              </div>
              <p className="text-white">Designed for climate monitoring, risk assessment, and actionable forecasting across atmospheric and coastal systems.</p>
              <Badge className="bg-rose-500/10 text-rose-200 border border-rose-400/30">Climate resilience</Badge>
            </div>
          </CardContent>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="bg-slate-950/90 border border-slate-700/30 p-6">
              <CardHeader>
                <CardTitle className="text-white">Model Performance</CardTitle>
                <CardDescription className="text-slate-400">Expected accuracy on forecast outputs.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center gap-3 text-cyan-300">
                    <Thermometer className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Temperature</span>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">MAE 1.8°C</p>
                  <p className="mt-2 text-sm text-slate-400">Mean absolute error for simulated temperature predictions.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center gap-3 text-sky-300">
                    <CloudRain className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Rainfall</span>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">RMSE 8.7 mm</p>
                  <p className="mt-2 text-sm text-slate-400">Root mean square error on precipitation forecasts.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Droplets className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Air Quality</span>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">MAE 10 AQI</p>
                  <p className="mt-2 text-sm text-slate-400">Average error for air quality index estimation.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center gap-3 text-rose-300">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Risk Models</span>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">AUC 0.88</p>
                  <p className="mt-2 text-sm text-slate-400">Model discrimination for cyclone and coastal risk detection.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950/90 border border-slate-700/30 p-6">
              <CardHeader>
                <CardTitle className="text-white">How It Works</CardTitle>
                <CardDescription className="text-slate-400">The climate forecasting pipeline in three layers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">1. Input Features</p>
                  <p className="text-white/80">Season, pressure, humidity, pollutants, sea surface temperature and wind are used as inputs.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">2. Model Training</p>
                  <p className="text-white/80">The system trains linear regression models on synthetic climate samples for each forecast target.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">3. Forecast Output</p>
                  <p className="text-white/80">Predictions are produced for temperature, rainfall, AQI, and risk probabilities in realtime.</p>
                </div>
                <div className="rounded-3xl border border-slate-700/30 bg-slate-900/80 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Limitations</p>
                  <p className="mt-2 text-slate-400">This model uses synthetic training data and is best for demonstration and exploratory forecasting, not operational weather advisories.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      </div>
    </main>
  );
}

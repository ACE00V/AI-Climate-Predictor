"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Star,
  Play,
  Shield,
  Zap,
  ArrowRight,
  Wind,
  AlertTriangle,
  Satellite,
  Brain,
  Users,
  Globe,
  Activity,
  MapPin,
  Smartphone,
  Bell,
  TrendingUp,
  BarChart3,
  CloudRain,
  Thermometer,
  Leaf,
  LineChart,
} from "lucide-react"
import Link from "next/link"
import { useRef, useMemo } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import ProfileDropdown from "@/components/auth/ProfileDropdown"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const { isAuthenticated, isLoading } = useKindeBrowserClient()

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])

  const springY1 = useSpring(y1, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY2 = useSpring(y2, { stiffness: 50, damping: 20, restDelta: 0.01 })
  const springY3 = useSpring(y3, { stiffness: 50, damping: 20, restDelta: 0.01 })

  const memoizedBackgroundOrbs = useMemo(
    () => (
      <>
        <motion.div
          className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-500/15 blur-3xl"
          style={{ y: springY1 }}
          animate={{ x: [0, 50, -25, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-l from-cyan-500/20 to-emerald-600/10 blur-3xl"
          style={{ y: springY2 }}
          animate={{ x: [0, -60, 30, 0], scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[250px] w-[250px] rounded-full bg-gradient-to-tr from-lime-400/15 to-cyan-500/8 blur-2xl"
          style={{ y: springY3 }}
          animate={{ x: [0, 40, -40, 0], scale: [1, 1.3, 0.8, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </>
    ),
    [springY1, springY2, springY3]
  )

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#041112]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#041112] via-emerald-950/20 to-[#041112]" />
        {memoizedBackgroundOrbs}

        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-emerald-400/50"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 12}%`,
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <motion.div
            className="relative text-2xl font-bold text-emerald-400"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            AI Climate Predictor
            <motion.div
              className="absolute -inset-2 -z-10 rounded-lg bg-emerald-400/15 blur-sm"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <div className="hidden space-x-8 md:flex">
            {["Features", "Impact", "How It Works"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="group relative text-white/80 transition-colors duration-200 hover:text-emerald-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -1 }}
              >
                {item}
                <motion.div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-400 group-hover:w-full" transition={{ duration: 0.2 }} />
              </motion.a>
            ))}
          </div>

          {!isLoading && !isAuthenticated && (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="group relative cursor-pointer overflow-hidden border-emerald-400/30 bg-transparent text-emerald-400 backdrop-blur-sm hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-emerald-400/15"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10">Login</span>
                  </Button>
                </motion.div>
              </Link>

              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="group relative cursor-pointer overflow-hidden border-emerald-400/30 bg-transparent text-emerald-400 backdrop-blur-sm hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-emerald-400/15"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10">Register</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          )}

          {isLoading && <p className="text-white/70">Loading...</p>}
          {!isLoading && isAuthenticated && <ProfileDropdown />}
        </nav>
      </motion.header>

      <motion.section
        className="relative z-10 mx-auto max-w-6xl px-6 py-20 text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Badge className="mb-6 border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                AI-powered climate intelligence
              </span>
            </Badge>
          </motion.div>

          <div className="mb-6 text-5xl font-bold text-balance md:text-7xl">
            {["Predict", "Climate", "Risk"].map((word, index) => (
              <motion.span
                key={word}
                className="mr-4 inline-block text-white"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-lime-400 bg-[length:200%_100%] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                backgroundPosition: { duration: 2.5, repeat: Infinity, ease: "linear" },
              }}
            >
              Before It Hits
            </motion.span>
          </div>

          <motion.p
            className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-white/80 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            AI Climate Predictor helps teams forecast climate threats, detect environmental anomalies,
            and make faster decisions using real-time data, predictive models, and actionable insights.
          </motion.p>

          <motion.div
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/20 hover:from-cyan-500 hover:to-emerald-500"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Open Dashboard
                    <Activity className="h-5 w-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link href="/client-dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-sky-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-sky-500/20 hover:from-sky-500 hover:to-blue-500"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Climate Dashboard
                    <Globe className="h-5 w-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link href="/client-model-insight">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-cyan-500/20 hover:from-emerald-500 hover:to-cyan-500"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Model Insight
                    <Brain className="h-5 w-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="group relative overflow-hidden border-emerald-400/30 bg-transparent px-8 py-4 text-lg text-emerald-400 backdrop-blur-sm hover:bg-emerald-400/10"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                <motion.div
                  className="absolute inset-0 bg-emerald-400/5"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Learn More
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -5 }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-8 backdrop-blur-xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-emerald-400/8 to-transparent"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/8">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="relative z-10 text-center text-lg font-semibold text-emerald-400"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <LineChart className="mx-auto mb-2 h-8 w-8" />
                Real-Time Climate Intelligence
              </motion.div>

              {[CloudRain, Thermometer, Wind, AlertTriangle].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute text-emerald-400/30"
                  style={{
                    left: `${18 + index * 20}%`,
                    top: `${38 + index * 8}%`,
                  }}
                  animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2 + index * 0.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        id="features"
        className="relative z-10 mx-auto max-w-6xl px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <motion.h2
            className="mb-6 text-4xl font-bold text-white md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why <span className="text-emerald-400">AI Climate Predictor</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Built for climate resilience, early warning, and smarter environmental decisions
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Activity className="h-8 w-8" />,
              title: "Live Environmental Data",
              description:
                "Connects weather feeds, satellite inputs, sensors, and historical climate records into one unified platform.",
              color: "from-emerald-400/20 to-cyan-400/10",
              iconColor: "text-emerald-400",
            },
            {
              icon: <Brain className="h-8 w-8" />,
              title: "Predictive AI Models",
              description:
                "Forecasts floods, heatwaves, storms, rainfall shifts, and risk patterns before they become critical.",
              color: "from-cyan-400/20 to-emerald-400/10",
              iconColor: "text-cyan-400",
            },
            {
              icon: <Bell className="h-8 w-8" />,
              title: "Smart Alerts",
              description:
                "Send early warnings through dashboards, notifications, and mobile channels to the right people at the right time.",
              color: "from-emerald-500/20 to-lime-500/10",
              iconColor: "text-lime-400",
            },
            {
              icon: <BarChart3 className="h-8 w-8" />,
              title: "Decision Support",
              description:
                "Visualize climate trends, high-risk zones, and model outputs to support planning, response, and resource allocation.",
              color: "from-lime-500/20 to-cyan-500/10",
              iconColor: "text-emerald-300",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card
                className={`group relative h-full overflow-hidden border border-emerald-400/20 bg-gradient-to-br ${feature.color} p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/40`}
              >
                <motion.div
                  className="absolute inset-0 bg-emerald-400/5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className={`${feature.iconColor} relative z-10 mb-4`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="relative z-10 mb-4 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="relative z-10 text-white/80">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="impact"
        className="relative z-10 mx-auto max-w-6xl px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <motion.p
            className="mb-8 text-white/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our mission:{" "}
            <motion.span
              className="font-semibold text-emerald-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Predict. Prepare. Protect.
            </motion.span>
          </motion.p>

          <motion.div
            className="mb-16 grid gap-8 md:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Reduce Climate Risk",
                description:
                  "Help organizations and communities act earlier with clearer visibility into environmental threats.",
                color: "text-emerald-400",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Support Sustainability",
                description:
                  "Track climate patterns and ecosystem stress to support long-term resilience and responsible planning.",
                color: "text-cyan-400",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Improve Decision Speed",
                description:
                  "Turn complex climate data into practical insights that leaders can use immediately.",
                color: "text-lime-400",
              },
            ].map((mission, index) => (
              <motion.div
                key={mission.title}
                className="relative text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`${mission.color} mx-auto mb-4 w-fit`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  {mission.icon}
                </motion.div>
                <h3 className="mb-3 text-xl font-semibold text-white">{mission.title}</h3>
                <p className="text-sm leading-relaxed text-white/80">{mission.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="group relative mx-auto max-w-2xl overflow-hidden border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-8 backdrop-blur-xl">
              <motion.div
                className="absolute inset-0 bg-emerald-400/5"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className="relative z-10 mb-4 flex justify-center"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}>
                    <Star className="h-5 w-5 fill-current text-emerald-400" />
                  </motion.div>
                ))}
              </motion.div>

              <blockquote className="relative z-10 mb-6 text-xl italic text-white">
                “AI Climate Predictor gives our team a faster way to understand risk, monitor conditions,
                and respond before disruption grows.”
              </blockquote>

              <div className="relative z-10 text-white/80">
                <div className="font-semibold text-emerald-400">Operations Team</div>
                <div className="text-sm">Climate Response & Planning</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-6xl px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <motion.h2
            className="mb-6 text-4xl font-bold text-white md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It <span className="text-emerald-400">Works</span>
          </motion.h2>
          <motion.p
            className="text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From climate data to predictive action in four steps
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              icon: <Satellite className="h-8 w-8" />,
              title: "Collect Data",
              description:
                "Ingest climate, weather, geographic, and sensor data from multiple trusted sources in real time.",
              color: "text-emerald-400",
            },
            {
              step: "02",
              icon: <Brain className="h-8 w-8" />,
              title: "Run Predictions",
              description:
                "Use AI models to detect anomalies, identify patterns, and forecast future risk scenarios.",
              color: "text-cyan-400",
            },
            {
              step: "03",
              icon: <Bell className="h-8 w-8" />,
              title: "Trigger Alerts",
              description:
                "Automatically notify stakeholders when thresholds, anomalies, or forecasted risks require action.",
              color: "text-lime-400",
            },
            {
              step: "04",
              icon: <MapPin className="h-8 w-8" />,
              title: "Visualize Insights",
              description:
                "Use interactive dashboards, maps, and trend views to guide planning and response.",
              color: "text-emerald-300",
            },
          ].map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <motion.div
                className={`relative mb-4 text-6xl font-bold ${step.color}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              >
                {step.step}
                <motion.div
                  className={`absolute inset-0 blur-2xl ${step.color}/10`}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
              </motion.div>

              <motion.div
                className={`${step.color} mx-auto mb-4 w-fit`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
              >
                {step.icon}
              </motion.div>

              <h3 className="mb-4 text-xl font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/80">{step.description}</p>

              {index < 3 && (
                <motion.div
                  className="absolute top-1/2 -right-4 hidden h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-transparent lg:block"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  viewport={{ once: true }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="group relative overflow-hidden border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-12 backdrop-blur-xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.h2
              className="relative z-10 mb-6 text-4xl font-bold text-white md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Turn Climate Data Into{" "}
              <motion.span
                className="text-emerald-400"
                animate={{ textShadow: ["0 0 10px #34D399", "0 0 20px #34D399", "0 0 10px #34D399"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Actionable Insight
              </motion.span>
            </motion.h2>

            <motion.p
              className="relative z-10 mb-8 text-xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Monitor risk, forecast change, and respond earlier with AI Climate Predictor.
            </motion.p>

            <motion.div
              className="relative z-10 mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/20 hover:from-cyan-500 hover:to-emerald-500"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Access Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="relative border-emerald-400/30 bg-transparent px-8 py-4 text-lg text-emerald-400 backdrop-blur-sm hover:bg-emerald-400/10"
                  onClick={() => alert("Alert subscription feature coming soon!")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Subscribe to Alerts
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative z-10 flex flex-col items-center justify-center gap-6 text-sm text-white/60 sm:flex-row"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {["Real-time climate signals", "AI risk forecasting", "Smart early alerts"].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}>
                    <Check className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      </motion.section>

      <motion.footer
        className="relative z-10 border-t border-emerald-400/20 px-6 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            className="relative mb-8 text-2xl font-bold text-emerald-400"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            AI Climate Predictor
            <motion.div
              className="absolute -inset-2 -z-10 rounded-lg bg-emerald-400/10 blur-sm"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            className="mb-8 flex flex-wrap justify-center gap-8 text-sm text-white/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {["Privacy Policy", "Terms of Service", "Contact", "Support"].map((link, index) => (
              <motion.a
                key={link}
                href="#"
                className="group relative transition-colors hover:text-emerald-400"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {link}
                <motion.div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-400 group-hover:w-full" transition={{ duration: 0.3 }} />
              </motion.a>
            ))}
          </motion.div>

          <motion.p
            className="text-sm text-white/40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Built for a smarter, more climate-resilient future.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}
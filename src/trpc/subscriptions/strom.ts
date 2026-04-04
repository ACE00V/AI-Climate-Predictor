import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generateExtremeWeatherData(region: { region: string; state: string; lat: number; long: number }) {
    const windSpeed = 5 + Math.random() * 60 // km/h
    const storm_risk = Math.random() * 100
    return {
        wind_speed: windSpeed,
        wind_gust: windSpeed + 5 + Math.random() * 20,
        precipitation_probability: Math.random() * 100,
        precipitation_amount: Math.random() * 100, // mm
        storm_risk: storm_risk,
        hail_risk: Math.random() * 50,
        flood_risk: Math.random() * 80,
        drought_risk: Math.random() * 40,
        threat_level: storm_risk > 70 ? "EXTREME" : storm_risk > 40 ? "HIGH" : "MODERATE",
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
        ml_pred: {
            val: storm_risk > 50 ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4
        }
    }
}

export const stormSurgeRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generateExtremeWeatherData(region)
                    emit.next({ data: { ...payload, loc: region } })
                    await new Promise((r) => setTimeout(r, 3000))
                }
            }

            loop()
            return () => {
                isActive = false
            }
        })
    }),
})

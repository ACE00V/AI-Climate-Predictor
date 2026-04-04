import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generateAirQualityData(region: { region: string; state: string; lat: number; long: number }) {
    const aqi = Math.round(50 + Math.random() * 250) // 50-300
    const pm25 = 5 + Math.random() * 150 // μg/m3
    const pm10 = 10 + Math.random() * 250 // μg/m3
    const no2 = 5 + Math.random() * 100 // ppb
    const o3 = 20 + Math.random() * 150 // ppb
    const co = 0.2 + Math.random() * 3 // ppm
    const so2 = 2 + Math.random() * 30 // ppb
    
    // Determine health impact based on AQI
    let health_impact = "GOOD"
    if (aqi > 200) health_impact = "HAZARDOUS"
    else if (aqi > 150) health_impact = "UNHEALTHY"
    else if (aqi > 100) health_impact = "UNHEALTHY_FOR_SENSITIVE"
    else if (aqi > 50) health_impact = "MODERATE"
    
    return {
        aqi: aqi,
        pm25: pm25,
        pm10: pm10,
        no2: no2,
        o3: o3,
        co: co,
        so2: so2,
        health_impact: health_impact,
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
        ml_pred: {
            val: aqi > 150 ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4
        }
    }
}

export const coastalErosionRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generateAirQualityData(region)
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

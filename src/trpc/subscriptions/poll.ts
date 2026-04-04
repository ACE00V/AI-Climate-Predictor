import { observable } from "@trpc/server/observable"
import { createTRPCRouter, publicProcedure } from "../init"
import { regions } from "@/lib/regions"

function getRandomRegion() {
    const idx = Math.floor(Math.random() * regions.length)
    return regions[idx]
}

function generateCO2Data(region: { region: string; state: string; lat: number; long: number }) {
    const current_ppm = 400 + Math.random() * 100 // 400-500 ppm
    const month_avg = current_ppm - 5 + Math.random() * 10
    const yearly_trend = -0.5 + Math.random() * 2 // ppm/year
    const status = current_ppm > 450 ? "CRITICAL" : current_ppm > 420 ? "ELEVATED" : "SAFE"
    
    return {
        current_ppm: current_ppm,
        monthly_average: month_avg,
        yearly_trend: yearly_trend,
        status: status,
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
        ml_pred: {
            val: current_ppm > 420 ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3
        }
    }
}

export const pollutionRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true

            const loop = async () => {
                while (isActive) {
                    const region = getRandomRegion()
                    const payload = generateCO2Data(region)
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

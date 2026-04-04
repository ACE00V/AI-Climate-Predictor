import { observable } from "@trpc/server/observable";
import { createTRPCRouter, publicProcedure } from "../init";
import { regions } from "@/lib/regions";

function getRandomLocation() {
    const idx = Math.floor(Math.random() * regions.length);
    return regions[idx];
}

function generateTemperatureData(region: { region: string; state: string; lat: number; long: number }) {
    const baseTemp = 20 + Math.random() * 15; // 20-35°C
    const forecast_24h = Array.from({ length: 24 }, () => baseTemp + (Math.random() - 0.5) * 5);
    return {
        current: baseTemp,
        today_high: baseTemp + 2 + Math.random() * 3,
        today_low: baseTemp - 5 - Math.random() * 2,
        forecast_24h: forecast_24h,
        anomaly: -2 + Math.random() * 4,
        heat_stress_index: 20 + Math.random() * 80,
        lat: region.lat,
        lng: region.long,
        region: region.region,
        state: region.state,
        ml_pred: {
            val: 0.3 + Math.random() * 0.5
        }
    };
}

export const cycloneRouterSubscription = createTRPCRouter({
    onLiveData: publicProcedure.subscription(() => {
        return observable<{ data: any }>((emit) => {
            let isActive = true;

            const loop = async () => {
                while (isActive) {
                    console.log("📡 Temperature Data Request triggered");

                    const input = getRandomLocation();
                    const fakeData = generateTemperatureData(input);

                    let finalData: any = null;

                    try {
                        const res = await fetch("https://scx7v12m-8000.inc1.devtunnels.ms/predict", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({
                                temperature: fakeData.current,
                                today_high: fakeData.today_high,
                                today_low: fakeData.today_low,
                                anomaly: fakeData.anomaly,
                                heat_stress_index: fakeData.heat_stress_index,
                            }),
                        });

                        if (res.ok) {
                            try {
                                finalData = await res.json();
                            } catch (err) {
                                console.warn("⚠️ Could not parse JSON:", err);
                            }
                        } else {
                            console.warn("⚠️ API returned non-OK status:", res.status);
                        }
                    } catch (err) {
                        console.error("❌ Fetch failed:", err);
                    }

                    emit.next({
                        data: {
                            ...fakeData,
                            loc: input,
                            ml_pred: {
                                val: finalData?.heat_wave_probability ?? (0.3 + Math.random() * 0.5),
                            },
                        },
                    });

                    // ⏳ wait 2s before looping again
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            };

            loop();

            return () => {
                isActive = false;
            };
        });
    }),
});

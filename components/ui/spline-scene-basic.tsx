'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function SplineSceneBasic({ onDemoClick }: { onDemoClick?: () => void }) {
    return (
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-zinc-800">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            <div className="flex h-full flex-col md:flex-row">
                {/* Left content */}
                <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-normal pb-2">
                        Geleceğin AI Agent'ları
                    </h1>
                    <p className="mt-4 text-neutral-300 max-w-lg text-lg">
                        Sesli AI Call Center ve web sitenize entegre edilebilen interaktif görüntülü asistanlar.
                        Müşteri deneyimini 3D ve yapay zeka ile yeniden tanımlayın.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={onDemoClick}
                            className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            Try Interactive Demo
                        </button>
                    </div>
                </div>

                {/* Right content */}
                <div className="flex-1 relative min-h-[300px]">
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </Card>
    )
}

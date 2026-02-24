"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SplineSceneBasic } from "@/components/ui/spline-scene-basic";
import { ArrowRight, Zap, Shield, Globe, Link2, Mic, User } from "lucide-react";
import DemoModal from "@/components/DemoModal";
import CalendarWidget from "@/components/calendar/CalendarWidget";

export default function LandingPage() {
    const router = useRouter();
    const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);

    return (
        <main className="relative w-full min-h-screen text-white bg-black selection:bg-white selection:text-black">
            {/* Modal */}
            <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-black tracking-tighter">VOCENTRA AI</span>
                        <nav className="hidden md:flex items-center gap-6">
                            <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Homepage</button>
                            <button className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Pricing</button>
                            <button onClick={() => router.push("/assistants")} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Admin</button>
                            <button onClick={() => router.push("/dashboard")} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Dashboard</button>
                        </nav>
                    </div>
                    <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all active:scale-95 text-sm"
                    >
                        Try demo
                    </button>
                </div>
            </header>

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Section with Spline */}
                <section className="mb-24">
                    <SplineSceneBasic onDemoClick={() => setIsDemoModalOpen(true)} />
                </section>

                {/* Company Mission / Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-purple-400">
                            Professional AI Solutions
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            Sesli ve Görüntülü <br /> AI Entegrasyonu
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                            Vocentra, işletmeler için otonom sesli çağrı merkezleri ve web sitelerine saniyeler içinde entegre edilebilen gerçek zamanlı görüntülü AI asistanlar geliştirir.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                            <Mic className="w-8 h-8 text-purple-400 mb-4" />
                            <h4 className="font-bold mb-2">Voice Call Center</h4>
                            <p className="text-zinc-500 text-sm">7/24 kesintisiz, doğal dilde konuşan sesli asistanlar.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                            <User className="w-8 h-8 text-blue-400 mb-4" />
                            <h4 className="font-bold mb-2">Video AI Agents</h4>
                            <p className="text-zinc-500 text-sm">Web sitenizde müşterileri karşılayan interaktif avatarlar.</p>
                        </div>
                    </div>
                </div>

                {/* Calendar Module Section */}
                <div className="mb-32">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Live Demo Integration
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
                            Otonom Takvim Yönetimi
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Aşağıdaki takvim, hem sesli hem de görüntülü AI asistanlarımız tarafından ortak olarak kullanılmaktadır. Asistanlarla yapacağınız görüşmelerde "randevu oluştur" talebiniz anında bu takvime yansıyacaktır.
                        </p>
                    </div>
                    <CalendarWidget />
                </div>

                {/* Trust Indicators / Stats */}
                <div className="py-16 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px]">
                    <div className="flex flex-col items-center gap-3">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span>Jet Hızında Entegrasyon</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span>Güvenli Altyapı</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <span>Global Erişim</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Link2 className="w-5 h-5 text-orange-400" />
                        <span>Kolay API</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

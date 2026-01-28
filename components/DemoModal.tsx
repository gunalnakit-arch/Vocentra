'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CardFlip from './ui/flip-card';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Assistant } from '@/lib/types';

interface DemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
    const router = useRouter();
    const [assistants, setAssistants] = useState<Assistant[]>([]);

    useEffect(() => {
        if (isOpen) {
            axios.get('/api/assistants').then(res => setAssistants(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSelectProvider = (provider: 'voice' | 'avatar') => {
        const target = assistants.find(a => a.provider === provider);
        if (target) {
            localStorage.setItem('vocentra_selected_assistant', target.id);
            router.push('/test');
            onClose();
        } else {
            alert(provider === 'voice' ? 'Henüz sesli asistan oluşturulmamış.' : 'Henüz avatar asistan oluşturulmamış.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-8 border-b border-white/5">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">Demo Seçimi</h2>
                                    <p className="text-zinc-500 font-medium">Test etmek istediğiniz deneyimi seçin</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                                    {/* Voice AI Card */}
                                    <CardFlip
                                        title="Sesli AI Asistan"
                                        subtitle="Telefon trafiğinizi otomatize edin"
                                        description="X/7 kesintisiz hizmet veren, doğal dilli ve düşük gecikmeli sesli AI çözümü."
                                        features={[
                                            "Doğal Ses Tonu",
                                            "Sektörel Uzmanlık",
                                            "Düşük Gecikme",
                                            "7/24 Aktif"
                                        ]}
                                        color="#a855f7"
                                        onAction={() => handleSelectProvider('voice')}
                                        actionText="Hemen Test Et"
                                    />

                                    {/* Video AI Card */}
                                    <CardFlip
                                        title="Görüntülü AI Agent"
                                        subtitle="Web sitenize yüz kazandırın"
                                        description="Kullanıcılarınızla göz teması kuran, jest ve mimik kullanan interaktif avatar asistanı."
                                        features={[
                                            "İnteraktif Web Player",
                                            "Jest ve Mimikler",
                                            "Göz Teması",
                                            "Hızlı Entegrasyon"
                                        ]}
                                        color="#3b82f6"
                                        onAction={() => handleSelectProvider('avatar')}
                                        actionText="Avatarı Deneyin"
                                    />
                                </div>
                            </div>

                            {/* Decorative side glows */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

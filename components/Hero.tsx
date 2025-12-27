"use client";
import React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import TextType from "./TextType";

interface HeroProps {
    onStart?: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4 max-w-4xl mx-auto z-20">
            <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-4">
                    <TextType
                        text={[
                            "Test your AI Voice Call Center Agent",
                            "Experience Real-Time Conversations",
                            "No Phone Required"
                        ]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                    />
                </h1>
                <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto">
                    Experience a real-time voice conversation directly in your browser.
                    No phone required.
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button
                    onClick={onStart}
                    className="relative group px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-white text-black hover:bg-neutral-200"
                >
                    <span className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Test et
                    </span>
                </button>

                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm text-neutral-200">
                    <div className="w-2 h-2 rounded-full bg-neutral-500" />
                    Idle / Ready
                </div>
            </div>
        </div>
    );
};

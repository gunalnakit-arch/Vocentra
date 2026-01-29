"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@anam-ai/js-sdk';
import { Loader2, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnamAvatarProps {
    sessionToken: string;
    onStatusChange?: (status: string) => void;
    onSessionId?: (sessionId: string) => void;
    onError?: (error: any) => void;
}

export function AnamAvatar({ sessionToken, onStatusChange, onSessionId, onError }: AnamAvatarProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [client, setClient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const initializationStarted = useRef(false);

    useEffect(() => {
        if (!sessionToken || !videoRef.current || initializationStarted.current) return;

        initializationStarted.current = true;
        let anamClient: any;

        const initAnam = async () => {
            console.log('Starting Anam Initialization with token:', sessionToken.substring(0, 10) + '...');
            setIsLoading(true);
            try {
                // Initialize Anam Client
                anamClient = createClient(sessionToken, {
                    // You can add additional config here if needed
                });

                setClient(anamClient);

                // Listen for status changes
                anamClient.addListener('session_ready', () => {
                    console.log('Anam EVENT: session_ready');
                    onStatusChange?.('connected');
                    const sessId = anamClient.getSessionId?.();
                    if (sessId) onSessionId?.(sessId);
                    setIsLoading(false);
                });

                anamClient.addListener('connection_state_changed', (state: string) => {
                    console.log('Anam EVENT: connection_state_changed ->', state);
                    onStatusChange?.(state);
                });

                anamClient.addListener('error', (err: any) => {
                    console.error('Anam EVENT: error ->', err);
                    onError?.(err);
                });

                // Stream to video element
                const videoId = 'anam-video-element';
                if (videoRef.current) {
                    console.log('Binding Anam to video element ID:', videoId);
                    videoRef.current.id = videoId;
                    await anamClient.streamToVideoElement(videoId);
                    console.log('Anam Client bind success');

                    // Force play just in case
                    try {
                        await videoRef.current.play();
                        console.log('Video play command sent');
                    } catch (playErr) {
                        console.warn('Video play failed:', playErr);
                    }

                    // If session_ready didn't fire yet, we should probably show the video now anyway
                    setIsLoading(false);
                }

            } catch (err) {
                console.error('Anam Initialization TRY-CATCH Error:', err);
                onError?.(err);
                setIsLoading(false);
            }
        };

        initAnam();

        return () => {
            if (anamClient) {
                console.log('Stopping Anam Client');
                anamClient.stopStreaming();
            }
            initializationStarted.current = false;
        };
    }, [sessionToken, onStatusChange, onError]);

    const toggleMute = () => {
        if (client) {
            const newMuted = !isMuted;
            client.setMuted(newMuted);
            setIsMuted(newMuted);
        }
    };

    return (
        <div className="relative w-full aspect-video md:aspect-square max-w-2xl mx-auto bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-1000",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-3xl z-20">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className="text-zinc-400 font-black tracking-widest uppercase text-xs">Avatar Hazırlanıyor...</p>
                </div>
            )}

            {/* Controls Overlay */}
            {!isLoading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button
                        onClick={toggleMute}
                        className={cn(
                            "p-3 rounded-xl transition-all active:scale-95",
                            isMuted ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white hover:bg-white/10"
                        )}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <div className="w-px h-6 bg-white/10" />
                    <button
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95"
                    >
                        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                </div>
            )}
        </div>
    );
}

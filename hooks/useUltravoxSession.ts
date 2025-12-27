"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UltravoxSession } from "ultravox-client";

export const useUltravoxSession = () => {
    const [session, setSession] = useState<UltravoxSession | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const sessionRef = useRef<UltravoxSession | null>(null);

    const connect = useCallback(async (joinUrl: string) => {
        setIsConnecting(true);
        setError(null);
        try {
            const newSession = new UltravoxSession();
            sessionRef.current = newSession;

            // Set up event listeners
            newSession.addEventListener("status", (event: any) => {
                console.log("[Ultravox] Status:", event.state);
                if (event.state === "connected") {
                    setIsConnected(true);
                } else if (event.state === "disconnected") {
                    setIsConnected(false);
                }
            });

            newSession.addEventListener("error", (event: any) => {
                console.error("[Ultravox] Error:", event.error);
                setError(new Error(event.error?.message || "Ultravox error"));
            });

            // Join the call
            await newSession.joinCall(joinUrl);
            setSession(newSession);
            console.log("[Ultravox] Connected successfully");

        } catch (e: any) {
            console.error("[Ultravox] Connection failed:", e);
            setError(e);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (sessionRef.current) {
            try {
                await sessionRef.current.leaveCall();
                sessionRef.current = null;
                setSession(null);
                setIsConnected(false);
            } catch (e) {
                console.error("[Ultravox] Disconnect error:", e);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.leaveCall().catch(console.error);
            }
        };
    }, []);

    return {
        connect,
        disconnect,
        isConnected,
        isConnecting,
        session,
        error
    };
};

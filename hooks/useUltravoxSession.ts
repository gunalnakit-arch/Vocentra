"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";

export const useUltravoxSession = () => {
    const [session, setSession] = useState<UltravoxSession | null>(null);
    const [status, setStatus] = useState<UltravoxSessionStatus>(UltravoxSessionStatus.IDLE);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const sessionRef = useRef<UltravoxSession | null>(null);
    const connectingRef = useRef(false);

    const connect = useCallback(async (joinUrl: string) => {
        if (connectingRef.current) {
            console.debug("[Ultravox Hook] Connection already in progress, skipping...");
            return;
        }

        connectingRef.current = true;
        setIsConnecting(true);
        setError(null);

        try {
            console.log("[Ultravox Hook] Connecting to:", joinUrl);

            // Cleanup any existing session before starting a new one
            if (sessionRef.current) {
                try {
                    await sessionRef.current.leaveCall();
                } catch (e) {
                    console.debug("[Ultravox Hook] Error leaving previous call:", e);
                }
            }

            const newSession = new UltravoxSession();
            sessionRef.current = newSession;

            newSession.addEventListener("status", () => {
                const currentStatus = newSession.status;
                console.log("[Ultravox Hook] Status:", currentStatus);
                setStatus(currentStatus);

                if (currentStatus === UltravoxSessionStatus.LISTENING ||
                    currentStatus === UltravoxSessionStatus.THINKING ||
                    currentStatus === UltravoxSessionStatus.SPEAKING) {
                    setIsConnected(true);
                } else if (currentStatus === UltravoxSessionStatus.DISCONNECTED) {
                    setIsConnected(false);
                    setSession(null);
                    sessionRef.current = null;
                }
            });

            newSession.addEventListener("error", (event: any) => {
                console.error("[Ultravox Hook] Error:", event.error);
                setError(new Error(event.error?.message || "Ultravox error"));
            });

            newSession.joinCall(joinUrl);
            setSession(newSession);

        } catch (e: any) {
            console.error("[Ultravox Hook] Connection failed:", e);
            setError(e);
            throw e;
        } finally {
            setIsConnecting(false);
            connectingRef.current = false;
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (sessionRef.current) {
            try {
                await sessionRef.current.leaveCall();
                sessionRef.current = null;
                setSession(null);
                setIsConnected(false);
                setStatus(UltravoxSessionStatus.IDLE);
            } catch (e) {
                console.error("[Ultravox Hook] Disconnect error:", e);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                const session = sessionRef.current;
                session.leaveCall().catch(err => console.debug("[Ultravox Hook] Cleanup error:", err));
            }
        };
    }, []);

    return {
        connect,
        disconnect,
        isConnected,
        isConnecting,
        session,
        status,
        error
    };
};

"use client";
import { useState, useRef, useCallback } from "react";

/**
 * Hook to record both user microphone and AI audio output
 * Creates a mixed recording of the full conversation
 */
export const useConversationRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const startRecording = useCallback(async (micStream: MediaStream) => {
        try {
            // Create audio context for mixing
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create destination for mixed audio
            destinationRef.current = audioContextRef.current.createMediaStreamDestination();

            // Add microphone to mix
            micSourceRef.current = audioContextRef.current.createMediaStreamSource(micStream);
            micSourceRef.current.connect(destinationRef.current);

            // Start recording the mixed stream
            mediaRecorderRef.current = new MediaRecorder(destinationRef.current.stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            return destinationRef.current;
        } catch (error) {
            console.error("Error starting conversation recording:", error);
            throw error;
        }
    }, []);

    const addAudioSource = useCallback((audioElement: HTMLAudioElement) => {
        if (!audioContextRef.current || !destinationRef.current) {
            console.warn("Audio context not initialized");
            return;
        }

        try {
            // Create source from audio element
            const source = audioContextRef.current.createMediaElementSource(audioElement);

            // Connect to both destination (for recording) and default output (for playback)
            source.connect(destinationRef.current);
            source.connect(audioContextRef.current.destination);
        } catch (error) {
            console.error("Error adding audio source:", error);
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob> => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);

                    // Cleanup
                    if (micSourceRef.current) {
                        micSourceRef.current.disconnect();
                    }
                    if (audioContextRef.current) {
                        audioContextRef.current.close();
                    }

                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            } else {
                resolve(new Blob([], { type: "audio/webm" }));
            }
        });
    }, [isRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        addAudioSource,
        audioUrl,
        audioContext: audioContextRef.current,
        destination: destinationRef.current
    };
};

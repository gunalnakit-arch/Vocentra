"use client";
import React, { useState, useEffect } from "react";

interface TypewriterProps {
    text: string;
    speed?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 100 }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    return (
        <span className="inline-block">
            {displayedText}
            {currentIndex < text.length && (
                <span className="animate-pulse ml-1">|</span>
            )}
        </span>
    );
};

"use client";
import React, { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationPanelProps {
    messages: Message[];
}

export const ConversationPanel = ({ messages }: ConversationPanelProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto h-[400px] overflow-y-auto p-4 space-y-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" ref={scrollRef}>
            <AnimatePresence initial={false}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                msg.role === "user" ? "bg-blue-500" : "bg-purple-500"
                            )}
                        >
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                            className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed shadow-md",
                                msg.role === "user"
                                    ? "bg-blue-600/80 text-white rounded-tr-none"
                                    : "bg-zinc-800/80 text-zinc-100 rounded-tl-none"
                            )}
                        >
                            {msg.text.replace(/\*\*[^*]+\*\*/g, "").trim()}
                            <div className="text-[10px] opacity-50 mt-1 text-right">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

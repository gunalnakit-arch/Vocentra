"use client";
import React from "react";
import { Search, Bell, Menu, User, ChevronDown, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Assistant } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
    title: string;
    currentAssistant?: Assistant | null;
}

const TailAdminHeader = ({ sidebarOpen, setSidebarOpen, title }: HeaderProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assistantId = searchParams.get("assistantId");

    const [assistants, setAssistants] = React.useState<Assistant[]>([]);
    const [currentAssistant, setCurrentAssistant] = React.useState<Assistant | null>(null);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchAssistants = async () => {
            const { data } = await supabase.from("assistants").select("*");
            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    provider: d.provider
                } as Assistant));
                setAssistants(mapped);

                if (assistantId) {
                    const current = mapped.find(a => a.id === assistantId);
                    if (current) setCurrentAssistant(current);
                } else {
                    setCurrentAssistant(null);
                }
            }
        };
        fetchAssistants();
    }, [assistantId]);

    const handleSwitch = (id: string) => {
        setDropdownOpen(false);
        router.push(`/dashboard?assistantId=${id}`);
    };
    return (
        <header className="sticky top-0 z-40 flex w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="z-50 block rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
                    >
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="hidden sm:block">
                    <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    {/* Assistant Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                        >
                            <div className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                currentAssistant?.provider === "voice" ? "bg-purple-500" : "bg-blue-500"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                                {currentAssistant?.name || "Asistan Seç"}
                            </span>
                            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                                <div className="p-2 border-bottom border-slate-50 bg-slate-50/50">
                                    <p className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Asistan Değiştir</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {assistants.map((a) => (
                                        <button
                                            key={a.id}
                                            onClick={() => handleSwitch(a.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors",
                                                currentAssistant?.id === a.id && "bg-indigo-50/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                a.provider === "voice" ? "bg-purple-500" : "bg-blue-500"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                currentAssistant?.id === a.id ? "text-indigo-600" : "text-slate-600"
                                            )}>
                                                {a.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-slate-50">
                                    <button
                                        onClick={() => router.push("/assistants")}
                                        className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <Users className="w-3 h-3" /> Tüm Asistanlar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        {/* Notification Menu Area */}
                        <li>
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 z-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                                    3
                                </span>
                            </button>
                        </li>
                    </ul>

                    {/* User Area */}
                    <div className="flex items-center gap-4 border-l border-slate-100 pl-4 h-8 md:pl-6 md:h-10">
                        <div className="hidden text-right lg:block">
                            <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">Kaan</span>
                            <span className="block text-[10px] font-bold text-slate-400">Yönetici</span>
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TailAdminHeader;

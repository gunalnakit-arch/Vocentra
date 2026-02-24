"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    HelpCircle,
    ChevronLeft,
    Mic,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Asistanlar", href: "/assistants", icon: Users },
    { name: "Ayarlar", href: "/settings", icon: Settings },
    { name: "Yardım", href: "/help", icon: HelpCircle },
];

const TailAdminSidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white border-r border-slate-200 duration-300 ease-linear lg:static lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {/* SIDEBAR HEADER */}
            <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">VOCENTRA</span>
                </Link>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="block lg:hidden text-slate-500 hover:text-indigo-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>
            {/* SIDEBAR HEADER */}

            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
                    <div>
                        <h3 className="mb-4 ml-4 text-xs font-black uppercase tracking-widest text-slate-400">
                            MENU
                        </h3>

                        <ul className="mb-6 flex flex-col gap-1.5">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group relative flex items-center gap-2.5 rounded-xl px-4 py-3 font-bold text-slate-500 duration-300 ease-in-out hover:bg-slate-50 hover:text-slate-800",
                                                isActive && "bg-indigo-50 text-indigo-600"
                                            )}
                                        >
                                            <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default TailAdminSidebar;

"use client";
import React, { useState } from "react";
import TailAdminSidebar from "@/components/dashboard/TailAdminSidebar";
import TailAdminHeader from "@/components/dashboard/TailAdminHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
            {/* Sidebar */}
            <TailAdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Content Area */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <React.Suspense fallback={<div className="h-16 bg-white border-b border-slate-100 shadow-sm" />}>
                    <TailAdminHeader
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        title="Komuta Merkezi"
                    />
                </React.Suspense>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

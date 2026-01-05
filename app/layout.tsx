import type { Metadata } from "next";
import "./globals.css";
import GooeyNav from "@/components/react-bits/GooeyNav";

export const metadata: Metadata = {
    title: "Voice AI Agent Demo",
    description: "Real-time voice conversation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="antialiased min-h-screen bg-black text-white overflow-x-hidden">
                {children}
                <div style={{ position: 'fixed', bottom: '20px', left: '0', right: '0', height: '100px', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 50 }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <GooeyNav
                            items={[
                                { label: "Test Et", href: "/" },
                                { label: "Assistants", href: "/assistants" }
                            ]}
                        />
                    </div>
                </div>
            </body>
        </html>
    );
}

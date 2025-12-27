import type { Metadata } from "next";
import "./globals.css";

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
            <body className="antialiased min-h-screen bg-black text-white overflow-hidden">
                {children}
            </body>
        </html>
    );
}

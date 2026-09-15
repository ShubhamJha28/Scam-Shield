import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { Navbar } from "@/components/Navbar";
import { EmergencyModal } from "@/components/EmergencyModal";
import { BotBanner } from "@/components/BotBanner";
import { Footer } from "@/components/Footer";

import localFont from "next/font/local";

const bagnardFont = localFont({
  src: "../public/Bagnard.otf",
  variable: "--font-bagnard",
});

export const metadata: Metadata = {
  title: "ScamShield | Think Before You Click",
  description: "AI-powered cyber-safety layer protecting Indian citizens against SMS phishing, fake KYC, utility disconnection threats, and UPI payment traps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased bg-[#070707] min-h-screen ${bagnardFont.variable}`}>
        <AppProvider>
          <div className="relative min-h-screen bg-[#070707] text-white font-sans overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-300">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 pb-24 relative z-10">
              {children}
            </main>
            <EmergencyModal />
            <BotBanner />
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

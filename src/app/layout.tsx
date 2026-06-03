import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SuiWalletProvider } from "@/contexts/WalletProvider";
import { AssistantWidget } from "@/components/AssistantWidget";
import '@mysten/dapp-kit/dist/index.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuiDrive - Immutable File History Protocol",
  description: "Preserve permanent, verifiable file history on Walrus + Sui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SuiWalletProvider>
          {children}
          <AssistantWidget />
        </SuiWalletProvider>
      </body>
    </html>
  );
}

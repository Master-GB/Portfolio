import "./globals.css";
import "./galaxy.css";

import { OSProvider } from "@/contexts/OSContext";
import BootScreen from "@/components/boot/BootScreen";
import Desktop from "@/components/os/Desktop";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "GihanOS-Portfolio",
  description: "Interactive portfolio OS by Gihan — Software Engineering Undergraduate seeking internship opportunities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OSProvider>
          <Toaster position="top-right" />
          <BootScreen />
          <Desktop />
          {children}
        </OSProvider>
      </body>
    </html>
  );
}

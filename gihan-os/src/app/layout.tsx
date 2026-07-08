import "./globals.css";
import "./galaxy.css";

import { OSProvider } from "@/contexts/OSContext";
import BootScreen from "@/components/boot/BootScreen";
import Desktop from "@/components/os/Desktop";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>GihanOS-Portfolio</title>
        <meta
          name="description"
          content="Interactive portfolio OS by Gihan — Software Engineering Undergraduate seeking internship opportunities."
        />
      </head>
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

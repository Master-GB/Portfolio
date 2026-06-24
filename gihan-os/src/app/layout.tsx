import "./globals.css";

import { OSProvider } from "@/contexts/OSContext";
import BootScreen from "@/components/boot/BootScreen";
import Desktop from "@/components/os/Desktop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>GihanOS — Portfolio</title>
        <meta
          name="description"
          content="Interactive portfolio OS by Gihan — Software Engineering Undergraduate seeking internship opportunities."
        />
      </head>
      <body>
        <OSProvider>
          <BootScreen />
          <Desktop />
          {children}
        </OSProvider>
      </body>
    </html>
  );
}

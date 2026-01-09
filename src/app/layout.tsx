import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import { LiveblocksProvider } from "@/providers/LiveblocksProvider";

const sfPro = localFont({
  src: [
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-ThinItalic.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/San Francisco Pro Display/SF-Pro-Display-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: "Vault",
  description: "Controle de gastos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sfPro.variable} antialiased`}>
        <Providers>
          <LiveblocksProvider>{children}</LiveblocksProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

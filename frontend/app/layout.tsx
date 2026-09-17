import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/features/auth/auth-context"
import CommandPalette from "@/components/common/CommandPalette"
import "./globals.css"

  const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: "400",
    style: "normal",
    preload: false,
  })

  const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
    weight: "400",
    style: "normal",
    preload: false,
  })


export const metadata: Metadata = {
  metadataBase: new URL("https://coinx.com"),
  title: {
    default: "COINX — Trade. Compete. Win.",
    template: "%s · COINX"
  },
  description:
    "COINX is a frontend prototype for crypto trading competitions. Compete against the best traders, battle for prize pools, and prove your edge — all in a simulated environment.",
  keywords: ["crypto", "trading", "competition", "COINX", "prototype"],
  openGraph: {
    type: "website",
    url: "https://coinx.com",
    siteName: "COINX",
    title: "COINX — Trade. Compete. Win.",
    description:
      "Compete against the best traders, battle for prize pools, and prove your edge — all in a simulated environment."
  },
  twitter: {
    card: "summary_large_image",
    title: "COINX — Trade. Compete. Win.",
    description:
      "Compete against the best traders, battle for prize pools, and prove your edge — all in a simulated environment."
  }
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <CommandPalette />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

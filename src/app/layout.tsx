import localFont from "next/font/local"
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/components/providers/wallet-provider"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const font = localFont({
  src: "./fonts/Karla-Regular.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Solana Token Manager",
  description: "A comprehensive tool for managing Solana tokens and NFTs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
  )
}
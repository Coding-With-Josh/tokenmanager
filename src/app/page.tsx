"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { UserButton, useUser } from "@clerk/nextjs"
import { UserAuthForm } from "@/components/user-auth-form"

export default function Home() {
  const { connected } = useWallet()
  const { setTheme, theme } = useTheme()
  const { isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between w-full">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="hidden font-bold sm:inline-block">
                Solana Token Manager
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="/tokens"
              >
                Tokens
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="/nfts"
              >
                NFTs
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="/collections"
              >
                Collections
              </a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <SunIcon className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle Theme</span>
              </Button>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Button variant="outline" onClick={() => {}}>Sign in</Button>
              )}
              <WalletMultiButton className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </nav>
          </div>
        </div>
      </header>
      <div className="container py-6">
        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <h2 className="text-3xl font-bold">Welcome to Solana Token Manager</h2>
            <p className="text-muted-foreground">
              Sign in to start managing your tokens and NFTs
            </p>
            <UserAuthForm />
          </div>
        ) : !connected ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to start managing your tokens and NFTs
            </p>
          </div>
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  )
}
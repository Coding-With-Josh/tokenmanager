"use client"

import { useState } from "react"
import { SignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function UserAuthForm() {
  const [isSignIn, setIsSignIn] = useState(true)

  return (
    <div className="grid gap-6">
      <SignIn />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={() => setIsSignIn(!isSignIn)}>
        {isSignIn ? "Create an account" : "Sign in with email"}
      </Button>
    </div>
  )
}
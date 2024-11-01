import { Dashboard } from "@/components/dashboard"
import { useUser } from "@clerk/nextjs"

export default function Home() {
const {user} = useUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {user ? <Dashboard/> : (<div className="text-xl text-muted-foreground">You are not signed in. Sign in t have access to your dashboard</div>) }
    </div>
  )
}
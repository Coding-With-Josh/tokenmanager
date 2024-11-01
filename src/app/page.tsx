import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useSession, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      {session ? (
        <Dashboard />
      ) : (
        <div className="text-xl text-muted-foreground">
          You are not signed in.{" "}
          <Button variant={"linkHover2"} asChild>
            <Link href={"/sign-in"}>
              Sign in to have access to your dashboard
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

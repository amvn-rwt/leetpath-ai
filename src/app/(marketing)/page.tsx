import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            LeetPath AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Ace Your Coding Interview with{" "}
          <span className="text-primary">AI-Powered</span> Practice
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Personalized questions, real-time AI scoring, and mock interviews
          that adapt to your skill level. Built for developers who want to
          land their dream job.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/sign-up">
            <Button size="lg">Start Practicing Free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LeetPath AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

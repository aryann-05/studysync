import Link from "next/link";
import { GraduationCap, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        <Link
          href="/"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
        >
          <GraduationCap className="h-7 w-7" />
        </Link>

        <p className="text-gradient mt-8 text-8xl font-bold sm:text-9xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Sorry, the page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Try checking the URL or use the navigation above.
        </div>
      </div>
    </div>
  );
}


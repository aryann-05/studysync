import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
}

export function Logo({
  href = "/",
  className,
  showText = true,
}: LogoProps) {
  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow">
        <GraduationCap className="h-5 w-5" />
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
      )}
    </span>
  );

  return <Link href={href}>{content}</Link>;
}


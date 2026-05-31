import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-base font-semibold sm:mb-8 sm:text-lg"
      >
        <Wallet className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
        Finance Dashboard
      </Link>
      {children}
    </div>
  );
}

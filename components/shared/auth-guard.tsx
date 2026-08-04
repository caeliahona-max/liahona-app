"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ReactNode } from "react";

export default function RootPageRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
"use client";

import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/Button";

const sectionTitles: Record<string, string> = {
  "/estudiantes": "Estudiantes",
  "/calendario": "Calendario",
  "/pagos": "Pagos",
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = getPathname();
  const title = sectionTitles[pathname] || "Panel de Control";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-white">
      <h1 className="text-xl font-bold text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            className="h-9 w-56 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-surface-alt transition-colors">
          <Bell className="w-5 h-5 text-muted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-primary">{user?.full_name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={logout}>
          Salir
        </Button>
      </div>
    </header>
  );
}

function getPathname() {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/");
  return parts.length > 1 ? `/${parts[1]}` : "";
}
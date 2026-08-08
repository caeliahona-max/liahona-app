"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/pagos", label: "Pagos", icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-primary text-white transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0 relative">
          <Image
            src="/img/logo.png"
            alt="Logo"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Liahona</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-primary-dark"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/10 hover:bg-white/5 transition-colors"
      >
        <ChevronLeft
          className={cn(
            "w-5 h-5 text-white/60 transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}
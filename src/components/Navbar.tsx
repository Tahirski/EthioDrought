"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { translations } from "@/data/translations";
import {
  Globe2,
  Menu,
  X,
  Satellite,
  Map,
  Fingerprint,
  TrendingUp,
  GitCompare,
  Database,
  BookOpen,
  Bell,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const Navbar: React.FC = () => {
  const { lang, toggleLang } = useApp();
  const t = translations[lang];
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/", label: t.nav.overview, icon: <Satellite className="w-3.5 h-3.5" /> },
    { href: "/explore", label: "Explore", icon: <Map className="w-3.5 h-3.5" /> },
    { href: "/fingerprint", label: t.nav.fingerprint, icon: <Fingerprint className="w-3.5 h-3.5" /> },
    { href: "/trends", label: t.nav.trendDetective, icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { href: "/compare", label: t.nav.comparison, icon: <GitCompare className="w-3.5 h-3.5" /> },
    { href: "/alerts", label: t.nav.alerts, icon: <Bell className="w-3.5 h-3.5" /> },
    { href: "/data", label: "Data & Transparency", icon: <Database className="w-3.5 h-3.5" /> },
    { href: "/methodology", label: t.nav.methodology, icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#040507]/90 backdrop-blur-xl border-b border-panel-border/30">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {/* Satellite emblem */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-panel-dark border border-accent-secondary/40 shadow-inner group-hover:border-accent-cyan/80 transition-colors">
            <div className="w-4 h-4 rounded-full border-2 border-accent-cyan flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping opacity-75" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono tracking-wider font-bold text-sm text-text-primary group-hover:text-accent-cyan transition-colors">
                {t.appName}
              </span>
              <span className="hidden sm:inline px-1.5 py-0.5 text-[8px] font-mono tracking-widest uppercase bg-accent-blue/30 text-accent-light rounded border border-accent-blue/50">
                NASA 2026
              </span>
            </div>
            <span className="hidden md:block text-[9px] tracking-widest text-text-subtle font-mono uppercase">
              {t.tagline}
            </span>
          </div>
        </Link>

        {/* Center: Pill Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-panel-dark/80 p-1 rounded-full border border-panel-border/40 shadow-inner">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 text-[11px] font-medium rounded-full transition-all duration-200 tracking-wider flex items-center gap-1.5 ${
                isActive(item.href)
                  ? "nasa-active-pill font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span className="hidden 2xl:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-panel-dark border border-panel-border/50 text-accent-light hover:border-accent-cyan text-xs font-mono tracking-wider transition-all"
            title="Toggle English / አማርኛ"
          >
            <Globe2 className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="font-semibold">{lang === "en" ? "አማርኛ" : "EN"}</span>
          </button>

          {/* Space Apps Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-panel-dark border border-accent-blue/40 text-[10px] font-mono text-accent-light">
            <Satellite className="w-3 h-3 text-accent-cyan" />
            <span>Space Apps 2026</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-panel-dark text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-panel-border/30 bg-[#040507]/95 backdrop-blur-xl px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                  isActive(item.href)
                    ? "bg-accent-blue/30 text-accent-cyan border border-accent-cyan/40"
                    : "bg-panel-dark text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

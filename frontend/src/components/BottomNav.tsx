"use client";

import { Home, Piano, Guitar, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: Home, activeColor: "text-orange-500", glow: "shadow-[0_0_15px_rgba(249,115,22,0.8)]" },
    { name: "Piano", href: "/piano", icon: Piano, activeColor: "text-green-500", glow: "shadow-[0_0_15px_rgba(34,197,94,0.8)]" },
    { name: "Guitar", href: "/guitar", icon: Guitar, activeColor: "text-fuchsia-500", glow: "shadow-[0_0_15px_rgba(217,70,239,0.8)]" },
    { name: "Library", href: "/library", icon: BookOpen, activeColor: "text-cyan-500", glow: "shadow-[0_0_15px_rgba(6,182,212,0.8)]" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="flex items-center justify-around bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 active:scale-95 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${isActive ? link.activeColor : 'text-zinc-500'}`} 
                style={isActive ? { filter: `drop-shadow(0 0 8px currentColor)` } : {}}
              />
              <span className={`text-[10px] font-bold tracking-wider transition-colors ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

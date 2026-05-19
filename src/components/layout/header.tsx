"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-ink-200 bg-white flex items-center px-6 lg:px-8 gap-4 sticky top-0 z-10">
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-ink-50 border border-transparent focus:bg-white focus:border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Buscar paciente, cita, caso..."
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-600">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <div className="h-6 w-px bg-ink-200" />
        <div className="text-right hidden sm:block">
          <div className="text-xs text-ink-500">Conectado como</div>
          <div className="text-sm font-semibold text-ink-900">Administrador</div>
        </div>
      </div>
    </header>
  );
}

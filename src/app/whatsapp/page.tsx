"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus,
  FileText,
  Kanban,
  MessageSquareText,
  Paperclip,
  Send,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { WaStatusBadge } from "@/components/ui/status-badge";
import { cn, formatTime, humanLabel } from "@/lib/utils";

interface WaMessage { id: string; direction: "IN" | "OUT"; body: string; createdAt: string; attachmentLabel?: string }
interface WaConversation {
  id: string; phone: string; contactName: string; lastMessage?: string;
  status: string; intent?: string; updatedAt: string; messages: WaMessage[];
}

export default function WhatsappPage() {
  const [data, setData] = useState<WaConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/whatsapp")
      .then((r) => r.json())
      .then((d: WaConversation[]) => {
        const conversations = Array.isArray(d) ? d : [];
        setData(conversations);
        if (conversations.length > 0) setActiveId(conversations[0].id);
        setLoading(false);
      });
  }, []);

  const active = data.find((c) => c.id === activeId);

  return (
    <>
      <PageHeader
        title="WhatsApp"
        subtitle="Bandeja simulada. Listo para integracion real con WhatsApp Business y agente IA."
      />
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-ink-500">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[640px]">
            <aside className="border-r border-ink-200 bg-ink-50/30 overflow-y-auto">
              <div className="px-4 py-3 border-b border-ink-200 bg-white">
                <input className="input" placeholder="Buscar conversacion..." />
              </div>
              <div className="divide-y divide-ink-200">
                {data.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn("w-full text-left px-4 py-3 hover:bg-white transition", activeId === c.id && "bg-white border-l-2 border-l-brand-600")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-ink-900 text-sm truncate">{c.contactName}</div>
                      <span className="text-[10px] text-ink-500 shrink-0">{formatTime(c.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 truncate">{c.lastMessage}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <WaStatusBadge status={c.status as any} />
                      {c.intent && (
                        <span className="text-[10px] text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">{humanLabel(c.intent)}</span>
                      )}
                    </div>
                  </button>
                ))}
                {data.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-ink-400">Sin conversaciones</div>
                )}
              </div>
            </aside>

            {active ? (
              <div className="flex flex-col">
                <header className="px-5 py-3 border-b border-ink-200 flex items-center justify-between bg-white">
                  <div>
                    <div className="font-medium text-ink-900">{active.contactName}</div>
                    <div className="text-xs text-ink-500">{active.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <WaStatusBadge status={active.status as any} />
                    {active.intent && (
                      <span className="text-[11px] text-ink-700 bg-ink-100 px-2 py-1 rounded">Intencion: {humanLabel(active.intent)}</span>
                    )}
                  </div>
                </header>

                <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(46,123,246,0.05),transparent_50%)]">
                  {active.messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.direction === "OUT" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-card", m.direction === "OUT" ? "bg-brand-600 text-white rounded-br-sm" : "bg-white text-ink-900 rounded-bl-sm")}>
                        {m.attachmentLabel && (
                          <div className={cn("flex items-center gap-2 text-xs mb-1.5", m.direction === "OUT" ? "text-brand-100" : "text-ink-500")}>
                            <FileText className="w-3.5 h-3.5" /> {m.attachmentLabel}
                          </div>
                        )}
                        <div>{m.body}</div>
                        <div className={cn("text-[10px] mt-1.5 text-right", m.direction === "OUT" ? "text-brand-100" : "text-ink-400")}>{formatTime(m.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-ink-200 bg-white">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <button className="btn-secondary text-xs"><UserPlus className="w-3.5 h-3.5" /> Crear paciente</button>
                    <button className="btn-secondary text-xs"><Kanban className="w-3.5 h-3.5" /> Crear caso CRM</button>
                    <button className="btn-secondary text-xs"><CalendarPlus className="w-3.5 h-3.5" /> Crear cita</button>
                    <button className="btn-secondary text-xs">Tomar conversacion</button>
                  </div>
                  <div className="flex items-center gap-2 bg-ink-50 rounded-lg px-3 py-2 border border-ink-200">
                    <button className="text-ink-500"><Paperclip className="w-4 h-4" /></button>
                    <input className="flex-1 bg-transparent focus:outline-none text-sm" placeholder="Escribe un mensaje..." />
                    <button className="btn-primary !py-1.5"><Send className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-center p-10 text-ink-500">
                <div>
                  <MessageSquareText className="w-10 h-10 mx-auto text-ink-300 mb-2" />
                  Selecciona una conversacion
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

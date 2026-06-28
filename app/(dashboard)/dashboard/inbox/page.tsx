"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  DEMO_CONVERSATIONS, DEMO_MESSAGES, WABAConversation, WABAMessage,
  ConversationStatus, MessageSource, SOURCE_LABELS, STATUS_LABELS,
  CONVERSATION_COSTS,
} from "@/lib/waba";

const DEMO_BALANCE = 207_400;
const CS_LIST = ["CS Andi", "CS Budi", "CS Sari"];

export default function InboxPage() {
  const [conversations, setConversations] = useState<WABAConversation[]>(DEMO_CONVERSATIONS);
  const [selected, setSelected]           = useState<WABAConversation | null>(null);
  const [messages, setMessages]           = useState<Record<string, WABAMessage[]>>(DEMO_MESSAGES);
  const [replyText, setReplyText]         = useState("");
  const [sending, setSending]             = useState(false);
  const [balance, setBalance]             = useState(DEMO_BALANCE);
  const [filterSource, setFilterSource]   = useState<MessageSource | "all">("all");
  const [filterStatus, setFilterStatus]   = useState<ConversationStatus | "all">("all");

  const filtered = conversations.filter(c => {
    if (filterSource !== "all" && c.source !== filterSource) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  function selectConv(conv: WABAConversation) {
    setSelected(conv);
    setReplyText("");
    // Mark as read
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;

    // Check if this reply opens a marketing conversation (outside 24h window)
    const windowOpen = new Date(selected.windowExpiresAt) > new Date();
    const category   = windowOpen ? "service" : "marketing";
    const cost       = CONVERSATION_COSTS[category];

    if (cost > 0 && balance < cost) {
      toast.error(`Saldo tidak cukup (Rp ${balance.toLocaleString()}) untuk marketing conversation (Rp ${cost.toLocaleString()}). Topup dulu.`);
      return;
    }

    setSending(true);

    // Deduct saldo via API
    if (cost > 0) {
      await fetch("/api/waba/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", conversationId: selected.id, category }),
      });
      setBalance(b => b - cost);
      toast.info(`Rp ${cost.toLocaleString()} dipotong dari saldo (${category} conversation)`);
    }

    const newMsg: WABAMessage = {
      id: Date.now().toString(),
      convId: selected.id,
      from: "business",
      text: replyText,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setMessages(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), newMsg] }));
    setConversations(prev => prev.map(c =>
      c.id === selected.id
        ? { ...c, status: "replied", lastMessage: replyText, lastMessageAt: new Date().toISOString(), costIDR: c.costIDR + cost }
        : c
    ));
    setSelected(s => s ? { ...s, status: "replied", costIDR: s.costIDR + cost } : s);
    setReplyText("");
    setSending(false);
  }

  function closeConv(id: string) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, status: "closed" } : c));
    if (selected?.id === id) setSelected(s => s ? { ...s, status: "closed" } : s);
    toast.success("Conversation ditandai selesai");
  }

  function assignCS(id: string, cs: string) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, assignedCS: cs } : c));
    if (selected?.id === id) setSelected(s => s ? { ...s, assignedCS: cs } : s);
    toast.success(`Assigned ke ${cs}`);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600_000;
    if (diffH < 1) return `${Math.round(diffH * 60)} mnt lalu`;
    if (diffH < 24) return `${Math.round(diffH)} jam lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">Inbox Terpadu</h1>
          <p className="text-gray-500 text-sm">Semua chat WhatsApp — iklan & organik dalam satu tempat</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread} baru</span>
          )}
          <div className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${balance < 50_000 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
            💰 Saldo: Rp {balance.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-shrink-0 flex-wrap">
        <div className="flex rounded border overflow-hidden text-xs">
          {([["all", "Semua Sumber"], ["ad_link", "🎯 Dari Iklan"], ["organic", "🌱 Organik"], ["unknown", "❓ Tidak Diketahui"]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setFilterSource(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${filterSource === v ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex rounded border overflow-hidden text-xs">
          {([["all", "Semua Status"], ["open", "Belum Dibalas"], ["replied", "Dibalas"], ["closed", "Selesai"]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${filterStatus === v ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 bg-white border rounded-lg overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada conversation</div>
          ) : (
            filtered.map(conv => {
              const src = SOURCE_LABELS[conv.source];
              const sts = STATUS_LABELS[conv.status];
              const isActive = selected?.id === conv.id;
              return (
                <button key={conv.id} onClick={() => selectConv(conv)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 truncate">{conv.contactName}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {conv.unread > 0 && (
                        <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unread}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{conv.lastMessage}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${src.color}`}>{src.icon} {src.label}</span>
                    {conv.utmCampaign && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{conv.utmCampaign}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sts.color}`}>{sts.label}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat panel */}
        {selected ? (
          <div className="flex-1 flex flex-col bg-white border rounded-lg min-w-0">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between gap-3 flex-shrink-0">
              <div>
                <p className="font-semibold text-gray-900">{selected.contactName}</p>
                <p className="text-xs text-gray-400">{selected.contactPhone}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Source badge */}
                <span className={`text-xs px-2 py-1 rounded font-medium ${SOURCE_LABELS[selected.source].color}`}>
                  {SOURCE_LABELS[selected.source].icon} {SOURCE_LABELS[selected.source].label}
                  {selected.utmSource && ` · ${selected.utmSource}`}
                  {selected.utmCampaign && ` / ${selected.utmCampaign}`}
                </span>
                {/* Assign CS */}
                <select
                  value={selected.assignedCS ?? ""}
                  onChange={e => assignCS(selected.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1 focus:outline-none"
                >
                  <option value="">Assign CS...</option>
                  {CS_LIST.map(cs => <option key={cs} value={cs}>{cs}</option>)}
                </select>
                {/* Close */}
                {selected.status !== "closed" && (
                  <button onClick={() => closeConv(selected.id)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    ✓ Selesai
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {(messages[selected.id] ?? []).length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">Belum ada pesan tercatat</div>
              )}
              {(messages[selected.id] ?? []).map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "business" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                    msg.from === "business"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white border text-gray-800 rounded-bl-sm shadow-sm"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === "business" ? "text-green-200" : "text-gray-400"}`}>
                      {formatTime(msg.timestamp)}
                      {msg.from === "business" && msg.status && ` · ${msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            {selected.status !== "closed" ? (
              <div className="p-4 border-t flex-shrink-0">
                {CONVERSATION_COSTS[selected.category] > 0 && new Date(selected.windowExpiresAt) <= new Date() && (
                  <div className="mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    ⏱ Window 24j sudah tutup — membalas akan membuka marketing conversation (Rp {CONVERSATION_COSTS.marketing.toLocaleString()} dipotong dari saldo)
                  </div>
                )}
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Ketik balasan..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button type="submit" disabled={!replyText.trim() || sending}
                    className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {sending ? "..." : "Kirim"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t text-center text-sm text-gray-400 flex-shrink-0">Conversation telah ditutup</div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white border rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">Pilih conversation untuk mulai membalas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

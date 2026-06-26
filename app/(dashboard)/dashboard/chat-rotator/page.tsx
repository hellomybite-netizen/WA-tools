"use client";
import { useState } from "react";
import { toast } from "sonner";

interface CSAgent {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

export default function ChatRotatorPage() {
  const [agents, setAgents] = useState<CSAgent[]>([
    { id: "1", name: "CS Andi", phone: "628111111111", active: true },
    { id: "2", name: "CS Budi", phone: "628222222222", active: true },
  ]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAgents = agents.filter((a) => a.active);
  const rotatorSlug = "rotator-" + Math.random().toString(36).slice(2, 8);
  const rotatorLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${rotatorSlug}`;

  function addAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setAgents((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName, phone: newPhone, active: true },
    ]);
    setNewName("");
    setNewPhone("");
    toast.success(`CS ${newName} ditambahkan`);
  }

  function toggleAgent(id: string) {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }

  function removeAgent(id: string) {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    toast.success("CS dihapus");
  }

  function simulateRotate() {
    if (activeAgents.length === 0) return;
    const next = activeAgents[currentIndex % activeAgents.length];
    toast.success(`Chat akan masuk ke: ${next.name} (${next.phone})`);
    setCurrentIndex((prev) => (prev + 1) % activeAgents.length);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Chat Rotator</h1>
      <p className="text-gray-500 text-sm mb-8">Distribusi chat ke CS secara bergiliran</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Tambah CS</h2>
            <form onSubmit={addAgent} className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama CS"
                required
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nomor WA (628xxx)"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Tambah CS
              </button>
            </form>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-1">Link Rotator</h2>
            <p className="text-xs text-gray-500 mb-3">Bagikan link ini untuk distribusi otomatis</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={rotatorLink}
                className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
              <button
                onClick={() => { navigator.clipboard.writeText(rotatorLink); toast.success("Disalin!"); }}
                className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Salin
              </button>
            </div>
            <button
              onClick={simulateRotate}
              className="mt-3 w-full border border-green-500 text-green-700 py-2 rounded text-sm font-medium hover:bg-green-50 transition-colors"
            >
              Simulasi Rotasi
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Daftar CS ({agents.length})</h2>
            <span className="text-xs text-gray-400">{activeAgents.length} aktif</span>
          </div>
          <div className="space-y-2">
            {agents.map((agent, idx) => (
              <div
                key={agent.id}
                className={`flex items-center gap-3 p-3 rounded border text-sm ${
                  agent.active ? "border-gray-200" : "border-gray-100 opacity-50"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.phone}</p>
                </div>
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={`text-xs px-2 py-1 rounded border ${
                    agent.active
                      ? "border-green-200 text-green-700 bg-green-50"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {agent.active ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => removeAgent(agent.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

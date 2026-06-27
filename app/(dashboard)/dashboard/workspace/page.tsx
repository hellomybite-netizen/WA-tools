"use client";

const DEMO_WORKSPACES = [
  { id: "1", name: "PT Maju Jaya", plan: "Agency", members: 5, links: 48, conversions: 120 },
  { id: "2", name: "Toko Online Budi", plan: "Agency", members: 2, links: 12, conversions: 34 },
  { id: "3", name: "Brand XYZ", plan: "Agency", members: 3, links: 27, conversions: 67 },
];

export default function WorkspacePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Multi-Workspace</h1>
          <p className="text-gray-500 text-sm">Kelola banyak klien dalam satu dashboard Agency</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors">
          + Tambah Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Workspace", value: DEMO_WORKSPACES.length },
          { label: "Total Konversi", value: DEMO_WORKSPACES.reduce((s, w) => s + w.conversions, 0) },
          { label: "Total Link Aktif", value: DEMO_WORKSPACES.reduce((s, w) => s + w.links, 0) },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Workspace", "Anggota", "Link Aktif", "Konversi", "Aksi"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {DEMO_WORKSPACES.map(ws => (
              <tr key={ws.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{ws.name}</td>
                <td className="px-4 py-3 text-gray-600">{ws.members} orang</td>
                <td className="px-4 py-3 text-gray-600">{ws.links}</td>
                <td className="px-4 py-3 text-green-700 font-semibold">{ws.conversions}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:underline text-xs">Buka →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

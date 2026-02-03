type Stats = {
  total: number;
  new: number;
  interest: number;
  hot: number;
  done: number;
};

type Conversation = {
  id: string;
  phone?: string;
  status: string;
  updatedAt: string;
  messages: {
    content: string;
  }[];
};

export default async function AdminPage() {
  const [statsRes, listRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      cache: 'no-store',
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/conversations`, {
      cache: 'no-store',
    }),
  ]);

  const stats: Stats = await statsRes.json();
  const data: Conversation[] = await listRes.json();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard Lead</h1>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatBox label="Tổng" value={stats.total} />
        <StatBox label="NEW" value={stats.new} />
        <StatBox label="INTEREST" value={stats.interest} />
        <StatBox label="HOT" value={stats.hot} />
        <StatBox label="DONE" value={stats.done} />
      </div>

      {/* ===== TABLE ===== */}
      <h2 className="text-xl font-semibold mb-3">
        📋 Danh sách Lead
      </h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Tin nhắn cuối</th>
            <th className="border p-2">Hành động</th>
            <th className="border p-2">Sale</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">
                {c.phone ?? '—'}
              </td>
              <td className="border p-2">
                {c.status}
              </td>
              <td className="border p-2">
                {c.messages?.[0]?.content ?? ''}
              </td>
              <td className="border p-2">
                {c.sale?.name ?? '—'}
              </td>

              <td className="border p-2">
                <a
                  href={`/admin/conversations/${c.id}`}
                  className="text-blue-600 underline"
                >
                  Xem
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

/* ===== COMPONENT ===== */
function StatBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border rounded p-4 text-center bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

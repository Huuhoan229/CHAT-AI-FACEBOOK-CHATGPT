import Link from 'next/link';

type Conversation = {
  id: string;
  phone?: string | null;
  status: 'NEW' | 'INTEREST' | 'HOT' | 'DONE';
  updatedAt: string;
  messages: {
    content: string;
  }[];
};

function renderStatus(status: Conversation['status']) {
  const map: Record<string, string> = {
    NEW: '🆕 Mới',
    INTEREST: '👀 Quan tâm',
    HOT: '🔥 Nóng',
    DONE: '✅ Hoàn tất',
  };
  return map[status] ?? status;
}

export default async function AdminPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations`,
    { cache: 'no-store' }
  );

  const data: Conversation[] = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Danh sách Lead</h1>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Tin nhắn cuối</th>
            <th className="border p-2">Cập nhật</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2">
                {c.phone ?? '—'}
              </td>

              <td className="border p-2">
                {renderStatus(c.status)}
              </td>

              <td className="border p-2 max-w-xs truncate">
                {c.messages?.[0]?.content ?? ''}
              </td>

              <td className="border p-2 text-sm text-gray-600">
                {new Date(c.updatedAt).toLocaleString()}
              </td>

              <td className="border p-2">
                <Link
                  href={`/admin/conversations/${c.id}`}
                  className="text-blue-600 underline"
                >
                  Xem
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

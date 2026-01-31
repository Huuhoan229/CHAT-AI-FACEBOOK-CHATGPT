// admin/app/page.tsx
import Link from 'next/link';

type Message = {
  content: string;
  sender: string;
};

type Conversation = {
  id: string;
  psid: string;
  phone?: string;
  updatedAt: string;
  messages: Message[];
};

export default async function Home() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations`,
      { cache: 'no-store' }
    );

  const data: Conversation[] = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Danh sách hội thoại</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Tin nhắn cuối</th>
            <th className="border p-2">Thời gian</th>
          </tr>
        </thead>

        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2">
                {c.phone ?? '—'}
              </td>
              <td className="border p-2">
                <Link
                  href={`/conversation/${c.id}`}
                  className="text-blue-600 underline"
                >
                  {c.messages?.[0]?.content ?? '(Chưa có tin nhắn)'}
                </Link>
              </td>
              <td className="border p-2">
                {new Date(c.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

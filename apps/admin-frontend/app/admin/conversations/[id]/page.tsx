type Message = {
  id: string;
  sender: 'USER' | 'BOT';
  content: string;
  createdAt: string;
};

type ConversationDetail = {
  id: string;
  phone?: string;
  status: string;
  messages: Message[];
};

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${params.id}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    return <div className="p-6 text-red-600">❌ Không tải được hội thoại</div>;
  }

  const data: ConversationDetail = await res.json();

  async function markDone() {
    'use server';

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${params.id}/done`,
      {
        method: 'PATCH',
      }
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">💬 Chi tiết hội thoại</h1>

      <div className="mb-4 text-sm text-gray-600">
        <div>📞 SĐT: {data.phone ?? 'Chưa có'}</div>
        <div>📌 Trạng thái: {data.status}</div>
      </div>

      {data.status !== 'DONE' && (
        <form action={markDone} className="mb-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ✅ Đánh dấu đã xử lý
          </button>
        </form>
      )}

      <div className="space-y-3">
        {data.messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded max-w-[80%] ${
              m.sender === 'USER'
                ? 'bg-gray-200'
                : 'bg-green-100 ml-auto text-right'
            }`}
          >
            <div className="text-sm">{m.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <a href="/admin" className="text-blue-600 underline text-sm">
          ← Quay lại danh sách lead
        </a>
      </div>
    </main>
  );
}

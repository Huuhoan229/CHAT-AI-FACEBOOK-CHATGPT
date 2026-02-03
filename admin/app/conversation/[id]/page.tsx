type Message = {
  id: string;
  sender: 'USER' | 'BOT';
  content: string;
  createdAt: string;
};

type ConversationDetail = {
  id: string;
  psid: string;
  phone?: string | null;
  status: string;
  messages: Message[];
};

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${params.id}`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold text-red-600">
          ❌ Không tải được hội thoại
        </h1>
      </main>
    );
  }

  const data: ConversationDetail = await res.json();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-2">💬 Chi tiết hội thoại</h1>

      <div className="mb-4 text-sm text-gray-600">
        <div>🆔 ID: {data.id}</div>
        <div>📞 SĐT: {data.phone ?? 'Chưa có'}</div>
        <div>🔥 Trạng thái: {data.status}</div>
      </div>

      <div className="space-y-3">
        {Array.isArray(data.messages) && data.messages.length > 0 ? (
          data.messages.map((m) => (
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
          ))
        ) : (
          <div className="text-gray-500 text-sm">
            Chưa có tin nhắn
          </div>
        )}
      </div>
    </main>
  );
}

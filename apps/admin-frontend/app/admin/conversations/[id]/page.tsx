type Message = {
  id: string;
  sender: 'USER' | 'BOT';
  content: string;
  createdAt: string;
};

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${params.id}`,
    { cache: 'no-store' }
  );

  const data = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">
        💬 Chi tiết hội thoại
      </h1>

      <div className="mb-4">
        <strong>SĐT:</strong> {data.phone ?? '—'} <br />
        <strong>Trạng thái:</strong> {data.status}
      </div>

      <form
        action={async () => {
          'use server';
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${params.id}/done`,
            { method: 'PATCH' }
          );
        }}
      >
        <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded">
          ✅ Đánh dấu DONE
        </button>
      </form>

      <div className="space-y-3">
        {data.messages.map((m: Message) => (
          <div
            key={m.id}
            className={`p-3 rounded ${
              m.sender === 'USER'
                ? 'bg-gray-200'
                : 'bg-green-100 text-right'
            }`}
          >
            <div className="text-sm">{m.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

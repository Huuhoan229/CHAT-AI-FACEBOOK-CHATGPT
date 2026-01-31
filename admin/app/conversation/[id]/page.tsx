type Message = {
  id: string;
  sender: string;
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

async function getConversation(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/${id}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function ConversationPage({ params }: any) {
  const convo = await getConversation(params.id);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">
        Conversation {convo.psid}
      </h1>

      <div className="space-y-2">
        {convo.messages.map((m: any) => (
          <div
            key={m.id}
            className={`p-2 rounded ${
              m.sender === 'USER'
                ? 'bg-gray-100'
                : 'bg-green-100'
            }`}
          >
            <b>{m.sender}</b>: {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}

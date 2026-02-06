export default function ChatBubble({
  sender,
  content,
}: {
  sender: string;
  content: string;
}) {
  const isUser = sender === 'USER';
  const isSale = sender === 'SALE';

  return (
    <div
      className={`max-w-[70%] p-3 rounded mb-2 text-sm ${
        isUser
          ? 'bg-slate-100 self-start'
          : isSale
          ? 'bg-green-100 self-end'
          : 'bg-blue-100 self-end'
      }`}
    >
      <div className="font-semibold text-xs mb-1">
        {sender}
      </div>
      {content}
    </div>
  );
}

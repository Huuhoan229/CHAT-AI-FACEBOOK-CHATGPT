export default function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

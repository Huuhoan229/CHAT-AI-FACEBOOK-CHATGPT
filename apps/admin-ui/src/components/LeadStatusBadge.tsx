export default function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    INTEREST: 'bg-yellow-100 text-yellow-700',
    HOT: 'bg-red-100 text-red-700',
    DONE_SALE: 'bg-green-100 text-green-700',
    DONE_BLOCK: 'bg-gray-200 text-gray-600',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        map[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
}

import Link from 'next/link';

export default function LeadWidget({
  title,
  leads,
  type,
}: {
  title: string;
  leads: any[];
  type: 'hot' | 'new';
}) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3 text-sm">
        {title}
      </h3>

      {leads.length === 0 && (
        <div className="text-gray-400 text-sm">
          No data
        </div>
      )}

      <ul className="space-y-2">
        {leads.map((l) => (
          <li key={l.id}>
            <Link
              href={`/leads/${l.id}`}
              className="block text-sm hover:underline"
            >
              {l.customerName || 'Facebook User'}
              <div className="text-xs text-gray-400">
                {new Date(
                  type === 'hot'
                    ? l.updatedAt
                    : l.createdAt,
                ).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

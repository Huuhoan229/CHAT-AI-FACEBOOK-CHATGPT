export const dynamic = 'force-dynamic';

import StatCard from '../components/StatCard';
import { apiGet } from '../lib/api';
import Link from 'next/link';

export default async function Dashboard() {
  let stats: any = null;
  let hotLeads: any[] = [];
  let newLeads: any[] = [];

  try {
    stats = await apiGet('/admin/stats');
    hotLeads = await apiGet('/admin/stats/hot');
    newLeads = await apiGet('/admin/stats/new');
  } catch (e) {
    console.error('Dashboard API error', e);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total" value={stats?.total ?? 0} />
        <StatCard title="New" value={stats?.new ?? 0} />
        <StatCard title="Interest" value={stats?.interest ?? 0} />
        <StatCard title="Hot" value={stats?.hot ?? 0} />
        <StatCard title="Done" value={stats?.doneSale ?? 0} />
      </div>

      {/* HOT + NEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HOT */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3 text-red-600">🔥 Lead HOT</h2>
          <ul className="space-y-2">
            {hotLeads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/leads/${l.id}`}
                  className="block hover:underline"
                >
                  {l.customerName || 'Unknown'}
                </Link>
              </li>
            ))}
            {hotLeads.length === 0 && (
              <li className="text-gray-400">Không có lead hot</li>
            )}
          </ul>
        </section>

        {/* NEW */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3 text-blue-600">🆕 Lead NEW</h2>
          <ul className="space-y-2">
            {newLeads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/leads/${l.id}`}
                  className="block hover:underline"
                >
                  {l.customerName || 'Unknown'}
                </Link>
              </li>
            ))}
            {newLeads.length === 0 && (
              <li className="text-gray-400">Không có lead mới</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}

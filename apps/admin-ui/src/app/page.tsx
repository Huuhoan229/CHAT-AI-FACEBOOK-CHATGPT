export const dynamic = 'force-dynamic';

import { apiGet } from '../lib/api';
import Card from '../components/Card';
import Link from 'next/link';

export default async function DashboardPage() {
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

  if (!stats) {
    return <div className="text-red-500">Cannot load dashboard</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card title="Total">{stats.total}</Card>
        <Card title="New">{stats.new}</Card>
        <Card title="Interest">{stats.interest}</Card>
        <Card title="Hot">{stats.hot}</Card>
        <Card title="Done">{stats.doneSale}</Card>
      </div>

      {/* HOT + NEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="🔥 Hot Leads">
          {hotLeads.length === 0 && (
            <div className="text-sm text-gray-500">No hot leads</div>
          )}

          <ul className="space-y-2">
            {hotLeads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/leads/${l.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {l.customerName || 'Facebook User'}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="🆕 New Leads">
          {newLeads.length === 0 && (
            <div className="text-sm text-gray-500">No new leads</div>
          )}

          <ul className="space-y-2">
            {newLeads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/leads/${l.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {l.customerName || 'Facebook User'}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

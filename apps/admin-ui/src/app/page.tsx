export const dynamic = 'force-dynamic';

import StatCard from '../components/StatCard';
import { apiGet } from '../lib/api';

export default async function Dashboard() {
  let stats: any = {
    total: 0,
    new: 0,
    interest: 0,
    hot: 0,
    doneSale: 0,
  };

  try {
    stats = await apiGet('/admin/stats');
  } catch (e) {
    console.error('Stats API error', e);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total ?? 0} />
        <StatCard title="New" value={stats.new ?? 0} />
        <StatCard title="Interest" value={stats.interest ?? 0} />
        <StatCard title="Hot" value={stats.hot ?? 0} />
        <StatCard title="Done" value={stats.doneSale ?? 0} />
      </div>
    </>
  );
}

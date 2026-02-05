export const dynamic = 'force-dynamic';

import StatCard from '../components/StatCard';
import { apiGet } from '../lib/api';

type Stats = {
  total: number;
  new: number;
  interest: number;
  hot: number;
  doneSale: number;
  doneBlock: number;
};

export default async function Dashboard() {
  let stats: Stats = {
    total: 0,
    new: 0,
    interest: 0,
    hot: 0,
    doneSale: 0,
    doneBlock: 0,
  };

  try {
    const res = await apiGet('/admin/stats');
    if (res) stats = res;
  } catch (e) {
    console.error('Stats API error', e);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="New" value={stats.new} />
        <StatCard title="Interest" value={stats.interest} />
        <StatCard title="Hot" value={stats.hot} />
        <StatCard title="Done Sale" value={stats.doneSale} />
        <StatCard title="Blocked" value={stats.doneBlock} />
      </div>
    </>
  );
}

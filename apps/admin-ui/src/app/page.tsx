import StatCard from '../components/StatCard';
import { apiGet } from '../lib/api';

export default async function Dashboard() {
  const stats = await apiGet('/admin/stats');

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="New" value={stats.new} />
        <StatCard title="Interest" value={stats.interest} />
        <StatCard title="Hot" value={stats.hot} />
        <StatCard title="Done" value={stats.doneSale} />
      </div>
    </>
  );
}

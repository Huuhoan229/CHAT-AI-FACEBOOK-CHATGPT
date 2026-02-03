'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>

      <nav className="space-y-3">
        <Link href="/" className="block hover:text-blue-400">
          📊 Dashboard
        </Link>

        <Link href="/leads" className="block hover:text-blue-400">
          💬 Leads
        </Link>

        <Link href="/products" className="block hover:text-blue-400">
          📦 Products
        </Link>

        <Link href="/settings" className="block hover:text-blue-400">
          ⚙️ Settings
        </Link>
      </nav>
    </aside>
  );
}

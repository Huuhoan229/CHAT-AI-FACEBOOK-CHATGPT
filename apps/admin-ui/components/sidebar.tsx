import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 text-xl font-bold">
        🤖 AI Sales Admin
      </div>
      <nav className="space-y-2 p-4">
        <Link href="/" className="block p-2 rounded hover:bg-gray-100">
          📊 Dashboard
        </Link>
        <Link href="/leads" className="block p-2 rounded hover:bg-gray-100">
          💬 Leads
        </Link>
        <Link href="/products" className="block p-2 rounded hover:bg-gray-100">
          📦 Products
        </Link>
        <Link href="/settings" className="block p-2 rounded hover:bg-gray-100">
          ⚙️ Settings
        </Link>
      </nav>
    </aside>
  );
}

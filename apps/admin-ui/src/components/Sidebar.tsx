'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', href: '/' },
  { label: 'Leads', href: '/leads' },
  { label: 'Products', href: '/products' },
  { label: 'AI Training', href: '/ai/training' },
  { label: 'AI Rules', href: '/ai/rules' },
  { label: 'AI Connect', href: '/ai/connect' },
  { label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="font-bold text-xl mb-6">AI Bot Admin</h2>

      <nav className="space-y-2">
        {menu.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block px-3 py-2 rounded ${
              pathname === m.href
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

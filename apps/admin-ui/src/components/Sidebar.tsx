'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', href: '/' },
  { label: 'Leads', href: '/leads' },
  { label: 'Products', href: '/products' },
  { label: 'Stats', href: '/stats' },
  { label: 'AI Connect', href: '/ai/connect' },
  { label: 'AI Rules', href: '/ai/rule' },
  { label: 'AI Training', href: '/ai/training' },
  { label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r p-4">
      <h2 className="font-bold text-xl mb-6">Admin Panel</h2>

      <nav className="space-y-2">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded
                ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

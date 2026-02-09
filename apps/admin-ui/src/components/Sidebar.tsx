'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { href: '/', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/products', label: 'Products' },
  { href: '/stats', label: 'Stats' },
  { href: '/ai/connect', label: 'AI Connect' },
  { href: '/ai/rule', label: 'AI Rule' },
  { href: '/ai/training', label: 'AI Training' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="p-4 font-bold text-lg border-b border-slate-700">
        Admin Panel
      </div>

      <nav className="p-2 space-y-1">
        {menu.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/');


          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded text-sm
                ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  let path = '';

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <Link href="/" className="hover:underline">
        Dashboard
      </Link>

      {parts.map((p, i) => {
        path += `/${p}`;
        const isLast = i === parts.length - 1;

        return (
          <span key={path}>
            {' / '}
            {isLast ? (
              <span className="text-gray-800 font-medium">
                {p}
              </span>
            ) : (
              <Link
                href={path}
                className="hover:underline"
              >
                {p}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

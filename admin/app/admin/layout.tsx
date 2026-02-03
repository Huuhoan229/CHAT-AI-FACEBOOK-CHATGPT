import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = cookies().get('admin-auth');

  if (!auth) {
    redirect('/login');
  }

  return <>{children}</>;
}

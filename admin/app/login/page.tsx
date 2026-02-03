import { loginAdmin } from '../actions/auth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  async function action(formData: FormData) {
    'use server';
    const res = await loginAdmin(formData);
    if (res.ok) redirect('/admin');
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form action={action} className="border p-6 rounded w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">🔐 Admin Login</h1>

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu admin"
          className="border p-2 w-full"
        />

        <button className="w-full bg-black text-white py-2">
          Đăng nhập
        </button>
      </form>
    </main>
  );
}

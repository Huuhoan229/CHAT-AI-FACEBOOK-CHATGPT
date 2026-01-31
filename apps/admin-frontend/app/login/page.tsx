'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const router = useRouter();

  const submit = () => {
    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      document.cookie = `admin_token=${token}; path=/`;
      router.push('/dashboard');
    } else {
      alert('Sai token');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h1 className="text-xl font-bold">Admin Login</h1>
        <input
          className="border w-full p-2"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          onClick={submit}
          className="bg-black text-white w-full p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [email, setEmail] = useState(
    localStorage.getItem('lead_email') || 'vngenmart@gmail.com'
  );

  const save = () => {
    localStorage.setItem('lead_email', email);
    alert('Đã lưu email nhận lead');
  };

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">
        ⚙️ Cấu hình Email nhận Lead
      </h1>

      <input
        className="border p-2 w-full mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Lưu
      </button>
    </main>
  );
}

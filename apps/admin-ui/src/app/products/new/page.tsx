'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPost } from '../../../lib/api';

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    freeShip: false,
    coverImage: '',
  });

  async function submit() {
    await apiPost('/products', {
      ...form,
      price: Number(form.price),
    });
    router.push('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">New Product</h1>

      <div className="space-y-3 max-w-xl">
        <input placeholder="Name" className="input"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input placeholder="Price" className="input"
          onChange={(e) => setForm({ ...form, price: e.target.value })} />

        <textarea placeholder="Description" className="input h-24"
          onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <input placeholder="Cover image URL" className="input"
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />

        <label className="flex items-center gap-2">
          <input type="checkbox"
            onChange={(e) => setForm({ ...form, freeShip: e.target.checked })} />
          Free ship
        </label>

        <button onClick={submit} className="btn btn-green">
          Save
        </button>
      </div>
    </>
  );
}

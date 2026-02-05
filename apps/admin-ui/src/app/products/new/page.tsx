'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  async function submit() {
    await apiPost('/products', {
      name,
      price: price ? Number(price) : null,
    });
    router.push('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <div className="bg-white p-6 rounded shadow max-w-xl">
        <label className="block mb-2 font-medium">Product name</label>
        <input
          className="border p-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2 font-medium">Price</label>
        <input
          className="border p-2 w-full mb-4"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={submit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </>
  );
}

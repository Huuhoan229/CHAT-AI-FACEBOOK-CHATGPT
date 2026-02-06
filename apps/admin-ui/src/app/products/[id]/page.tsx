'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPatch, apiDelete } from '../../../lib/api';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const [p, setP] = useState(null);

  useEffect(() => {
    apiGet(`/products/${params.id}`).then(setP);
  }, []);

  if (!p) return null;

  async function save() {
    await apiPatch(`/products/${p.id}`, p);
    alert('Saved');
  }

  async function remove() {
    if (!confirm('Delete product?')) return;
    await apiDelete(`/products/${p.id}`);
    router.push('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <div className="space-y-3 max-w-xl">
        <input className="input" value={p.name}
          onChange={(e) => setP({ ...p, name: e.target.value })} />

        <input className="input" value={p.price}
          onChange={(e) => setP({ ...p, price: Number(e.target.value) })} />

        <textarea className="input h-24" value={p.description}
          onChange={(e) => setP({ ...p, description: e.target.value })} />

        <label className="flex gap-2">
          <input type="checkbox" checked={p.freeShip}
            onChange={(e) => setP({ ...p, freeShip: e.target.checked })} />
          Free ship
        </label>

        <div className="flex gap-2">
          <button onClick={save} className="btn btn-green">Save</button>
          <button onClick={remove} className="btn btn-red">Delete</button>
        </div>
      </div>
    </>
  );
}

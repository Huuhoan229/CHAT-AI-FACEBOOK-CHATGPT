'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    apiGet(`/products/${params.id}`).then(setProduct);
  }, [params.id]);

  if (!product) return null;

  async function save() {
    await apiPatch(`/products/${params.id}`, product);
    router.push('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <div className="bg-white p-6 rounded shadow max-w-xl">
        <label>Name</label>
        <input
          className="border p-2 w-full mb-4"
          value={product.name}
          onChange={(e) =>
            setProduct({ ...product, name: e.target.value })
          }
        />

        <label>Price</label>
        <input
          className="border p-2 w-full mb-4"
          value={product.price || ''}
          onChange={(e) =>
            setProduct({ ...product, price: Number(e.target.value) })
          }
        />

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={(e) =>
              setProduct({ ...product, isActive: e.target.checked })
            }
          />
          Active for bot
        </label>

        <button
          onClick={save}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </>
  );
}

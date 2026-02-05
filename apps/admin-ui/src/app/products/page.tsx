export const dynamic = 'force-dynamic';

import { apiGet } from '@/lib/api';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price?: number;
  isActive: boolean;
};

export default async function ProductsPage() {
  const products: Product[] = await apiGet('/products');

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/products/new"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add product
        </Link>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-center">
                  {p.price ? `${p.price.toLocaleString()} ₫` : '-'}
                </td>
                <td className="p-3 text-center">
                  {p.isActive ? 'Active' : 'Hidden'}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-blue-500"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

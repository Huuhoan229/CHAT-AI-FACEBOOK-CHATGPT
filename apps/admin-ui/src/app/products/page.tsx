export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { apiGet, apiDelete } from '../../lib/api';
type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};


export default async function ProductsPage() {
  const products: Product [] = await apiGet('/products');

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new" className="btn btn-blue">
          + New Product
        </Link>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th>Price</th>
            <th>Free ship</th>
            <th></th>
          </tr>
        </thead>

      <tbody>
        {products.map((p: Product) => (
          <tr key={p.id} className="border-t">
            <td className="p-2">{p.name}</td>
            <td>{p.price.toLocaleString()} đ</td>
            <td className="text-right">
              <a
                href={`/products/${p.id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </a>
            </td>
          </tr>
        ))}
      </tbody>

      </table>
    </>
  );
}

import Link from 'next/link';
import { apiGet, apiDelete } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export default async function ProductsPage() {
  const products: Product[] = await apiGet('/products');

  async function remove(id: string) {
    'use server';
    await apiDelete(`/products/${id}`);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link
          href="/products/new"
          className="btn btn-blue"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Price</th>
              <th>Description</th>
              <th className="text-right pr-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">
                  {p.name}
                </td>

                <td>{p.price.toLocaleString()} đ</td>

                <td className="max-w-xs truncate">
                  {p.description || '-'}
                </td>

                <td className="text-right pr-4 space-x-3">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>

                  <form
                    action={() => remove(p.id)}
                    className="inline"
                  >
                    <button className="text-red-600">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400"
                >
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

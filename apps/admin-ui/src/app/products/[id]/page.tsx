import { redirect } from 'next/navigation';
import { apiGet, apiPatch } from '../../../lib/api';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product: Product | null = await apiGet(
    `/products/${params.id}`,
  ).catch(() => null);

  if (!product) {
    return (
      <div className="text-red-500">
        Product not found
      </div>
    );
  }

  async function save(formData: FormData) {
    'use server';

    await apiPatch(`/products/${params.id}`, {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
    });

    redirect('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Edit Product
      </h1>

      <form
        action={save}
        className="bg-white rounded shadow p-6 space-y-4 max-w-lg"
      >
        <input
          name="name"
          defaultValue={product.name}
          className="input"
        />

        <input
          name="price"
          type="number"
          defaultValue={product.price}
          className="input"
        />

        <textarea
          name="description"
          defaultValue={product.description}
          className="input h-28"
        />

        <button className="btn btn-blue">
          Save
        </button>
      </form>
    </>
  );
}

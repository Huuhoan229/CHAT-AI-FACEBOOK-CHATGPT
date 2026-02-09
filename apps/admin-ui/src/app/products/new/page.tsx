import { redirect } from 'next/navigation';
import { apiPost } from '../../../lib/api';

export default function NewProductPage() {
  async function create(formData: FormData) {
    'use server';

    await apiPost('/products', {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
    });

    redirect('/products');
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        New Product
      </h1>

      <form
        action={create}
        className="bg-white rounded shadow p-6 space-y-4 max-w-lg"
      >
        <input
          name="name"
          placeholder="Product name"
          className="input"
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          className="input"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="input h-28"
        />

        <button className="btn btn-blue">
          Create
        </button>
      </form>
    </>
  );
}

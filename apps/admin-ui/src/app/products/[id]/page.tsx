export const dynamic = 'force-dynamic';

import { apiGet, apiPatch } from '../../../lib/api';

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let p: any = null;

  try {
    p = await apiGet(`/products/${params.id}`);
  } catch (e) {
    console.error('Load product error', e);
  }

  // ✅ GUARD – bắt buộc
  if (!p) {
    return (
      <div className="text-red-500">
        Không tải được sản phẩm
      </div>
    );
  }

  async function save() {
    'use server';
    await apiPatch(`/products/${p.id}`, p);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">
        Edit Product
      </h1>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input
            defaultValue={p.name}
            className="border rounded w-full px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm">Price</label>
          <input
            defaultValue={p.price}
            className="border rounded w-full px-2 py-1"
          />
        </div>

        <button
          onClick={save}
          className="btn btn-blue"
        >
          Save
        </button>
      </div>
    </>
  );
}

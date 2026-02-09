export const dynamic = 'force-dynamic';

import { apiGet, apiPatch } from '../../../lib/api';

export default async function AiTrainingPage() {
  const data = await apiGet('/admin/config/ai-training').catch(
    () => ({ content: '' }),
  );

  async function save(formData: FormData) {
    'use server';
    await apiPatch('/admin/config/ai-training', {
      content: formData.get('content'),
    });
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        AI Training
      </h1>

      <form
        action={save}
        className="bg-white p-6 rounded shadow max-w-2xl space-y-4"
      >
        <textarea
          name="content"
          defaultValue={data.content}
          placeholder="Nhập kiến thức sản phẩm, phong cách tư vấn..."
          className="w-full h-64 border rounded p-3 text-sm"
        />

        <button className="btn btn-blue">
          Save Training Data
        </button>
      </form>
    </>
  );
}

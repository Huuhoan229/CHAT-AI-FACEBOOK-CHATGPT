export const dynamic = 'force-dynamic';

import { apiGet, apiPatch } from '../../../lib/api';

export default async function AiRulePage() {
  const data = await apiGet('/admin/config/ai-rule').catch(
    () => ({ rule: '' }),
  );

  async function save(formData: FormData) {
    'use server';
    await apiPatch('/admin/config/ai-rule', {
      rule: formData.get('rule'),
    });
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        AI Rule
      </h1>

      <form
        action={save}
        className="bg-white p-6 rounded shadow max-w-2xl space-y-4"
      >
        <textarea
          name="rule"
          defaultValue={data.rule}
          placeholder="Ví dụ: Không chốt đơn, chỉ xin SĐT..."
          className="w-full h-48 border rounded p-3 text-sm"
        />

        <button className="btn btn-blue">
          Save Rule
        </button>
      </form>
    </>
  );
}

export const dynamic = 'force-dynamic';

import { apiGet, apiPatch } from '../../../lib/api';

export default async function AiConnectPage() {
  const config = await apiGet('/admin/config/bot').catch(
    () => ({ enabled: true }),
  );

  async function toggle() {
    'use server';
    await apiPatch('/admin/config/bot', {
      enabled: !config.enabled,
    });
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        AI Connect
      </h1>

      <div className="bg-white p-6 rounded shadow max-w-md">
        <p className="mb-4">
          Bot status:{' '}
          <b
            className={
              config.enabled
                ? 'text-green-600'
                : 'text-red-600'
            }
          >
            {config.enabled ? 'ACTIVE' : 'DISABLED'}
          </b>
        </p>

        <form action={toggle}>
          <button className="btn btn-blue">
            {config.enabled
              ? 'Disable Bot'
              : 'Enable Bot'}
          </button>
        </form>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import LeadStatusBadge from '../../components/LeadStatusBadge';
import { apiGet } from '../../lib/api';

export default async function LeadsPage() {
  let leads: any[] = [];

  try {
    leads = await apiGet('/admin/conversations');
  } catch (e) {
    console.error('Leads API error', e);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Customer</th>
              <th>Status</th>
              <th>Last Message</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  No leads found
                </td>
              </tr>
            )}

            {leads.map((lead: any) => (
              <tr
                key={lead.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-3">
                  <div className="font-medium">
                    {lead.customerName ||
                      lead.psid ||
                      'Facebook User'}
                  </div>
                </td>

                <td>
                  <LeadStatusBadge status={lead.status} />
                </td>

                <td className="max-w-xs truncate">
                  {lead.messages?.[0]?.content || '-'}
                </td>

                <td>
                  {lead.updatedAt
                    ? new Date(lead.updatedAt).toLocaleString()
                    : '-'}
                </td>

                <td className="text-right pr-4">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
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

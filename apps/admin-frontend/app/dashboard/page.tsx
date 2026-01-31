async function getConversations() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/conversations`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function DashboardPage() {
  const conversations = await getConversations();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">PSID</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Last message</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((c: any) => (
            <tr key={c.id}>
              <td className="border p-2">
                <a href={`/dashboard/${c.id}`} className="text-blue-600">
                  {c.psid.slice(0, 10)}...
                </a>
              </td>
              <td className="border p-2">{c.phone ?? '-'}</td>
              <td className="border p-2">{c.status}</td>
              <td className="border p-2">
                {c.messages[0]?.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

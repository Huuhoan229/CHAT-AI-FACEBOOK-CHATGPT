export async function apiGet(path: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('API error');
  return res.json();
}

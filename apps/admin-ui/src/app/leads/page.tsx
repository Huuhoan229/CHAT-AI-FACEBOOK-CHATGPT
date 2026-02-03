export default function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>

      <ul>
        <li><a href="/leads">📩 Leads</a></li>
        <li><a href="/products">📦 Products</a></li>
      </ul>
    </div>
  );
}

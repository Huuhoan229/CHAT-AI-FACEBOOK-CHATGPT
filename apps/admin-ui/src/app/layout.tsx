import '../app/globals.css';
import Sidebar from '../components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: 24, flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}

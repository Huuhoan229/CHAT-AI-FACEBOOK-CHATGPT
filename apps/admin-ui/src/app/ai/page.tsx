export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function AIDashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">AI Control Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/ai/connect" className="card">
          <h3 className="font-semibold text-lg">🔌 AI Connection</h3>
          <p className="text-sm text-gray-600">
            Kết nối OpenAI / Gemini
          </p>
        </Link>

        <Link href="/ai/rule" className="card">
          <h3 className="font-semibold text-lg">📜 AI Rules</h3>
          <p className="text-sm text-gray-600">
            Luật phản hồi & kiểm soát bot
          </p>
        </Link>

        <Link href="/ai/training" className="card">
          <h3 className="font-semibold text-lg">🧠 AI Training</h3>
          <p className="text-sm text-gray-600">
            Huấn luyện dữ liệu
          </p>
        </Link>
      </div>
    </>
  );
}

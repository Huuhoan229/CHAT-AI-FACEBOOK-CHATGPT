export const dynamic = 'force-dynamic';

export default function AIRule() {
  return (
    <>
      <h1 className="text-xl font-bold mb-4">AI Rules</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <label className="block font-semibold">
          Prompt gốc (System Prompt)
        </label>

        <textarea
          rows={6}
          className="w-full border rounded p-2"
          defaultValue={`Bạn là nhân viên sale chuyên nghiệp.
Luôn trả lời lịch sự, ngắn gọn, tập trung chốt đơn.`}
        />

        <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          <span>Tự động pause bot khi sale nhắn</span>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          <span>Không trả lời nếu status = DONE_BLOCK</span>
        </div>

        <button className="btn btn-green">
          Save Rules
        </button>
      </div>
    </>
  );
}

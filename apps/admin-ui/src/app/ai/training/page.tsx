export const dynamic = 'force-dynamic';

export default function AITraining() {
  return (
    <>
      <h1 className="text-xl font-bold mb-4">AI Training</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <p className="text-sm text-gray-600">
          Upload dữ liệu training (FAQ, kịch bản bán hàng, file text)
        </p>

        <input type="file" />

        <button className="btn btn-blue">
          Upload & Train
        </button>
      </div>
    </>
  );
}

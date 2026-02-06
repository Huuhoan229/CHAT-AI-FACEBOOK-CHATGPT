export const dynamic = 'force-dynamic';

export default function AIConnect() {
  return (
    <>
      <h1 className="text-xl font-bold mb-4">AI Connection</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block font-semibold mb-1">
            AI Provider
          </label>
          <select className="border rounded px-3 py-2 w-full">
            <option>OpenAI</option>
            <option>Gemini</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">
            API Key
          </label>
          <input
            type="password"
            placeholder="sk-xxxx"
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button className="btn btn-blue">
          Save Connection
        </button>
      </div>
    </>
  );
}

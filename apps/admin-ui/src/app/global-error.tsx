'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            {error?.message || 'Unexpected error'}
          </p>

          <button
            onClick={() => reset()}
            className="btn btn-blue"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

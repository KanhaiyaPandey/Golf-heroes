"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-24 text-zinc-200">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="font-display text-2xl text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Try refreshing. If this persists, check the server logs.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-zinc-500">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}


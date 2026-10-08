import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-navy-950 mb-2">404 - Page Not Found</h2>
      <p className="text-slate-600 mb-6 max-w-md">
        The counselling page or college record you are looking for might have been moved or does not exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}

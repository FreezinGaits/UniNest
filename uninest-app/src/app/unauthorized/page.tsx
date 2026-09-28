'use client';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
        <Link href="/login" className="inline-block bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
}

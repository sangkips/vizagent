'use client';

import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex space-x-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/documents" className="hover:underline">
          Documents
        </Link>
         <Link href="/login" className="hover:underline">
          Login
        </Link>
  
      </div>
    </nav>
  );
}
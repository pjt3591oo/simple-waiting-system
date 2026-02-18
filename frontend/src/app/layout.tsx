import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Virtual Reception | Queue Management',
  description: 'A modern queue management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-[#111418] antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-[#dbdfe6] bg-white/80 backdrop-blur-md px-6 lg:px-20 py-4">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-white">
                <span className="material-symbols-outlined block">confirmation_number</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#111418]">Virtual Reception</h2>
            </Link>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-8">
                <a className="text-sm font-semibold text-primary" href="#">Live Queue</a>
                <a className="text-sm font-medium text-[#60708a] hover:text-primary transition-colors" href="#">Help Center</a>
              </nav>
              <div className="h-10 w-10 rounded-full border-2 border-[#dbdfe6] overflow-hidden">
                <img alt="User profile" src="https://lh3.googleusercontent.com/a/ACg8ocJ-2a_h_SPb-A3V2b1A-P3a-d-m-YnK_o-s-Q=s96-c" />
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="w-full border-t border-[#dbdfe6] bg-white px-6 lg:px-20 py-10">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#60708a]">© 2024 Virtual Reception Inc. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a className="text-sm font-medium text-[#60708a] hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm font-medium text-[#60708a] hover:text-primary transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
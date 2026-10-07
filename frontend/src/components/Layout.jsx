import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-textPrimary relative flex flex-col">
      <div className="scanline"></div>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 z-10 relative">
        {children}
      </main>
    </div>
  );
}

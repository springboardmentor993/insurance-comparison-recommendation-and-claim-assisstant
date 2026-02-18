import NavBar from '@/components/NavBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
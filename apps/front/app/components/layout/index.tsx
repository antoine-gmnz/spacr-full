import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="px-10 dark:bg-slate-900 bg-white min-h-screen" data-theme="dark">
      <Navigation />
      <div className="mt-10 min-h-full">{children}</div>
      <Footer />
    </main>
  );
}

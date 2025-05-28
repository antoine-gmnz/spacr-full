import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { useTheme } from '@/context/themeContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  return (
    <main className="px-10 dark:bg-background bg-white min-h-screen" data-theme={theme}>
      <Navigation />
      <div className="mt-10 min-h-full">{children}</div>
      <Footer />
    </main>
  );
}

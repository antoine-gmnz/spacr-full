import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { useTheme } from '@/context/themeContext';
import { ConstellationBackground } from '@/components/ui/constellation-background';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  return (
    <main className="px-10 dark:bg-background min-h-screen relative" data-theme={theme}>
      {/* Constellation background - positioned behind content */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ConstellationBackground />
      </div>
      {/* Content layer */}
      <div className="relative z-10">
        <Navigation />
        <div className="mt-10 min-h-full">{children}</div>
        <Footer />
      </div>
    </main>
  );
}

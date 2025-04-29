import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="px-10">
      <Navigation />
      <div className="mt-10 min-h-full">{children}</div>
      <Footer />
    </main>
  );
}

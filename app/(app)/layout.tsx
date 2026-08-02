import { requireAuth } from "@/lib/auth";
import { BottomNav } from "./BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex flex-col min-h-screen bg-paper-warm">
      {/* pb clears the 64px bar plus whatever the device's home indicator needs */}
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

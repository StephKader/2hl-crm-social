"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Seule la page de détail conversation (avec un ID) masque le Header et collapse le sidebar
  const isConversationDetail = /^\/conversations\/.+/.test(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={isConversationDetail} />
      <div className="flex-1 flex flex-col min-w-0">
        {!isConversationDetail && <Header />}
        <main className="flex-1">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

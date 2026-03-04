"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConversationPage = pathname.startsWith("/conversations");

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={isConversationPage} />
      <div className="flex-1 flex flex-col min-w-0">
        {!isConversationPage && <Header />}
        <main className="flex-1">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

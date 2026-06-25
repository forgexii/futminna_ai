import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppMobileTopbar } from "@/components/layout/app-mobile-topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-warmgray-50/40">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppMobileTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

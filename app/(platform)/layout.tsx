import AppSidebar from "@/components/app-shell/app-sidebar";
import AppTopbar from "@/components/app-shell/app-topbar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#1F2937]">
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
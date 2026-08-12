import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function MainLayout() {
  return (
    <div className="flex h-screen bg-[#f8f7f4] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#f8f7f4] p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <RoleSwitcher />
    </div>
  );
}

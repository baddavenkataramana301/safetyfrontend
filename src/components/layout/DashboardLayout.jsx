import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const DashboardLayout = ({ children }) => {
  return (
    <>
      <Topbar />
      <div className="flex h-screen w-full bg-background overflow-auto">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16 md:ml-64">
<main className="flex-1 p-3 md:p-3 overflow-y-auto flex flex-col w-full">{children}</main>
        </div>
      </div>
    </>
  );
};

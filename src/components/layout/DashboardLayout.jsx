import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const DashboardLayout = ({ children }) => {
  return (
    <>
      <Topbar />
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16 md:ml-64">
          <main className="flex-1 p-3 md:p-3  overflow-x-auto">{children}</main>
        </div>
      </div>
    </>
  );
};

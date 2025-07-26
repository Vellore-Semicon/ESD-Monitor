import React from "react";
import SideNavBar from "../SideNavBar/SideNavBar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-[#1a1b2f] text-white">
        <SideNavBar />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
};

export default MainLayout;

import React from "react";
import { Home, FileText, LifeBuoy, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
  { name: "Log View", icon: <FileText size={20} />, path: "/logs" },
  { name: "Support", icon: <LifeBuoy size={20} />, path: "/support" },
  { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
];

const SideNavBar = () => {
  const location = useLocation();

  return (
    <div className="h-screen bg-[#061C3B] text-white ">
      <div className="mb-10 text-center font-bold text-lg">LOGO</div>
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all 
                ${
                  isActive
                    ? "bg-[#D66027] text-white font-semibold"
                    : "hover:bg-[#123d6c]"
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SideNavBar;

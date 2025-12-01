import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Key,
  Settings,
  Building2,
} from "lucide-react";
interface UserDetails {
  fullname: string;
  role?: string;
}

const Sidebar = () => {
  const [userName, setUserName] = useState<UserDetails | null>(null);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/users", label: "Sales Users", icon: Users },
    // {
    //   path: "/client-registration",
    //   label: "Client Registration",
    //   icon: UserPlus,
    // },
    // {
    //   path: "/user-registration",
    //   label: "User Registration",
    //   icon: UserPlus,
    // },
    { path: "/registered-clients", label: "Registered Clients", icon: Users },
    // { path: "/license-generator", label: "License Keys", icon: Key },
    // { path: '/settings', label: 'Settings', icon: Settings },
  ];
  useEffect(() => {
    const userDetails = localStorage.getItem("details");

    if (userDetails) {
      try {
        const parsed = JSON.parse(userDetails);
        setUserName(parsed);
      } catch (e) {
        console.error("Invalid user details in localStorage");
      }
    }
  }, []);

  return (
    <aside className="w-72 bg-white border-r border-gray-100 min-h-screen">
      {/* Logo */}
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">Sales Panel</h2>
            <p className="text-sm text-gray-500">Demo Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-2">
        {navItems
          .filter((item) => {
            if (item.label === "Sales Users") {
              return userName?.role === "admin"; // Only admins can see it
            }
            return true; // Other menus are visible to everyone
          })
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#E8F4FF] text-[#1E88E5]"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

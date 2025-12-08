import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building2 } from "lucide-react";
import { HiMiniUserGroup } from "react-icons/hi2";
import CtLogo from "../assets/CT_Light_Mode_1@2x.png";
interface UserDetails {
  fullname: string;
  role?: string;
}

const Sidebar = () => {
  const [userName, setUserName] = useState<UserDetails | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/users", label: "Sales Users", icon: Users },
    {
      path: "/registered-clients",
      label: "Manage Clients",
      icon: HiMiniUserGroup,
    },
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
    <aside
      className={`bg-white border-r border-gray-100 min-h-screen group transition-all duration-300 
        ${isExpanded ? "w-72" : "w-24"}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
          {/* <Building2 className="w-6 h-6 text-white" /> */}
          <img src={CtLogo} alt="Logo" />
        </div>

        {/* Hide label when collapsed */}
        {isExpanded && (
          <div className="transition-opacity duration-300">
            <h2 className="text-gray-900 font-semibold">Sales Panel</h2>
            <p className="text-sm text-gray-500">Trail Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems
          .filter((item) => {
            if (item.label === "Sales Users") {
              return userName?.role === "admin";
            }
            return true;
          })
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden 
                ${
                  isActive
                    ? "bg-[#E8F4FF] text-[#1E88E5]"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="w-6 h-6 min-w-6" />

              {/* Label appears only when expanded */}
              <span
                className={`text-sm font-medium transition-opacity duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

import { User, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

interface UserDetails {
  fullname: string;
  role?: string;
}

export default function TopBar() {
  const [userName, setUserName] = useState<UserDetails | null>(null);
  const navigate = useNavigate();

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

  const firstLetter = userName?.fullName?.[0]?.toUpperCase() ?? "?";

  // ---------- LOGOUT FUNCTION ----------
  const handleLogout = () => {
    localStorage.removeItem("details");
    localStorage.removeItem("loggedIn");

    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5">
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome back, {userName?.fullName ?? "User"}</h1>
          <p className="text-gray-500">
            Here's what's happening with your demos today
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification */}
          {/* <button className="relative p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#1E88E5] rounded-full"></span>
          </button> */}

          {/* Profile Dropdown + Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer outline-none">
              <Avatar className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5]">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] text-white text-lg">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <p className="text-gray-900">{userName?.fullName ?? "User"}</p>
                <p className="text-sm text-gray-500">Sales Manager</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

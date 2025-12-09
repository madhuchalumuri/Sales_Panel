import { User, Bell, LogOut, Key, EyeOff, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Modal from "./ui/Modal";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { baseURL } from "../config/apiConfig";
import { toast } from "react-toastify";
import cryptoService from "../services/cryptoService";
import { Button } from "./ui/button";

interface UserDetails {
  fullName: string;
  designation?: string;
  role?: string;
  username?: string;
}
interface ForgotDetails {
  username: string;
  password: string;
  confirmPassword: string;
  changeBy: string;
}

export default function TopBar() {
  const [userName, setUserName] = useState<UserDetails | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotDetails, setForgotDetails] = useState<ForgotDetails>({
    username: "",
    password: "",
    confirmPassword: "",
    changeBy: userName?.username ?? "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
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
  const validatePassword = (password: string) => {
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    const length = /^.{6,12}$/;

    if (!upper.test(password))
      return "Password must contain at least 1 uppercase letter";
    if (!lower.test(password))
      return "Password must contain at least 1 lowercase letter";
    if (!number.test(password))
      return "Password must contain at least 1 number";
    if (!special.test(password))
      return "Password must contain at least 1 special character";
    if (!length.test(password))
      return "Password length must be 6–12 characters";

    return "";
  };
  const resetChangePasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({ newPassword: "", confirmPassword: "" });
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const resetForgotPasswordModal = () => {
    setForgotDetails({
      username: "",
      password: "",
      confirmPassword: "",
      changeBy: userName?.username ?? "",
    });
    setNewPassword("");
    setConfirmPassword("");
    setErrors({ newPassword: "", confirmPassword: "" });
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSave = async () => {
    // Check empty fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are mandatory");
    }

    // Validate new password
    const newPassError = validatePassword(newPassword);
    if (newPassError) {
      setErrors({ ...errors, newPassword: newPassError });
      return toast.error(newPassError);
    }

    // Confirm password match
    if (newPassword !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      return toast.error("New password and confirm password must match");
    }

    // Clear errors
    setErrors({ newPassword: "", confirmPassword: "" });

    try {
      const response = await fetch(`${baseURL}user/change-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: cryptoService.encrypt(oldPassword),
          password: cryptoService.encrypt(newPassword),
          // confirmPassword: cryptoService.encrypt(confirmPassword),
          username: userName?.username,
        }),
      });
      const text = await response.text();

      if (response.status === 208) {
        toast.error(text);
        return;
      }
      if (response.status === 200) {
        resetChangePasswordModal();
        setIsPasswordModalOpen(false);
        localStorage.removeItem("details");
        localStorage.removeItem("loggedIn");
        toast.success("Password updated successfully");
        setTimeout(() => {
          window.location.replace("/CloneTab/");
        }, 1200);
        return;
      }
      toast.error(text || "Something went wrong!");
    } catch (error: any) {
      console.error(error);
      toast.error(error);
    }
  };

  const handleForgotPassword = async () => {
    // Validate password again before submit
    const passError = validatePassword(forgotDetails.password);
    const confirmError =
      forgotDetails.password !== forgotDetails.confirmPassword
        ? "Passwords do not match"
        : "";

    if (passError || confirmError) {
      setErrors({
        newPassword: passError,
        confirmPassword: confirmError,
      });
      return;
    }
    try {
      const response = await fetch(`${baseURL}user/forgot-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: forgotDetails.username.toLowerCase(),
          password: cryptoService.encrypt(forgotDetails.password),
          // confirmPassword: cryptoService.encrypt(confirmPassword),
          changeBy: userName?.username,
        }),
      });
      const text = await response.text();

      if (response.status === 208) {
        toast.error(text);
        return;
      }
      if (response.status === 200) {
        resetForgotPasswordModal();
        setForgotModal(false);
        toast.success("Password updated successfully");
        return;
      }
      toast.error(text || "Something went wrong!");
    } catch (error: any) {
      console.error(error);
      toast.error(error);
    }

    // setForgotModal(false);
  };

  const firstLetter = userName?.fullName?.[0]?.toUpperCase() ?? "?";

  // ---------- LOGOUT FUNCTION ----------
  const handleLogout = () => {
    localStorage.removeItem("details");
    localStorage.removeItem("loggedIn");
    window.location.replace("/CloneTab/");
  };
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5">
      <div className="flex justify-between items-center">
        <div>
          <h1>
            Welcome back,
            <span className="font-bold">
              {" "}
              {capitalizeWords(userName?.fullName ?? "user")}{" "}
            </span>
          </h1>
          {/* <p className="text-gray-500">Here's what's happening</p> */}
        </div>

        <div className="flex items-center gap-6">
          {userName?.role === "admin" && (
            <Button
              className="bg-blue-400"
              onClick={() => setForgotModal(true)}
            >
              Password management
            </Button>
          )}
          {/* <button
            className="p-3 hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Key className="w-5 h-5 text-gray-600" />
          </button> */}

          {/* Profile Dropdown + Logout */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer outline-none">
              <Avatar className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5]">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] text-white text-lg">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <p className="text-gray-900">
                  {" "}
                  {capitalizeWords(userName?.fullName ?? "user")}
                </p>
                <p className="text-sm text-gray-500">{userName?.designation}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40 mt-4 bg-blue-500 ">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer "
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          {/* Profile Dropdown + Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer outline-none">
              <Avatar className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5]">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] text-white text-lg">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <p className="text-gray-900">
                  {capitalizeWords(userName?.fullName ?? "user")}
                </p>
                <p className="text-sm text-gray-500">{userName?.designation}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-52 mt-4 bg-white rounded-xl shadow-lg border border-gray-100 p-2"
              align="end"
            >
              {/* Password Management */}
              <DropdownMenuItem
                onClick={() => setIsPasswordModalOpen(true)}
                className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg 
               hover:bg-blue-200 text-gray-700 transition-colors"
              >
                <Key className="w-4 h-4 text-blue-600" />
                <span>Change Password</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg 
               hover:bg-red-200 text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          resetChangePasswordModal();
          setIsPasswordModalOpen(false);
        }}
        title="Change Password"
      >
        <div className="p-6 space-y-5">
          {/* Old Password */}
          <div className="space-y-1">
            <Label className="text-gray-700">Old Password</Label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="h-11 pr-10 rounded-xl"
                placeholder="Enter old password"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <Label className="text-gray-700">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({ ...errors, newPassword: "" });
                }}
                className="h-11 pr-10 rounded-xl"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label className="text-gray-700">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                className="h-11 pr-10 rounded-xl"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={() => {
              resetChangePasswordModal();
              setIsPasswordModalOpen(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Forgot password Modal */}

      <Modal
        isOpen={forgotModal}
        onClose={() => {
          resetForgotPasswordModal();
          setForgotModal(false);
        }}
        title="Change Password"
      >
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <Label className="text-gray-700">User Name</Label>
            <div className="relative">
              <Input
                type="text"
                value={forgotDetails.username}
                onChange={(e) =>
                  setForgotDetails((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="h-11 pr-10 rounded-xl"
                placeholder="Enter user name"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <Label className="text-gray-700">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={forgotDetails.password}
                onChange={(e) => {
                  const value = e.target.value;
                  // setNewPassword(value);

                  // validation
                  const msg = validatePassword(value);
                  setErrors((prev) => ({ ...prev, newPassword: msg }));

                  // store
                  setForgotDetails((prev) => ({ ...prev, password: value }));
                }}
                className="h-11 pr-10 rounded-xl"
                placeholder="Enter new password"
                required
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label className="text-gray-700">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={forgotDetails.confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // setConfirmPassword(value);

                  // validation
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword:
                      value !== forgotDetails.password
                        ? "Passwords do not match"
                        : "",
                  }));

                  // store
                  setForgotDetails((prev) => ({
                    ...prev,
                    confirmPassword: value,
                  }));
                }}
                className="h-11 pr-10 rounded-xl"
                placeholder="Confirm new password"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={() => {
              resetForgotPasswordModal();
              setForgotModal(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleForgotPassword}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </Modal>
    </header>
  );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Users,
  UserCheck,
  UserX,
  EyeOff,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { toast } from "react-toastify";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LuImageUp } from "react-icons/lu";

import { Label } from "./ui/label";
import { baseURL } from "../config/apiConfig";
import ShimmerChartSkeleton from "./ui/ShimmerChartSkeleton";
import cryptoService from "../services/cryptoService";
import Modal from "./ui/Modal";
import Profile from "../assets/profile.png";
interface UserDetails {
  username: string;
  fullname: string;
}
interface UsersData {
  id: number;
  image: string;
  isDeleted?: boolean;
  fullName?: string;
  username?: string;
  designation?: string;
  role?: string;
  noOfClients?: number;
}

export default function SalesUsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersData, setUsersData] = useState<UsersData[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [profileCursor, setProfileCursor] = useState(false);
  const [formCursor, setFormCursor] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    role: "",
    designation: undefined,
    image: null as File | null,
    fileName: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [desginationType, setDesginationType] = useState<string[]>([]);
  const [designationError, setDesignationError] = useState(false);

  const navigate = useNavigate();

  // const capitalizeWords = (str: string) => {
  //   return str.replace(/\b\w/g, (char) => char.toUpperCase());
  // };
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

    return ""; // valid password
  };

  const filteredUsers = usersData.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.designation?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      (user.isDeleted ? "inactive" : "active").includes(search)
    );
  });
  const capitalizeWords = (str?: string) => {
    if (!str) return "";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const totalUsers = usersData.length;
  const activeUsers = usersData.filter(
    (u) => u.isDeleted !== null && !u.isDeleted
  ).length;
  const inactiveUsers = usersData.filter(
    (u) => u.isDeleted !== null && u.isDeleted
  ).length;

  const loadAllUsers = async () => {
    try {
      setProfileCursor(true);
      const response = await fetch(`${baseURL}user/loadAll`);

      if (!response.ok) {
        toast.error("Failed to load users");
        setProfileCursor(false);
        return;
      }

      const data: UsersData[] = await response.json();
      setUsersData(data);
      setProfileCursor(false);
    } catch (error) {
      setProfileCursor(false);
      toast.error("Something went wrong while loading users");
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);
  // Load user details from localStorage only once
  useEffect(() => {
    const result = localStorage.getItem("details");
    if (result) {
      const res: UserDetails = JSON.parse(result);
      setUserDetails(res);

      // Update formData with username
      setFormData((prev) => ({
        ...prev,
        registeredBy: res.username || "",
      }));
    }
  }, []);
  useEffect(() => {
    const fetchDesginationTypes = async () => {
      try {
        const res = await fetch(`${baseURL}product-type/designation`, {
          method: "GET",
        });

        if (!res.ok) {
          setDesignationError(true);
          return;
        }
        const data = await res.json();
        if (res.status === 200) {
          setDesginationType(data || []);
        }
      } catch (error) {
        setDesignationError(true);
        console.error("Error fetching product types:", error);
        toast.error("Failed to load designation list");
      }
    };

    fetchDesginationTypes();
  }, []);

  const loadUserForEdit = async (id: number) => {
    try {
      setFormCursor(true);
      const response = await fetch(`${baseURL}user/${id}`);
      if (!response.ok) {
        toast.error("Failed to load user details");
        setFormCursor(false);
        return;
      }

      const user = await response.json();
      const decryptedPassword = user.password
        ? cryptoService.decrypt(user.password)
        : "";
      setFormData({
        id: user.id,
        username: user.username.toLowerCase() || "",
        fullName: user.fullName || "",
        password: decryptedPassword || "",
        confirmPassword: decryptedPassword || "",
        role: user.role || "",
        designation: user.designation || "",
        image: user.image || null,
        fileName: user.fileName ? user.fileName : "",
      });
      setFormCursor(false);
    } catch (err) {
      setFormCursor(false);
      toast.error("Error loading user data");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("image", reader.result as string);
      handleChange("fileName", file.name);
    };
    reader.readAsDataURL(file);
  };
  const resetForm = () => {
    setFormData({
      id: null,
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      role: "",
      designation: undefined,
      image: null,
      fileName: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (editId: number) => {
    loadUserForEdit(editId);
    setShowAddUser(true);
    setEditIndex(editId);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch(`${baseURL}user/${selectedUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to Delete User");
        return;
      }

      toast.success("User Deleted Successfully");
      loadAllUsers(); // refresh list
    } catch (error) {
      toast.error("Something went wrong while deleting user");
    }

    setModalOpen(false); // close modal
    setSelectedUserId(null); // reset
  };

  const handleDelete = (id: number) => {
    setSelectedUserId(id); // store user ID
    setModalOpen(true); // open modal
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const encryptedPassword = cryptoService.encrypt(formData.password);

    // Email validation
    // if (!formData.username.endsWith("@clonetab.com")) {
    //   toast.error("Email must end with @clonetab.com");
    //   return;
    // }
    console.log("passwordError", passwordError);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!editIndex) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
    }

    const method = editIndex ? "PUT" : "POST";
    const url = `${baseURL}user`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: encryptedPassword,
          confirmPassword: encryptedPassword,
          fileName: formData.fileName,
        }),
      });
      // Read response safely (text or JSON)
      let message = "";
      const text = await response.text();

      // Try to parse JSON — if fails, use plain text
      try {
        const json = JSON.parse(text);
        message = json.message || text;
      } catch {
        message = text;
      }

      console.log("FINAL MESSAGE:", message);

      // ⚠️ Handle Status 208
      if (response.status === 208) {
        toast.error(message || "User already exists!");
        return;
      }

      // ✅ Handle Success
      if (response.status === 200 || response.status === 201) {
        toast.success(editIndex ? "User updated!" : "User registered!");
        resetForm();
        loadAllUsers();
        setEditIndex(null);
        setShowAddUser(false);
        return;
      }

      // ❌ Unexpected status
      toast.error(message || "Something went wrong!");
    } catch (error: any) {
      console.error("ERROR:", error);
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  // If Add User is clicked
  if (showAddUser) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <TopBar />

          <main className="p-8 bg-[#F5F7FA] min-h-screen">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="font-bold">
                    {editIndex ? "Edit User" : "User Registration"}
                  </h1>
                  {/* {!editIndex && (
                    <p className="text-gray-500">Register a new User</p>
                  )} */}
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    setShowAddUser(false);
                    setEditIndex(null);
                    resetForm();
                  }}
                >
                  Close
                </Button>
              </div>
              {formCursor ? (
                <ShimmerChartSkeleton form={true} />
              ) : (
                <div className="bg-white rounded-[20px] p-10 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="clientName"
                          placeholder="Enter full name"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleChange("fullName", e.target.value)
                          }
                          className="h-14 rounded-xl border-gray-200"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="username">Email</Label>
                        <Input
                          id="username"
                          placeholder="Enter your email"
                          value={formData.username}
                          onChange={(e) =>
                            handleChange("username", e.target.value)
                          }
                          className="h-14 rounded-xl border-gray-200"
                          required
                          disabled={!!editIndex}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="image">Profile Image</Label>

                      <div className="flex items-center gap-3">
                        {/* FILENAME DISPLAY */}
                        <Input
                          value={formData.fileName}
                          readOnly
                          className="h-14 rounded-xl border-gray-200"
                          placeholder="No file selected"
                        />

                        {/* ICON TO TRIGGER UPLOAD */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300"
                        >
                          <LuImageUp size={22} />
                        </button>
                      </div>

                      {/* HIDDEN FILE INPUT */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>

                    <div
                      className={`${
                        editIndex && "hidden"
                      } grid grid-cols-2 gap-8`}
                    >
                      <div className="space-y-3">
                        <Label htmlFor="password">Password</Label>

                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleChange("password", value);
                              if (!editIndex)
                                setPasswordError(validatePassword(value));
                            }}
                            className={`rounded-xl h-14 pr-12 ${
                              passwordError
                                ? "border-red-400"
                                : "border-green-400"
                            }`}
                            required={!editIndex}
                            disabled={!!editIndex}
                          />

                          {/* EYE ICON */}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-600"
                          >
                            {showPassword ? (
                              <Eye size={20} />
                            ) : (
                              <EyeOff size={20} />
                            )}
                          </button>
                        </div>

                        {/* Error / Success */}
                        {passwordError ? (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordError}
                          </p>
                        ) : formData.password.length > 0 ? (
                          <p className="text-green-600 text-sm mt-1">
                            Strong password ✓
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>

                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleChange("confirmPassword", e.target.value)
                            }
                            className="rounded-xl border-gray-200 h-14 pr-12"
                            required={!editIndex}
                            disabled={!!editIndex}
                          />

                          {/* EYE ICON */}
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-4 text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <Eye size={20} />
                            ) : (
                              <EyeOff size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label>Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: string) =>
                            handleChange("role", value)
                          }
                          required
                        >
                          <SelectTrigger className="h-14 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select your Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            <SelectItem
                              value="user"
                              className="hover:bg-blue-200 "
                            >
                              User
                            </SelectItem>
                            <SelectItem
                              value="admin"
                              className="hover:bg-blue-200 "
                            >
                              Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Product Type Dropdown */}
                      <div className="space-y-3">
                        <Label>Designation</Label>
                        <Select
                          value={formData.designation}
                          onValueChange={(value: string) =>
                            handleChange("designation", value)
                          }
                          required
                        >
                          <SelectTrigger className="h-14 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select your Desgination" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            {designationError ? (
                              <SelectItem value="error" disabled>
                                ❌ Failed to load designation
                              </SelectItem>
                            ) : desginationType.length > 0 ? (
                              desginationType.map((type, index) => (
                                <SelectItem
                                  className="hover:bg-blue-200"
                                  key={index}
                                  value={type}
                                >
                                  {type}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-xl bg-[#1E88E5] hover:bg-[#4B9CD3] text-white"
                      >
                        {editIndex
                          ? "Update Registration"
                          : "Submit Registration"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[#F5F7FA] p-8">
          <div className="space-y-6 w-full">
            {/* ===================== QUICK STATS ===================== */}
            {profileCursor ? (
              <ShimmerChartSkeleton col={true} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-4">
                {/* Total Sales Users */}
                <div className="bg-white w-full h-24 rounded-2xl p-6 shadow-sm border-l-4 border-[#1E88E5] rounded-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Total Users</p>
                      <h2 className="text-gray-900">{totalUsers}</h2>
                    </div>
                    <div className="p-3 bg-[#E8F4FF] rounded-xl">
                      <Users className="w-6 h-6 text-[#1E88E5]" />
                    </div>
                  </div>
                </div>

                {/* Active Users */}
                <div className="bg-white w-full h-24 rounded-2xl p-6 shadow-sm border-l-4 border-[#3DB5C9] rounded-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Active Users</p>
                      <h2 className="text-gray-900">{activeUsers}</h2>
                    </div>
                    <div className="p-3 bg-[#E0F7FA] rounded-xl">
                      <UserCheck className="w-6 h-6 text-[#3DB5C9]" />
                    </div>
                  </div>
                </div>

                {/* Inactive Users */}
                <div className="bg-white w-full h-24 rounded-2xl p-6 shadow-sm border-l-4 border-gray-300 rounded-[20px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        Inactive Users
                      </p>
                      <h2 className="text-gray-900">{inactiveUsers}</h2>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <UserX className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== PAGE TITLE ===================== */}
            {/* <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900 mb-2">Sales Users</h1>
                <p className="text-gray-500">Manage your sales team members</p>
              </div>
            </div> */}

            {/* ===================== SEARCH + ADD ===================== */}
            <div className="flex items-center gap-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-gray-200 shadow-sm"
                />
              </div>

              <Button
                className="bg-[#1E88E5] hover:bg-[#1976D2] text-white h-12 px-6 rounded-xl"
                onClick={() => setShowAddUser(true)}
              >
                <Plus className="w-5 h-5" />
                Add User
              </Button>
            </div>

            {/* ===================== USERS CARDS ===================== */}
            {profileCursor ? (
              <div>
                <ShimmerChartSkeleton card={true} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-6">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 col-span-full">
                    No users found
                  </p>
                ) : (
                  filteredUsers
                    .filter((user) => user.isDeleted === false)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="relative group bg-white rounded-2xl p-10 shadow-md border-2 border-transparent 
          transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#AEE0FF] overflow-hidden"
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div
                            className="absolute -inset-20 bg-gradient-to-br from-white/10 to-white/5 
            transform rotate-12 translate-y-10 animate-shine"
                          ></div>
                        </div>

                        {/* === Image === */}
                        <div className="flex justify-center">
                          <ImageWithFallback
                            src={user.image ? `${user.image}` : Profile}
                            alt={user.fullName}
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#E8F4FF] shadow-sm 
              transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2"
                          />
                        </div>

                        {/* === Name & Role === */}
                        <div className="text-center space-y-2 mb-4 mt-4 transition-all duration-300">
                          <h3 className="mb-4 text-gray-900 font-semibold text-2xl group-hover:text-[#1E88E5] transition-colors duration-300">
                            {capitalizeWords(user?.fullName)}
                          </h3>

                          <span
                            className="px-6 py-2 rounded-full text-base font-semibold bg-[#ECF6FF] text-[#1E88E5] shadow-sm
            group-hover:bg-[#DDF0FF] transition-all duration-300"
                          >
                            {capitalizeWords(user?.designation)}
                          </span>
                        </div>

                        {/* Username */}
                        <div className="text-center mb-6 mt-6">
                          <span className="text-gray-600 text-sm font-medium group-hover:text-gray-900 transition-colors duration-300">
                            {user.username}
                          </span>
                        </div>

                        <hr className="my-3 border-gray-100" />

                        {/* Metrics */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-500 text-base">
                            Clients Registered
                          </span>
                          <span className="text-gray-900 font-bold text-2xl group-hover:scale-110 transition-transform duration-300">
                            {user.noOfClients}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="mb-6 flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                              user.isDeleted
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700 group-hover:shadow-md group-hover:scale-105"
                            }`}
                          >
                            {user.isDeleted ? "Inactive" : "Active"}
                          </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white h-12 rounded-xl text-base 
              font-medium w-36 transition-transform duration-300 hover:scale-[1.03]"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Eye className="w-5 h-5 mr-1" />
                            View Profile
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleDelete(user.id)}
                            className="h-12 w-12 px-3 rounded-xl border-red-300 text-red-600 hover:bg-red-50 
              transition-all duration-300 hover:scale-110 flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Delete User?"
          >
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this user?
            </p>

            <div className="flex justify-end gap-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white h-10 px-6 rounded-xl"
                onClick={confirmDelete}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="h-10 px-6 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}

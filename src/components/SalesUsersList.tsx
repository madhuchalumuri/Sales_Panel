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
interface UserDetails {
  username: string;
  fullname: string;
}

export default function SalesUsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id: null,
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    role: "",
    designation: "",
    image: null as File | null,
    fileName: "",
  });

  const navigate = useNavigate();

  const filteredUsers = usersData.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      (user.isDeleted ? "inactive" : "active").includes(search)
    );
  });

  const totalUsers = usersData.length;
  const activeUsers = usersData.filter(
    (u) => u.isDeleted !== null && !u.isDeleted
  ).length;
  const inactiveUsers = usersData.filter(
    (u) => u.isDeleted !== null && u.isDeleted
  ).length;

  const loadAllUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/user/loadAll");

      if (!response.ok) {
        toast.error("Failed to load users");
        return;
      }

      const data = await response.json();
      setUsersData(data);
    } catch (error) {
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

  const loadUserForEdit = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/user/${id}`);
      if (!response.ok) {
        toast.error("Failed to load user details");
        return;
      }

      const user = await response.json();

      setFormData({
        id: user.id,
        username: user.username || "",
        fullName: user.fullName || "",
        password: "",
        confirmPassword: "",
        role: user.role || "",
        designation: user.designation || "",
        image: user.image || null,
        fileName: user.fileName ? user.fileName : "",
      });
    } catch (err) {
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
      designation: "",
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/user/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to Delete User");
        return;
      }

      toast.success("User Deleted Successfully");
      loadAllUsers();
    } catch (error) {
      toast.error("Something went wrong while deleting user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editIndex) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
    }

    const method = editIndex ? "PUT" : "POST";
    const url = `http://localhost:8080/api/v1/user`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                Add New User
              </h1>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setShowAddUser(false);
                  setEditIndex(null);
                }}
              >
                Close
              </Button>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1>{editIndex ? "Edit User" : "User Registration"}</h1>
                {!editIndex && (
                  <p className="text-gray-500">Register a new User</p>
                )}
              </div>

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

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        className="rounded-xl border-gray-200"
                        required={!editIndex}
                        disabled={!!editIndex}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        className="rounded-xl border-gray-200"
                        required={!editIndex}
                        disabled={!!editIndex}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label>Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleChange("role", value)}
                        required
                      >
                        <SelectTrigger className="h-14 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select your Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Product Type Dropdown */}
                    <div className="space-y-3">
                      <Label>Designation</Label>
                      <Select
                        value={formData.designation}
                        onValueChange={(value) =>
                          handleChange("designation", value)
                        }
                        required
                      >
                        <SelectTrigger className="h-14 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select your Desgination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sales Executive">
                            Sales Executive
                          </SelectItem>
                          <SelectItem value="Demo Specialist">
                            Demo Specialist
                          </SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
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
            <div className=" flex gap-6 overflow-x-auto whitespace-nowrap pb-4">
              <div className="bg-white w-72 h-48 rounded-2xl p-6 shadow-sm border-l-4 border-[#1E88E5] inline-block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Total Sales Users
                    </p>
                    <h2 className="text-gray-900">{totalUsers}</h2>
                  </div>
                  <div className="p-3 bg-[#E8F4FF] rounded-xl">
                    <Users className="w-6 h-6 text-[#1E88E5]" />
                  </div>
                </div>
              </div>

              <div className="bg-white w-72 h-48 rounded-2xl p-6 shadow-sm border-l-4 border-[#3DB5C9] inline-block">
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

              <div className="bg-white w-72 h-48 rounded-2xl p-6 shadow-sm border-l-4 border-gray-300 inline-block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Inactive Users</p>
                    <h2 className="text-gray-900">{inactiveUsers}</h2>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <UserX className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== PAGE TITLE ===================== */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900 mb-2">Sales Users</h1>
                <p className="text-gray-500">Manage your sales team members</p>
              </div>
            </div>

            {/* ===================== SEARCH + ADD ===================== */}
            <div className="flex items-center gap-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-gray-200 shadow-sm"
                />
              </div>

              <Button
                className="bg-[#1E88E5] hover:bg-[#1976D2] text-white h-14 px-6 rounded-xl"
                onClick={() => setShowAddUser(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </Button>
            </div>

            {/* ===================== USERS CARDS ===================== */}
            <div className="flex gap-6 overflow-x-auto whitespace-nowrap pb-6">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white w-80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#AEE0FF] border-2 border-transparent transition-all inline-block"
                  >
                    <div className="flex flex-col items-center mb-4">
                      <ImageWithFallback
                        src={user.image ? `${user.image}` : undefined}
                        alt={user.fullName}
                        className="w-14 h-14 rounded-full object-cover mb-3 border-4 border-[#E8F4FF]"
                      />

                      <h3 className="text-gray-900 text-center mb-1">
                        {user.fullName}
                      </h3>

                      <span className="px-3 py-1 rounded-full text-sm bg-[#E8F4FF] text-[#1E88E5]">
                        Sales Executive
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600 text-sm truncate">
                        {user.username}
                      </p>
                      <p className="text-gray-600 text-sm">{user.phone}</p>
                    </div>

                    <div className="bg-[#F5F7FA] rounded-xl p-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">
                          Clients Registered
                        </span>
                        <span className="text-gray-900">25</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                          Conversion Rate
                        </span>
                        <span className="text-[#3DB5C9]">30%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.isDeleted
                            ? "bg-[#E0F7FA] text-[#3DB5C9]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.isDeleted ? "Inactive" : "Active"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white h-10 rounded-xl"
                        onClick={() => handleEdit(user.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                        className="h-10 px-3 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

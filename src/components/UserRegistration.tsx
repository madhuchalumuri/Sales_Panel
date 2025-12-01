import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LuImageUp } from "react-icons/lu";
import { toast } from "react-toastify";

interface UserDetails {
  username: string;
  fullname: string;
}

export default function UserRegistration() {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get("id"); // NULL = Register mode, NOT NULL = Edit mode
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (editId) {
      loadUserForEdit(editId);
    }
  }, [editId]);

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
  const loadUserForEdit = async (id) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
    }

    const method = editId ? "PUT" : "POST";
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
        toast.success(editId ? "User updated!" : "User registered!");
        resetForm();

        if (editId) {
          navigate("/users");
        }
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />

        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1>{editId ? "Edit User" : "User Registration"}</h1>
              {!editId && <p className="text-gray-500">Register a new User</p>}
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
                      onChange={(e) => handleChange("fullName", e.target.value)}
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
                      onChange={(e) => handleChange("username", e.target.value)}
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
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="rounded-xl border-gray-200"
                      required={!editId}
                      disabled={!!editId}
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
                      required={!editId}
                      disabled={!!editId}
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
                    {editId ? "Update Registration" : "Submit Registration"}
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

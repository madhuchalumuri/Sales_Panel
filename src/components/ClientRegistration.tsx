import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "react-toastify";

interface UserDetails {
  username: string;
  fullname: string;
}

export default function ClientRegistration() {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    clientName: "",
    companyName: "",
    phone: "",
    productType: "",
    registeredBy: "", // will be updated after localStorage loads
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/v1/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 208) {
        const err = await response.text(); // server returns raw string, not JSON
        toast.error(err || "Client already exists");
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.message || "Failed to register client");
        return;
      }

      toast.success("Client registered successfully!");
      setTimeout(() => navigate("/registered-clients"), 800);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleChange = (field: string, value: string) => {
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
              <h1>Client Registration</h1>
              <p className="text-gray-500">Register a new client</p>
            </div>

            <div className="bg-white rounded-[20px] p-10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={(e) =>
                        handleChange("clientName", e.target.value)
                      }
                      className="h-14 rounded-xl border-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleChange("companyName", e.target.value)
                      }
                      className="h-14 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="client@company.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-14 rounded-xl border-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 555-000-0000"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="h-14 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Product Type Dropdown */}
                <div className="space-y-3">
                  <Label>Product Type</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) =>
                      handleChange("productType", value)
                    }
                  >
                    <SelectTrigger className="h-14 rounded-xl border-gray-200">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl bg-[#1E88E5] hover:bg-[#4B9CD3] text-white"
                  >
                    Submit Registration
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

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Eye, Check, Copy, Plus, Key } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "react-toastify";
import { Label } from "./ui/label";
import { baseURL } from "../config/apiConfig";
import ShimmerChartSkeleton from "./ui/ShimmerChartSkeleton";
interface UserDetails {
  username: string;
  fullname: string;
  role: string;
}
interface Client {
  email: string;
  clientName: string;
  registeredBy?: string;
  licenseKey?: string;
}

export default function RegisteredClients() {
  const [showAddUser, setShowAddUser] = useState(false);
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [product, setProduct] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [busyCursor, setBusyCursor] = useState(false);
  const [productTypeError, setProductTypeError] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    clientName: "",
    companyName: "",
    phone: "",
    productType: "",
    registeredBy: "", // will be updated after localStorage loads
  });
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (location.state) {
      setStatusFilter(location.state.selectedProduct);
      navigate(location.pathname, { replace: true });
    }
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
    const fetchProductTypes = async () => {
      try {
        const res = await fetch(`${baseURL}product-type/product`, {
          method: "GET",
        });
        if (!res.ok) {
          setProductTypeError(true);
          return;
        }
        const data = await res.json();
        if (res.status === 200) {
          setProductTypes(data || []);
        }
      } catch (error) {
        setProductTypeError(true);
        console.error("Error fetching product types:", error);
        toast.error("Failed to load designation list");
      }
    };

    fetchProductTypes();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "email" ? value.toLowerCase() : value,
    }));
  };
  // 🚀 API CALL (Load all clients)
  const loadAllClients = async (role: String) => {
    try {
      setBusyCursor(true);
      let response;
      if (role === "admin") {
        response = await fetch(`${baseURL}client/loadAll`, {
          method: "GET",
        });
      } else {
        response = await fetch(
          `${baseURL}client/registeredBy/${userDetails?.username}`,
          {
            method: "GET",
          }
        );
      }
      if (!response.ok) {
        setBusyCursor(false);
        toast.error("Failed to load clients");
        return;
      }

      const data: Client[] = await response.json();

      setClients(data); // store in state
      setBusyCursor(false);
    } catch (error) {
      setBusyCursor(false);
      console.error("LoadAll API Error:", error);
      toast.error("Something went wrong while loading clients");
    }
  };

  useEffect(() => {
    if (userDetails) loadAllClients(userDetails.role);
  }, [userDetails]);
  const resetClients = () => {
    setFormData({
      email: "",
      clientName: "",
      companyName: "",
      phone: "",
      productType: "",
      registeredBy: userDetails?.username ?? "",
    });
  };

  // ---------- COPY LICENSE ----------
  const copyToClipboard = (licenseKey: string) => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(licenseKey);
    toast.success("License key copied!");

    setTimeout(() => setCopiedKey(null), 2000);
  };
  // ---------- WHEN EMAIL CHANGES FIND NAME ----------
  const handleEmailChange = (email: string) => {
    setClientEmail(email);
    const client = clients.find((c) => c.email === email);
    setClientName(client?.clientName || "");
  };
  const resetForm = () => {
    setProduct("");
    setClientName("");
    setClientEmail("");
    setExpiryDate("");
  };

  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const maxDate = threeMonthsLater.toISOString().split("T")[0];

  // ---------- GENERATE LICENSE ----------
  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    // MAC validation
    // if (!validateMacAddress(product)) {
    //   toast.error("Invalid MAC address format!");
    //   return;
    // }

    try {
      const response = await fetch(`${baseURL}generateKey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: clientEmail,
          macAddress: product,
          expDate: expiryDate,
          registeredBy: userDetails?.username || "",
        }),
      });

      const result = await response.json();
      setGeneratedKey(result?.licenseKey);
      if (!userDetails) {
        toast.error("Enable to Load Clients Data");
        return;
      }
      loadAllClients(userDetails.role);

      toast.success("License key generated successfully!");
      resetForm();
    } catch (error) {
      console.error("Generate Key API Error:", error);
      toast.error("Failed to generate license key");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}client`, {
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
      setShowAddUser(false);
      loadAllClients(userDetails?.role || "");
      resetClients();
      toast.success("Client registered successfully!");
      setTimeout(() => navigate("/registered-clients"), 800);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  const filteredLicense = clients.filter((client) => !client.licenseKey);
  // 🔎 Search + Filter Logic
  const filteredClients = clients.filter((client: any) => {
    const matchesSearch =
      client.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.status?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (client.status || "Unknown") === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const getStatusText = (value: string) => {
    if (value === "Active") return "Active";
    if (value === "Expired") return "Expired";
    if (value === "Expiring Soon") return "Expiring Soon";
    return "InActive";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E8F4FF] text-[#1E88E5]";
      case "Expiring Soon":
        return "bg-[#FEF3E8] text-orange-600";
      case "Expired":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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
                  <h1 className="font-bold">Client Registration</h1>
                  {/* <p className="text-gray-500">Register a new client</p> */}
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    setShowAddUser(false);
                    setGeneratedKey("");
                    resetClients();
                  }}
                >
                  Close
                </Button>
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
                        placeholder="Enter client email"
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
                      onValueChange={(value: string) =>
                        handleChange("productType", value)
                      }
                    >
                      <SelectTrigger className="h-14 rounded-xl border-gray-200">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>

                      <SelectContent className="bg-white border-gray-300">
                        {productTypeError ? (
                          <SelectItem value="error" disabled>
                            ❌ Failed to load product types
                          </SelectItem>
                        ) : productTypes.length > 0 ? (
                          productTypes.map((type, index) => (
                            <SelectItem key={index} value={type}>
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        {showLicenseForm ? (
          <div>
            <main className="p-8">
              <div className="max-w-3xl mx-auto">
                {/* Generated Key Section */}
                {generatedKey.length > 0 && (
                  <div className="bg-white rounded-[20px] p-10 shadow-sm mb-3">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[#E8F4FF] rounded-xl flex items-center justify-center">
                        <Key className="w-6 h-6 text-[#1E88E5]" />
                      </div>
                      <h2>Generated License Key</h2>
                    </div>

                    <div className="bg-gradient-to-br from-[#E8F4FF] to-[#AEE0FF] p-8 rounded-xl border-2 border-[#4B9CD3]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-3">
                            License Key for {clientName}
                          </p>
                          <p className="text-xl tracking-widest text-[#1E88E5]">
                            {generatedKey.length > 35
                              ? generatedKey.slice(0, 35) + "..."
                              : generatedKey}
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            copyToClipboard(generatedKey);
                          }}
                          className="h-14 px-6 bg-[#1E88E5]"
                        >
                          {copiedKey ? (
                            <>
                              <Check className="w-5 h-5 mr-2" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 mr-2" /> Copy Key
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        This license key has been generated for{" "}
                        <span className="text-gray-900">{product}</span>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1>License Key Generator</h1>
                    <p className="text-gray-500">
                      Generate unique license keys for your clients
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      setShowLicenseForm(false);
                    }}
                  >
                    Close
                  </Button>
                </div>

                {/* Form */}
                <div className="bg-white rounded-[20px] p-10 shadow-sm mb-6">
                  <form onSubmit={generateKey} className="space-y-8">
                    {/* Client Email Dropdown */}
                    <div className="space-y-3">
                      <Label>Client Email</Label>
                      <Select
                        value={clientEmail}
                        onValueChange={handleEmailChange}
                      >
                        <SelectTrigger className="h-14 rounded-xl border-gray-200">
                          <SelectValue placeholder="Select client email" />
                        </SelectTrigger>

                        <SelectContent className="bg-white border-gray-300">
                          {filteredLicense.length > 0 ? (
                            filteredLicense
                              // .filter((client) => client.licenseKey)
                              .map((client) => (
                                <SelectItem
                                  key={client.email}
                                  value={client.email}
                                >
                                  {client.clientName} — {client.email}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="p-3 text-gray-400">
                              No clients found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* MAC Address */}
                    <div className="space-y-3">
                      <Label>MAC Address</Label>
                      <Input
                        placeholder="00:1B:44:11:3A:B7"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="h-14"
                        required
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-3">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={expiryDate}
                        min={new Date().toISOString().split("T")[0]}
                        max={maxDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="h-14"
                        required
                      />
                    </div>

                    {/* Button */}
                    <Button type="submit" className="w-full h-14 bg-[#1E88E5]">
                      <Key className="w-5 h-5 mr-2" />
                      Generate License Key
                    </Button>
                  </form>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div>
            <main className="p-8">
              <div className="mb-8">
                <h1>Registered Clients</h1>
                {/* <p className="text-gray-500">
                  View and manage all registered clients
                </p> */}
              </div>

              {/* Search + Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by company, status or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-[#4B9CD3]"
                  />
                </div>

                <Button
                  className="bg-[#1E88E5] hover:bg-[#1976D2] text-white h-12 rounded-xl"
                  onClick={() => setShowAddUser(true)}
                >
                  <Plus className="w-5 h-5" />
                  Add Client
                </Button>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-64 h-14 rounded-xl border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="InActive">In Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {busyCursor ? (
                <ShimmerChartSkeleton table={true} />
              ) : (
                <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {/* <th className="text-left p-6 text-gray-600">
                          Client Name
                        </th> */}
                          <th className="text-left p-6 text-gray-600">Email</th>

                          <th className="text-left p-6 text-gray-600">
                            Company
                          </th>
                          <th className="text-left p-6 text-gray-600">Phone</th>
                          <th className="text-left p-6 text-gray-600">
                            Product
                          </th>
                          <th className="text-left p-6 text-gray-600">
                            Expiry Date
                          </th>
                          <th className="text-left p-6 text-gray-600">
                            Status
                          </th>
                          <th className="text-left p-6 text-gray-600">
                            License key
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedClients.map((client: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            {/* <td className="p-6 text-gray-900">
                            {capitalizeWords(client.clientName)}
                          </td> */}

                            <td className="p-2 text-gray-600">
                              {client.email}
                            </td>
                            <td className="p-2 text-gray-900">
                              {capitalizeWords(client.companyName)}
                            </td>
                            <td className="p-2 text-gray-600">
                              {client.phone}
                            </td>
                            <td className="p-2 text-gray-600">
                              {client.productType}
                            </td>
                            <td className="p-2 text-gray-900">
                              {client.expDate || "—"}
                            </td>
                            <td className="p-2">
                              {(() => {
                                const statusText = getStatusText(client.status);
                                return (
                                  <span
                                    className={`px-4 py-2 rounded-xl text-sm ${getStatusClass(
                                      statusText
                                    )}`}
                                  >
                                    {statusText}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-2">
                              {client.licenseKey !== null ? (
                                <Button
                                  onClick={() => {
                                    copyToClipboard(client.licenseKey);
                                  }}
                                  className="bg-[#1E88E5]"
                                >
                                  {copiedKey === client.licenseKey ? (
                                    <>
                                      <Check className="" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="" /> Copy Key
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setGeneratedKey("");
                                    setClientName("");
                                    setClientEmail("");
                                    setProduct("");
                                    setExpiryDate("");
                                    setShowLicenseForm(true);
                                  }}
                                  className="bg-green-600"
                                >
                                  Get License Key
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredClients.length > 0 && (
                      <div className="flex justify-center items-center gap-3 py-6">
                        <button
                          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </button>

                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {/* {clients.length > 0 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <button
                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>

                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )} */}
                  </div>

                  {filteredClients.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      No clients found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

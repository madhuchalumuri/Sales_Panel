import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Button } from "./ui/button";
import { ArrowLeft, Mail, Phone, Building2, Calendar, Key } from "lucide-react";
import { toast } from "sonner@2.0.3";

const mockClientData: Record<string, any> = {
  "1": {
    clientName: "John Smith",
    company: "Tech Solutions Inc",
    email: "john@techsolutions.com",
    phone: "+1 (555) 123-4567",
    productGiven: "Enterprise Suite",
    demoStartDate: "2025-11-01",
    demoExpiryDate: "2025-12-15",
    status: "Active",
    licenseKey: "ENT-2025-TECH-9X7K-MM4P",
  },
  "2": {
    clientName: "Sarah Johnson",
    company: "Digital Innovations",
    email: "sarah@digital.com",
    phone: "+1 (555) 234-5678",
    productGiven: "Pro Plan",
    demoStartDate: "2025-10-15",
    demoExpiryDate: "2025-11-28",
    status: "Expiring Soon",
    licenseKey: null,
  },
};

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = mockClientData[id || "1"];
  const [licenseKey, setLicenseKey] = useState(client?.licenseKey);

  if (!client) {
    return <div>Client not found</div>;
  }

  const generateLicenseKey = () => {
    const newKey = `${client.productGiven
      .substring(0, 3)
      .toUpperCase()}-2025-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    setLicenseKey(newKey);
    toast.success("License key generated successfully!");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />

        <main className="p-8">
          <Button
            onClick={() => navigate("/registered-clients")}
            className="mb-6 h-12 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>

          <div className="mb-8">
            <h1>Client Details</h1>
            <p className="text-gray-500">
              Complete information for {client.clientName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="col-span-2 bg-white rounded-[20px] p-8 shadow-sm">
              <h2 className="mb-8">Client Information</h2>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Client Name</span>
                    </div>
                    <p className="pl-13 text-gray-900">{client.clientName}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Company Name</span>
                    </div>
                    <p className="pl-13 text-gray-900">{client.company}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Email Address</span>
                    </div>
                    <p className="pl-13 text-gray-900">{client.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Phone Number</span>
                    </div>
                    <p className="pl-13 text-gray-900">{client.phone}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Key className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Product Given</span>
                    </div>
                    <p className="pl-13 text-gray-900">{client.productGiven}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <span className="text-gray-500">Demo Start Date</span>
                    </div>
                    <p className="pl-13 text-gray-900">
                      {client.demoStartDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-[20px] p-8 shadow-sm">
                <h3 className="mb-6">Status</h3>
                <span
                  className={`inline-block px-6 py-3 rounded-xl ${
                    client.status === "Active"
                      ? "bg-[#E8F4FF] text-[#1E88E5]"
                      : client.status === "Expiring Soon"
                      ? "bg-[#FEF3E8] text-orange-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] rounded-[20px] p-8 shadow-sm text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-white">Demo Expiry</h3>
                </div>
                <p className="text-white">{client.demoExpiryDate}</p>
              </div>
            </div>
          </div>

          {/* License Key Section */}
          <div className="mt-6 bg-white rounded-[20px] p-8 shadow-sm">
            <h2 className="mb-6">Assigned License Key</h2>

            {licenseKey ? (
              <div className="bg-[#E8F4FF] rounded-xl p-6 border-2 border-[#AEE0FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">License Key</p>
                    <p className="text-gray-900 tracking-wider">{licenseKey}</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(licenseKey);
                      toast.success("License key copied to clipboard!");
                    }}
                    className="h-12 px-6 rounded-xl bg-[#1E88E5] hover:bg-[#4B9CD3] text-white"
                  >
                    Copy Key
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-6">
                  No license key generated yet
                </p>
                <Button
                  onClick={generateLicenseKey}
                  className="h-14 px-8 rounded-xl bg-[#1E88E5] hover:bg-[#4B9CD3] text-white"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Generate License Key
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

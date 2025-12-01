import { useState, useEffect } from "react";
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
import { Key, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";

interface UserDetails {
  fullname: string;
  role?: string;
}

export default function LicenseKeyGenerator() {
  const [product, setProduct] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [clientList, setClientList] = useState<any[]>([]);
  const [userName, setUserName] = useState<UserDetails | null>(null);

  // ---------- MAC VALIDATION FUNCTION ----------
  // const validateMacAddress = (mac: string) => {
  //   const macRegex =
  //     /^([0-9A-Fa-f]{2})([:\-])([0-9A-Fa-f]{2})(\2[0-9A-Fa-f]{2}){4}$/;
  //   return macRegex.test(mac);
  // };

  // ---------- LOAD ALL CLIENTS ----------
  const loadAllClients = async () => {
    try {
      console.log(userName);
      const response = await fetch(
        `http://localhost:8080/api/v1/client/registeredBy/${userName.username}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        toast.error("Failed to load clients");
        return;
      }

      const data = await response.json();
      console.log("Loaded Clients:", data);

      setClientList(data);
    } catch (error) {
      console.error("LoadAll API Error:", error);
      toast.error("Something went wrong while loading clients");
    }
  };

  useEffect(() => {
    if (userName) {
      loadAllClients();
    }
  }, [userName]);

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
  // ---------- WHEN EMAIL CHANGES FIND NAME ----------
  const handleEmailChange = (email: string) => {
    setClientEmail(email);
    const client = clientList.find((c) => c.email === email);
    setClientName(client?.clientName || "");
  };
  const resetForm = () => {
    setProduct("");
    setClientName("");
    setClientEmail("");
    setExpiryDate("");
  };

  // ---------- GENERATE LICENSE ----------
  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    // MAC validation
    // if (!validateMacAddress(product)) {
    //   toast.error("Invalid MAC address format!");
    //   return;
    // }

    try {
      const response = await fetch("http://localhost:8080/api/v1/generateKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: clientEmail,
          macAddress: product,
          expDate: expiryDate,
          registeredBy: userName?.username ?? "",
          // licenseKey: key,
        }),
      });

      const result = await response.json();
      console.log("Generate Key Response:", result);
      setGeneratedKey(result?.licenseKey);
      loadAllClients();

      toast.success("License key generated successfully!");
      resetForm();
    } catch (error) {
      console.error("Generate Key API Error:", error);
      toast.error("Failed to generate license key");
    }
  };

  // ---------- COPY LICENSE ----------
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    toast.success("License key copied!");

    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- SEARCH FILTER ----------
  const filteredClients = clientList.filter((client) => !client.licenseKey);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />

        <main className="p-8">
          <div className="max-w-3xl mx-auto">
            {/* Generated Key Section */}
            {generatedKey && (
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
                      onClick={copyToClipboard}
                      className="h-14 px-6 bg-[#1E88E5]"
                    >
                      {copied ? (
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
            <div className="mb-8">
              <h1>License Key Generator</h1>
              <p className="text-gray-500">
                Generate unique license keys for your clients
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-[20px] p-10 shadow-sm mb-6">
              <form onSubmit={generateKey} className="space-y-8">
                {/* Client Email Dropdown */}
                <div className="space-y-3">
                  <Label>Client Email</Label>
                  <Select value={clientEmail} onValueChange={handleEmailChange}>
                    <SelectTrigger className="h-14 rounded-xl border-gray-200">
                      <SelectValue placeholder="Select client email" />
                    </SelectTrigger>

                    <SelectContent>
                      {filteredClients.length > 0 ? (
                        filteredClients
                          // .filter((client) => client.licenseKey)
                          .map((client) => (
                            <SelectItem key={client.email} value={client.email}>
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
    </div>
  );
}

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Users, Key, AlertCircle, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

const Dashboard = () => {
  interface UserDetails {
    fullname: string;
    role?: string;
  }
  const [userName, setUserName] = useState<UserDetails | null>(null);
  const [clients, setClients] = useState([]);
  const [activeClients, setActiveClients] = useState([]);

  const stats = [
    {
      title: "Total Clients",
      value: "142",
      icon: Users,
      color: "from-[#4B9CD3] to-[#1E88E5]",
      bg: "bg-[#E8F4FF]",
      change: "+12 this month",
    },
    {
      title: "Active Licenses",
      value: "89",
      icon: Key,
      color: "from-[#4B9CD3] to-[#1E88E5]",
      bg: "bg-[#E8F4FF]",
      change: "62% of total",
    },
    {
      title: "Expiring Soon",
      value: "18",
      icon: AlertCircle,
      color: "from-[#4B9CD3] to-[#1E88E5]",
      bg: "bg-[#FEF3E8]",
      change: "Within 7 days",
    },
  ];
  const chartData = [
    { month: "Jan", clients: 120 },
    { month: "Feb", clients: 145 },
    { month: "Mar", clients: 180 },
    { month: "Apr", clients: 165 },
    { month: "May", clients: 210 },
    { month: "Jun", clients: 245 },
    { month: "Jul", clients: 280 },
    { month: "Aug", clients: 310 },
    { month: "Sep", clients: 295 },
    { month: "Oct", clients: 340 },
    { month: "Nov", clients: 380 },
    { month: "Dec", clients: 420 },
  ];
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const recentClients = [
    {
      name: "Tech Solutions Inc",
      product: "Enterprise Suite",
      expiry: "2025-12-15",
      status: "Active",
    },
    {
      name: "Digital Innovations",
      product: "Pro Plan",
      expiry: "2025-11-28",
      status: "Expiring Soon",
    },
    {
      name: "Global Systems Ltd",
      product: "Basic Plan",
      expiry: "2025-11-22",
      status: "Expiring Soon",
    },
    {
      name: "Smart Analytics Co",
      product: "Enterprise Suite",
      expiry: "2026-01-10",
      status: "Active",
    },
  ];
  const recentKeys = [
    {
      id: "LK-2024-0847",
      client: "Acme Corporation",
      product: "Enterprise Suite",
      generatedOn: "2024-11-20",
      status: "Active",
    },
    {
      id: "LK-2024-0846",
      client: "Tech Innovations Ltd",
      product: "Pro Plan",
      generatedOn: "2024-11-19",
      status: "Active",
    },
    {
      id: "LK-2024-0845",
      client: "Digital Solutions Inc",
      product: "Enterprise Suite",
      generatedOn: "2024-11-18",
      status: "Active",
    },
    {
      id: "LK-2024-0844",
      client: "Global Systems",
      product: "Starter Plan",
      generatedOn: "2024-11-17",
      status: "Expired",
    },
    {
      id: "LK-2024-0843",
      client: "NextGen Tech",
      product: "Pro Plan",
      generatedOn: "2024-11-16",
      status: "Active",
    },
  ];
  const loadAllClients = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/client/loadAll",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        toast.error("Failed to load clients");
        return;
      }

      const data = await response.json();

      setClients(data); // store in state
      const filteredClients = data.filter(
        (item: any) => item.status === "Active"
      );
      setActiveClients(filteredClients);
    } catch (error) {
      console.error("LoadAll API Error:", error);
      toast.error("Something went wrong while loading clients");
    }
  };

  useEffect(() => {
    loadAllClients();
  }, []);
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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />

        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-xl bg-[#E8F4FF] flex items-center justify-center`}
                >
                  <Users className="w-7 h-7 text-[#1E88E5]" />
                </div>
              </div>
              <h3 className="text-gray-600 mb-2">Total Clients</h3>
              <div className="flex items-end justify-between">
                <p className="text-gray-900">{clients.length}</p>
                <span className="text-sm text-gray-500">+12 this month</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-xl bg-[#E8F4FF] flex items-center justify-center`}
                >
                  <Key className="w-7 h-7 text-[#1E88E5]" />
                </div>
              </div>
              <h3 className="text-gray-600 mb-2">Active Licenses</h3>
              <div className="flex items-end justify-between">
                <p className="text-gray-900">{activeClients.length}</p>
                <span className="text-sm text-gray-500">62% of total</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-xl bg-[#FEF3E8] flex items-center justify-center`}
                >
                  <AlertCircle className="w-7 h-7 text-[#1E88E5]" />
                </div>
              </div>
              <h3 className="text-gray-600 mb-2">Expiring Soon</h3>
              <div className="flex items-end justify-between">
                <p className="text-gray-900">{clients.length}</p>
                <span className="text-sm text-gray-500">Within 7 days</span>
              </div>
            </div>
          </div>
          {/* Chart */}

          {userName?.role === "admin" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-900 mb-6">Clients Added Per Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#1E88E5"
                    strokeWidth={3}
                    dot={{ fill: "#1E88E5", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Activity */}
          {/* <div className="bg-white rounded-[20px] p-8 shadow-sm">
            <h2 className="mb-6">Recent Client Activity</h2>

            <div className="space-y-4">
              {recentClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 rounded-xl bg-gray-50 hover:bg-[#E8F4FF] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AEE0FF] to-[#4B9CD3] flex items-center justify-center">
                      <span className="text-white">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.product}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="text-gray-900">{client.expiry}</p>
                    </div>

                    <span
                      className={`px-5 py-2 rounded-xl text-sm ${
                        client.status === "Active"
                          ? "bg-[#E8F4FF] text-[#1E88E5]"
                          : "bg-[#FEF3E8] text-orange-600"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Recent License Keys Table */}
          {/* {userName?.role === "admin" && ( */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-900 mb-6">
              Recent License Keys Generated
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600">
                      Client Email
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      Company Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      License Key
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      Expired On
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any, key: number) => (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-[#F5F7FA] transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-900">
                        {client.email}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {capitalizeWords(client.companyName)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {client.productType}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {client?.licenseKey && client.licenseKey.length > 10
                          ? client.licenseKey.slice(0, 10) + "..."
                          : "--"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {client.expDate ? client.expDate : "--"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            client.status === "Active"
                              ? "bg-[#E8F4FF] text-[#1E88E5]"
                              : client.status === "Expired Soon"
                              ? "bg-[#FEF3E8] text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {clients.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No Data Found
              </div>
            )}
          </div>
          {/* )} */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

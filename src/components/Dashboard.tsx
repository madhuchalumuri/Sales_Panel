import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Bar,
  BarChart,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import { baseURL } from "../config/apiConfig";
import Modal from "./ui/Modal";
import { VscError } from "react-icons/vsc";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ShimmerChartSkeleton from "./ui/ShimmerChartSkeleton";

const Dashboard = () => {
  interface UserDetails {
    fullname: string;
    role?: string;
  }
  interface ActiveCount {
    monthlyRegistrations: number;
    activePercentage: number;
    expCount: number;
  }
  interface ChartItem {
    username: string;
    registeredCount: number;
    expiredCount: number;
  }
  const [userName, setUserName] = useState<UserDetails | null>(null);
  const [clients, setClients] = useState([]);
  const [activeClients, setActiveClients] = useState([]);
  const [expiringClients, setExpiringClients] = useState([]);
  const [expiredClients, setExpiredClients] = useState([]);
  const [graphData, setGraphData] = useState<ChartItem[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [activeCountData, setActiveCountData] = useState<ActiveCount | null>(
    null
  );
  const [busyCursor, setBusyCursor] = useState(false);
  const [loadAllBusyCursor, setLoaddAllBusyCursor] = useState(false);
  const [activeBusyCursor, setActiveBusyCursor] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can change to any number

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentClients = clients.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const openModal = (title: string) => {
    navigate("/registered-clients", {
      state: { selectedProduct: title }, // <--- Pass your data here
    });
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const loadAllClients = async () => {
    try {
      setLoaddAllBusyCursor(true);
      const response = await fetch(`${baseURL}client/loadAll`, {
        method: "GET",
      });
      if (!response.ok) {
        toast.error("Failed to load clients");
        setLoaddAllBusyCursor(false);
        return;
      }
      const data = await response.json();
      setClients(data); // store in state
      const filteredClients = data.filter(
        (item: any) => item.status === "Active"
      );
      const filteredExpiringClients = data.filter(
        (item: any) => item.status === "Expiring Soon"
      );
      const filteredExpiredClients = data.filter(
        (item: any) => item.status === "Expired"
      );
      setExpiredClients(filteredExpiredClients);
      setExpiringClients(filteredExpiringClients);
      setActiveClients(filteredClients);
      setLoaddAllBusyCursor(false);
    } catch (error) {
      setLoaddAllBusyCursor(false);
      console.error("LoadAll API Error:", error);
      toast.error("Something went wrong while loading clients");
    }
  };
  // const loadGraph = async () => {
  //   try {
  //     setBusyCursor(true);
  //     const response = await fetch(`${baseURL}user/bar-graph`, {
  //       method: "GET",
  //     });
  //     if (!response.ok) {
  //       toast.error("Failed to load clients");
  //       setBusyCursor(false);
  //       return;
  //     }

  //     const data = await response.json();
  //     setGraphData(data);
  //     setBusyCursor(false);
  //   } catch (error) {
  //     setBusyCursor(false);

  //     console.error("LoadAll API Error:", error);
  //     toast.error("Something went wrong while loading clients");
  //   }
  // };

  const loadGraph = async (start?: string, end?: string) => {
    try {
      setBusyCursor(true);

      let url = `${baseURL}client/bar-graph`;

      // Build query params
      const params = new URLSearchParams();

      if (start) params.append("from", start);
      if (end) params.append("to", end);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        toast.error("Failed to load clients");
        setBusyCursor(false);
        return;
      }

      const data = await response.json();
      setGraphData(data);
      setBusyCursor(false);
    } catch (error) {
      setBusyCursor(false);
      console.error("LoadAll API Error:", error);
      toast.error("Something went wrong while loading clients");
    }
  };

  const activeCount = async () => {
    try {
      setActiveBusyCursor(true);
      const response = await fetch(`${baseURL}client/active-count`, {
        method: "GET",
      });
      if (!response.ok) {
        setActiveBusyCursor(false);
        toast.error("Failed to load clients");
        return;
      }
      const data = await response.json();
      setActiveCountData(data);
      setActiveBusyCursor(false);
    } catch (error) {
      console.error("Loading Active Count", error);
      setActiveBusyCursor(false);
      toast.error("Something went wrong while loading data");
    }
  };

  useEffect(() => {
    loadAllClients();
    activeCount();
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
  useEffect(() => {
    loadGraph();
  }, []);
  useEffect(() => {
    // Case 1: No dates selected → Load default graph
    if (!startDate && !endDate) {
      loadGraph();
      return;
    }

    // Case 2: If only one date is selected → Don't load yet
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }

    // Case 3: Invalid range → Show error & stop
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be earlier than end date");
      return;
    }

    // Case 4: Valid range → Load graph
    loadGraph(startDate, endDate);
  }, [startDate, endDate]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4 min-w-[180px]">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Username: <span className="font-normal">{data.username}</span>
          </p>

          <div className="mt-2 border-t border-gray-200 pt-2">
            <p className="text-sm text-blue-600 font-medium">
              Registered: {data.registeredCount}
            </p>
            <p className="text-sm text-red-600 font-medium">
              Expired: {data.expiredCount}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  const handleDateChange = (
    type: "start" | "end",
    value: string,
    startDate: string,
    endDate: string,
    setStartDate: any,
    setEndDate: any
  ) => {
    const newDate = new Date(value);

    // If user is selecting start date
    if (type === "start") {
      if (endDate && newDate > new Date(endDate)) {
        toast.error("Start date cannot be later than end date");
        return;
      }
      setStartDate(value);
    }

    // If user is selecting end date
    if (type === "end") {
      if (startDate && newDate < new Date(startDate)) {
        toast.error("End date cannot be earlier than start date");
        return;
      }
      setEndDate(value);
    }
  };

  // Map month numbers to names
  // const monthNames = [
  //   "Jan",
  //   "Feb",
  //   "Mar",
  //   "Apr",
  //   "May",
  //   "Jun",
  //   "Jul",
  //   "Aug",
  //   "Sep",
  //   "Oct",
  //   "Nov",
  //   "Dec",
  // ];

  // const chartData = Object.entries(graphData)
  //   .sort(([aKey], [bKey]) => {
  //     // Sort by year then month
  //     const [aYear, aMonth] = aKey.split("-").map(Number);
  //     const [bYear, bMonth] = bKey.split("-").map(Number);
  //     return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
  //   })
  //   .map(([key, clients]) => {
  //     const [year, month] = key.split("-");
  //     return {
  //       month: `${monthNames[Number(month) - 1]} ${year}`, // e.g., "Jan 2025"
  //       clients,
  //     };
  //   });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <TopBar />

        <main className="p-8">
          {/* Stats Grid */}
          {activeBusyCursor ? (
            <div className="mb-8">
              <ShimmerChartSkeleton dashboardCards={true} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* CARD COMPONENT */}
              {[
                {
                  label: "Total Licenses",
                  value: clients.length,
                  iconBg: "from-[#E8F4FF] to-[#D7EBFF]",
                  icon: Users,
                  sub: `${
                    activeCountData?.monthlyRegistrations ?? 0
                  } this month`,
                  shine: true,
                },
                {
                  label: "Active Licenses",
                  value: activeClients.length,
                  iconBg: "from-[#E8F4FF] to-[#D7EBFF]",
                  icon: Key,
                  sub: `${activeCountData?.activePercentage ?? 0}% of total`,
                  shine: true,
                },
                {
                  label: "Expiring Soon",
                  value: expiringClients.length,
                  iconBg: "from-[#FEF3E8] to-[#FDE6D0]",
                  icon: AlertCircle,
                  sub: "Within 7 days",
                  shine: false,
                },
                {
                  label: "Expired",
                  value: expiredClients.length,
                  iconBg: "from-[#FEF3E8] to-[#FDE6D0]",
                  icon: VscError,
                  sub: `${activeCountData?.expCount ?? 0} Completed`,
                  shine: false,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (item.label === "Total Licenses" && clients.length > 0)
                      openModal("all");
                    else if (
                      item.label === "Active Licenses" &&
                      activeClients.length > 0
                    )
                      openModal("Active");
                    else if (
                      item.label === "Expiring Soon" &&
                      expiringClients.length > 0
                    )
                      openModal("Expiring Soon");
                    else if (
                      item.label === "Expired" &&
                      expiredClients.length > 0
                    )
                      openModal("Expired");
                  }}
                  className="cursor-pointer relative bg-white rounded-[20px] p-8 shadow-sm transition-all duration-300 
  hover:shadow-2xl hover:-translate-y-2 hover:bg-[#F9FCFF] group overflow-hidden"
                >
                  {/* Shine animation */}
                  {item.shine && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className="absolute -inset-20 bg-gradient-to-br from-white/10 to-white/5 
          transform rotate-12 translate-y-10 animate-shine"
                      ></div>
                    </div>
                  )}

                  {/* Icon section */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center 
          transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 
          group-hover:shadow-[0_4px_20px_rgba(30,136,229,0.25)]`}
                    >
                      {item.label === "Expired" ? (
                        <item.icon className="w-7 h-7 text-red-500" />
                      ) : (
                        <item.icon className="w-7 h-7 text-[#1E88E5]" />
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-600 mb-2 text-lg">{item.label}</h3>

                  {/* Value */}
                  <div className="flex items-end justify-between">
                    <p className="text-gray-900 text-[32px] font-bold group-hover:scale-105 transition-transform duration-300">
                      {item.value}
                    </p>
                    <span className="text-sm text-gray-500 group-hover:text-[#1E88E5] transition-colors duration-300">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}

          {/* {userName?.role === "admin" && ( */}
          <div className="bg-white rounded-2xl p-6 shadow-sm rounded-[20px] ">
            <div className="flex justify-between">
              <h3 className="text-gray-900 mb-6 font-bold">
                Sales User License Trends
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      handleDateChange(
                        "start",
                        e.target.value,
                        startDate,
                        endDate,
                        setStartDate,
                        setEndDate
                      )
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate} // prevent selecting invalid dates
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      handleDateChange(
                        "end",
                        e.target.value,
                        startDate,
                        endDate,
                        setStartDate,
                        setEndDate
                      )
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {busyCursor ? (
              <ShimmerChartSkeleton container={true} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                  {/* X-axis shows ID */}
                  <XAxis dataKey="id" stroke="#6B7280" />

                  <YAxis stroke="#6B7280" allowDecimals={false} />

                  {/* Custom tooltip */}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  <Bar
                    dataKey="registeredCount"
                    fill="#1E88E5"
                    name="Registered"
                  />
                  <Bar dataKey="expiredCount" fill="#EF4444" name="Expired" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* )} */}

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
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6 rounded-[20px] ">
            <h3 className="text-gray-900 mb-6">Most Recent License Keys</h3>

            <div className="overflow-x-auto">
              <div>
                <table className="w-full">
                  {loadAllBusyCursor ? (
                    <div className="w-full">
                      <ShimmerChartSkeleton container={true} />
                    </div>
                  ) : (
                    // : chartData.length === 0 ? (
                    //   <p className="text-center text-gray-500">No Data found</p>
                    // )
                    <>
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
                          {/* <th className="text-left py-3 px-4 text-gray-600">
                      License Key
                    </th> */}
                          <th className="text-left py-3 px-4 text-gray-600">
                            Expired On
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentClients.map((client: any, key: number) => (
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
                            {/* <td className="py-4 px-4 text-gray-900">
                        {client?.licenseKey && client.licenseKey.length > 10
                          ? client.licenseKey.slice(0, 10) + "..."
                          : "--"}
                      </td> */}
                            <td className="py-4 px-4 text-gray-600">
                              {client.expDate ? client.expDate : "--"}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  client.status === "Active"
                                    ? "bg-[#E8F4FF] text-[#1E88E5]"
                                    : client.status === "Expiring Soon"
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
                    </>
                  )}
                </table>
              </div>
              {currentClients.length > 0 && (
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
              )}
            </div>

            {clients.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No Data Found
              </div>
            )}
          </div>
          {/* )} */}

          {/* Modal Table */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalTitle}
          >
            {modalData.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No Data Found</p>
            ) : (
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
                  {modalData.map((client: any) => (
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
                        {client.licenseKey?.length > 10
                          ? client.licenseKey.slice(0, 10) + "..."
                          : "--"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {client.expDate || "--"}
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
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { baseURL } from "../config/apiConfig";
import cryptoService from "../services/cryptoService";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onLogin();
  //   navigate('/');
  // };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: cryptoService.encrypt(password),
        }),
      });

      if (response.status === 208) {
        const err = await response.text(); // server returns raw string, not JSON
        toast.error(err || "User not available");
        setLoading(false);
        return;
      }
      // If API returns non-200 status
      if (!response.ok) {
        const errorData = await response.json();
        // alert(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();
      console.log("Login Success:", data);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("details", JSON.stringify(data));
      toast.success("Login successfully");

      onLogin(); // your parent login function
      navigate("/"); // redirect to dashboard
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] shadow-lg p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4B9CD3] to-[#1E88E5] flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-center mb-2">Clonetab Trial Products Portal</h1>
          <p className="text-center text-gray-500 mb-10">
            Sign in to manage Trial Licenses
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clonetab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-[#4B9CD3]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-[#4B9CD3]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl text-white mt-8 
             ${
               loading
                 ? "bg-gray-400 cursor-not-allowed"
                 : "bg-[#1E88E5] hover:bg-[#4B9CD3]"
             }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* <p className="text-center text-gray-400 text-sm mt-8">
            Demo Login: Use any email and password
          </p> */}
        </div>
      </div>
    </div>
  );
}

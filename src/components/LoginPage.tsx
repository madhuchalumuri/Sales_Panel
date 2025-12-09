import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { baseURL } from "../config/apiConfig";
import cryptoService from "../services/cryptoService";
import CoverImage from "../assets/Cover_Image.png";
import CtLogo from "../assets/CT_Dark_Mode@2x.png";
import { TypeAnimation } from "react-type-animation";

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
    <div className="min-h-screen flex bg-background">
      {/* Left side - Hero with background image and text overlay */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden rounded-3xl m-6 pt-16 justify-center"
        style={{
          backgroundImage: `url(${CoverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1
          className="text-5xl md:text-6xl font-bold text-white text-center px-8 relative"
          style={{ textShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}
        >
          Welcome
          <br />
          {/* Wrapper for animated text + underline */}
          <span className="relative inline-block">
            {/* Animated Text */}
            <TypeAnimation
              sequence={["Sales Champion!", 1500, "Top Performer!", 1500]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent"
            />

            {/* Underline stroke */}
            <svg
              className="absolute left-0 -bottom-5 w-full"
              height="12"
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0 15 Q150 0 300 15"
                stroke="#f7e017"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h1>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-12">
        <div
          className="w-full max-w-md mx-auto 
        bg-white shadow-2xl rounded-2xl p-8
      lg:bg-transparent lg:shadow-none lg:p-0"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <img
                src={CtLogo}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl  text-center  tracking-wide"
            style={{ color: "#0052CC" }}
          >
            Let's hit your target today
          </h1>

          {/* Subheading */}
          <h1 className="text-center text-xl text-gray-400 text-sm mb-8">
            sign in to manage demos and licences
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div
            //  className="space-y-2"
            >
              {/* <Label htmlFor="email">Email Address</Label> */}
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-blue-50 border border-blue-300 rounded-lg px-4 py-3 text-gray-700 placeholder-blue-400  placeholder-shown:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div
            //  className="space-y-2"
            >
              {/* <Label htmlFor="password">Password</Label> */}
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-blue-50 border border-blue-300 rounded-lg px-4 py-3 text-gray-700 placeholder-blue-400 placeholder-shown:text-xl  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                // className="h-12 rounded-xl border-gray-200 focus:border-[#4B9CD3]"
                required
              />
            </div>

            {/* <Button
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
            </Button> */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-2xl tracking-widest bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Testimonial */}
          <div className="mt-12 py-4 border-t border-gray-200 bg-blue-100 rounded-2xl relative px-10">
            {/* Left Quote Icon */}
            <svg
              className="absolute left-4 top-4 w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.17 6.17C5.14 7.2 4 9.47 4 12.75c0 2.56 1.03 4.28 2.77 5.03.63.26 1.23-.38 1.05-1.03-.34-1.24-.5-2.4-.5-3.69 0-2.45.57-4.1 1.77-5.54.49-.58.13-1.48-.59-1.48h-1.33zm9 0c-2.03 1.03-3.17 3.3-3.17 6.58 0 2.56 1.03 4.28 2.77 5.03.63.26 1.23-.38 1.05-1.03-.34-1.24-.5-2.4-.5-3.69 0-2.45.57-4.1 1.77-5.54.49-.58.13-1.48-.59-1.48h-1.33z" />
            </svg>

            {/* Main Text */}
            <p className="text-center text-blue-700 leading-relaxed text-lg font-semibold">
              I create opportunities. <br />I convert potential into success.
            </p>

            {/* Right Quote Icon */}
            <svg
              className="absolute right-4 bottom-4 w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.17 17.83C11.2 16.8 12.34 14.53 12.34 11.25c0-2.56-1.03-4.28-2.77-5.03-.63-.26-1.23.38-1.05 1.03.34 1.24.5 2.4.5 3.69 0 2.45-.57 4.1-1.77 5.54-.49.58-.13 1.48.59 1.48h1.33zm9 0c2.03-1.03 3.17-3.3 3.17-6.58 0-2.56-1.03-4.28-2.77-5.03-.63-.26-1.23.38-1.05 1.03.34 1.24.5 2.4.5 3.69 0 2.45-.57 4.1-1.77 5.54-.49.58-.13 1.48.59 1.48h1.33z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

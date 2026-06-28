import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Mail, Lock, User, Phone, MapPin, Building2, Eye, EyeOff } from "lucide-react";

export const AuthPage: React.FC = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: 'login' or 'register' (can be pre-seeded from navigate state)
  const initialMode = (location.state as any)?.mode || "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"donor" | "ngo" | "volunteer">("donor");
  const [organizationName, setOrganizationName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({
          name,
          email,
          password,
          role,
          phone,
          address,
          organizationName: role === "volunteer" ? undefined : organizationName,
        });
      }
      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth action failed", err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-5 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        
        {/* Header / Logo */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            {mode === "login" 
              ? "Sign in to connect, donate, or claim fresh surplus" 
              : "Register as a Donor, NGO partner, or Rescue Driver"}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 pb-2 text-xs font-bold transition ${
              mode === "login"
                ? "border-b-2 border-emerald-600 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 pb-2 text-xs font-bold transition ${
              mode === "register"
                ? "border-b-2 border-emerald-600 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {mode === "register" && (
            <>
              {/* Role Select Buttons */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Join As</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["donor", "ngo", "volunteer"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-md border uppercase transition text-center ${
                        role === r
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Chef John Martinez"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Organization (for donor or NGO) */}
              {role !== "volunteer" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    {role === "ngo" ? "NGO / Shelter Name" : "Business / Restaurant Name"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={role === "ngo" ? "E.g., Feeding Hope Shelter" : "E.g., Marriott Bistro"}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g., +1 (555) 123-4567"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Pickup / Location Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="E.g., 789 Culinary Blvd, Downtown"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., user@example.com"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-9 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2 px-3 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        {/* Demo Credentials Drawer */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-1.5 bg-slate-50 p-3.5 rounded-md border border-slate-200/60">
          <h4 className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Demo Credentials for testing</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] text-slate-600 leading-normal">
            <div>
              <span className="font-bold block text-slate-800">Donor Account:</span>
              donor@example.com / donor123
            </div>
            <div>
              <span className="font-bold block text-slate-800">NGO Partner:</span>
              ngo@example.com / ngo123
            </div>
            <div>
              <span className="font-bold block text-slate-800">Volunteer Driver:</span>
              volunteer@example.com / volunteer123
            </div>
            <div>
              <span className="font-bold block text-slate-800">Administrator:</span>
              admin@foodshare.org / admin123
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

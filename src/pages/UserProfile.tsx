import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, MapPin, Building2, Save, UserCircle, Calendar, Download, FileSpreadsheet, History, RefreshCw } from "lucide-react";
import { donationsApi } from "../lib/api";
import { Donation } from "../types";

export const UserProfile: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [organizationName, setOrganizationName] = useState(user?.organizationName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "👨‍🍳");
  const [updating, setUpdating] = useState(false);

  // Donation History states
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState("");

  const avatarPresets = ["👨‍🍳", "👩‍🍳", "🚚", "🏢", "🍎", "🥗", "🍞", "❤️"];

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setErrorHistory("");
        const data = await donationsApi.getAll();
        if (isMounted) {
          // Filter to user's history
          let userHistory = data;
          if (user.role === "donor") {
            userHistory = data.filter((d) => d.donorId === user.id);
          } else if (user.role === "ngo") {
            userHistory = data.filter((d) => d.ngoId === user.id);
          } else if (user.role === "volunteer") {
            userHistory = data.filter((d) => d.volunteerId === user.id);
          }
          setDonations(userHistory);
        }
      } catch (err) {
        console.error("Error fetching donations for history:", err);
        if (isMounted) {
          setErrorHistory("Failed to load donation history.");
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.role]);

  const downloadCSV = () => {
    if (donations.length === 0) return;

    // Headers
    const headers = [
      "Listing ID",
      "Title",
      "Description",
      "Food Category",
      "Quantity",
      "Status",
      "Cooked Time",
      "Expiry Time",
      "Donor Name",
      "Donor Address",
      "NGO Name",
      "Volunteer Name",
      "Created At"
    ];

    // Helper to safely escape CSV fields
    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      // Replace double quotes with two double quotes
      const bEscaped = str.replace(/"/g, '""');
      return `"${bEscaped}"`;
    };

    const rows = donations.map((d) => [
      d.id,
      d.title,
      d.description,
      d.foodType,
      d.quantity,
      d.status,
      d.cookedTime || "N/A",
      d.expiryTime,
      d.donorName,
      d.donorAddress,
      d.ngoName || "N/A",
      d.volunteerName || "N/A",
      new Date(d.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    // Create a blob and trigger a download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `foodshare_history_${user.role}_${user.id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    try {
      setUpdating(true);
      await updateProfile({
        name,
        phone,
        address,
        organizationName: user?.role === "volunteer" ? undefined : organizationName,
        avatar,
      });
    } catch (err) {
      console.error("Profile save error", err);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center text-sm text-gray-500 uppercase tracking-wider font-semibold">
        Please sign in to view and modify your profile details.
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    donor: "Surplus Food Donor",
    ngo: "NGO / Charity Partner",
    volunteer: "Rescue Driver Volunteer",
    admin: "System Administrator",
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-5">
            <div className="text-4xl p-4 bg-emerald-50 rounded-lg border border-emerald-100 leading-none">
              {avatar}
            </div>
            <div className="text-center sm:text-left leading-normal space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">{user.name}</h2>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-md uppercase tracking-wider inline-block">
                {roleLabels[user.role]}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400 justify-center sm:justify-start">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Joined on {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Avatar Selector preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customize Avatar Icon</label>
              <div className="flex flex-wrap gap-2">
                {avatarPresets.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-11 w-11 text-xl rounded-md border flex items-center justify-center transition cursor-pointer hover:bg-slate-50 ${
                      avatar === emoji ? "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20" : "border-slate-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Email (Immutable for identity security) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block font-semibold">Email Address (Locked)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-400 rounded-md cursor-not-allowed font-medium"
                />
              </div>
              <span className="text-xs text-slate-400 block">Account emails are locked to protect verified activity logs.</span>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Display / Full Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Organization Name (for Donor or NGO) */}
            {user.role !== "volunteer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {user.role === "ngo" ? "NGO Charity / Agency Name" : "Restaurant / Bakery Name"}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="E.g., Marriott Bistro / Feeding Shelter"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Primary Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50 uppercase tracking-wider"
              >
                <Save className="h-4 w-4" />
                {updating ? "Saving..." : "Save Profile"}
              </button>
            </div>

          </form>

        </div>

        {/* Export & History Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Data Export & Activity Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Download or inspect your activity records from the platform.</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Keep a record of your contributions, claims, or driver assignments. You can export a comprehensive spreadsheet (.csv) containing listing details, timestamps, statuses, and delivery notes.
            </p>

            {loadingHistory ? (
              <div className="flex items-center gap-2 py-2 text-sm text-slate-500 font-semibold uppercase tracking-wider">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Retrieving history logs...</span>
              </div>
            ) : errorHistory ? (
              <div className="text-sm text-red-600 font-semibold">{errorHistory}</div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Available Records</span>
                  <span className="text-lg font-black text-slate-900">
                    {donations.length} {donations.length === 1 ? "Donation log" : "Donation logs"}
                  </span>
                </div>

                <button
                  onClick={downloadCSV}
                  disabled={donations.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Export to CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

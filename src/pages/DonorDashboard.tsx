import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donationsApi } from "../lib/api";
import { Donation } from "../types";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Clock, Calendar, CheckCircle2, AlertTriangle, FileText, Trash2, ShieldAlert } from "lucide-react";

export const DonorDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDonations = async () => {
    try {
      const data = await donationsApi.getAll();
      setDonations(data);
    } catch (err) {
      console.error("Failed to load donor listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this food donation listing?")) return;
    try {
      await donationsApi.delete(id);
      showNotification("Donation listing deleted successfully", "success");
      fetchMyDonations();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to delete donation", "error");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this active donation?")) return;
    try {
      await donationsApi.updateStatus(id, "cancelled");
      showNotification("Donation cancelled successfully", "success");
      fetchMyDonations();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to cancel donation", "error");
    }
  };

  // Compute counts
  const pendingCount = donations.filter(d => d.status === "pending").length;
  const claimedCount = donations.filter(d => ["accepted", "assigned", "picked_up"].includes(d.status)).length;
  const completedCount = donations.filter(d => d.status === "delivered").length;

  const statusBadges: Record<Donation["status"], { label: string; style: string }> = {
    pending: { label: "Pending Claim", style: "bg-amber-100 text-amber-800 border-amber-200" },
    accepted: { label: "Claimed by NGO", style: "bg-blue-100 text-blue-800 border-blue-200" },
    assigned: { label: "Driver Assigned", style: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    picked_up: { label: "In Transit", style: "bg-purple-100 text-purple-800 border-purple-200" },
    delivered: { label: "Delivered", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  const foodTypeLabels: Record<Donation["foodType"], string> = {
    cooked: "Cooked Meal",
    raw: "Raw Produce",
    packaged: "Packaged Food",
    dry: "Pantry Staples",
    other: "Other Food"
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-lg text-white border border-slate-800 shadow-xs">
        <div className="leading-none space-y-1">
          <h2 className="text-lg font-extrabold tracking-tight">Donor Control Center</h2>
          <p className="text-slate-300 text-xs">Hello, {user?.name}. Thank you for helping minimize food waste!</p>
        </div>
        <Link
          to="/donate"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs transition uppercase tracking-wider shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          Donate Fresh Surplus
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{pendingCount}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Pending Claims</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{claimedCount}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Rescues</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{completedCount}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Successful Shares</div>
          </div>
        </div>
      </div>

      {/* Main Listings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="h-4 w-4 text-slate-500" />
          Your Submitted Food Donations
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading your donation listings...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No active listings</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
              You haven't listed any surplus food yet. Share your first donation to help someone in need!
            </p>
            <Link
              to="/donate"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider"
            >
              Post a donation now <PlusCircle className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donations.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Title */}
                <div>
                  {d.image ? (
                    <div className="h-28 overflow-hidden border-b border-slate-100">
                      <img
                        src={d.image}
                        alt={d.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-end p-3 border-b border-slate-100">
                      <span className="text-[9px] font-extrabold text-emerald-100 uppercase tracking-wider">
                        {foodTypeLabels[d.foodType]}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-1.5">
                      <h4 className="font-bold text-slate-900 leading-tight text-xs sm:text-sm truncate">{d.title}</h4>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                          statusBadges[d.status]?.style || ""
                        }`}
                      >
                        {statusBadges[d.status]?.label || d.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200/50">
                      <div>
                        <span className="font-bold block text-slate-400 text-[10px] uppercase">Quantity</span>
                        {d.quantity}
                      </div>
                      <div>
                        <span className="font-bold block text-slate-400 text-[10px] uppercase">Expires In</span>
                        {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                        {new Date(d.expiryTime).toLocaleDateString()})
                      </div>
                    </div>

                    {/* Progress tracking details */}
                    {(d.ngoName || d.volunteerName) && (
                      <div className="pt-2 text-[10px] text-slate-500 space-y-1 border-t border-slate-100">
                        {d.ngoName && (
                          <div>
                            <span className="font-bold text-slate-700">NGO Claimant:</span> {d.ngoName}
                          </div>
                        )}
                        {d.volunteerName && (
                          <div>
                            <span className="font-bold text-slate-700">Driver Courier:</span> {d.volunteerName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Posted {new Date(d.createdAt).toLocaleDateString()}</span>
                  
                  <div className="flex gap-1.5">
                    {d.status === "pending" && (
                      <>
                        <Link
                          to={`/donate?edit=${d.id}`}
                          className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 bg-white transition cursor-pointer"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded border border-slate-200 bg-white hover:border-red-200 transition cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {d.status !== "delivered" && d.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(d.id)}
                        className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 rounded border border-slate-200 bg-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

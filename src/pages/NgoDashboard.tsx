import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donationsApi } from "../lib/api";
import { Donation } from "../types";
import { useAuth } from "../context/AuthContext";
import { Clock, CheckCircle2, ShoppingBag, Landmark, MapPin, Phone, Check, ArrowRight, ShieldAlert } from "lucide-react";

export const NgoDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNgoData = async () => {
    try {
      const data = await donationsApi.getAll();
      setDonations(data);
    } catch (err) {
      console.error("Failed to load NGO donations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      await donationsApi.updateStatus(id, "accepted");
      showNotification("Surplus food successfully claimed! You can now assign a driver or coordinate pickup.", "success");
      fetchNgoData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to claim donation", "error");
    }
  };

  // Group listings
  const openPending = donations.filter(d => d.status === "pending");
  const myClaimedActive = donations.filter(d => d.ngoId === user?.id && d.status !== "delivered" && d.status !== "cancelled");
  const myClaimedDelivered = donations.filter(d => d.ngoId === user?.id && d.status === "delivered");

  const statusLabels: Record<Donation["status"], string> = {
    pending: "Available",
    accepted: "Claimed - Coordinating Pickup",
    assigned: "Driver Dispatched",
    picked_up: "Courier In Transit",
    delivered: "Delivered & Stored",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      {/* NGO Banner */}
      <div className="bg-slate-900 p-4 rounded-lg text-white border border-slate-800 shadow-xs">
        <h2 className="text-lg font-extrabold tracking-tight">NGO Relief Dashboard</h2>
        <p className="text-slate-300 text-xs mt-0.5">
          Hello, {user?.name}. Manage food collections and coordinate volunteer drivers here.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{openPending.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Available Listings</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{myClaimedActive.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Rescues</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{myClaimedDelivered.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Received</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Claims & Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Your Claimed Runs (Active) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Landmark className="h-4 w-4 text-emerald-700" />
            Your Claimed Allocations ({myClaimedActive.length})
          </h3>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">Loading details...</div>
          ) : myClaimedActive.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="h-7 w-7 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No active collections</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                You haven't claimed any listings yet. Browse available food in the column on the right to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaimedActive.map((d) => (
                <div key={d.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight text-xs sm:text-sm truncate">{d.title}</h4>
                      <p className="text-[10px] text-emerald-700 font-extrabold uppercase mt-1">Donor: {d.donorName}</p>
                    </div>
                    <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full whitespace-nowrap uppercase">
                      {statusLabels[d.status]}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-md text-xs space-y-1.5 text-slate-600 leading-normal border border-slate-200/50">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{d.donorAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{d.donorPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <div className="text-slate-400 font-medium">
                      Qty: <span className="font-bold text-slate-700">{d.quantity}</span>
                    </div>
                    {d.volunteerName ? (
                      <div className="text-emerald-800 font-bold flex items-center gap-0.5">
                        <Check className="h-3.5 w-3.5" /> Courier: {d.volunteerName}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">
                        Awaiting volunteer delivery...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historic Completed Deliveries */}
          {myClaimedDelivered.length > 0 && (
            <div className="pt-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Historic Received Shipments
              </h4>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {myClaimedDelivered.map((d) => (
                  <div key={d.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{d.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[10px]">Qty: {d.quantity} &bull; Delivered by {d.volunteerName || "Driver"}</div>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                      Received
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Open Local Listings (Pending claims) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <ShoppingBag className="h-4 w-4 text-emerald-700" />
            Claim Available Surplus
          </h3>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">Browsing network listings...</div>
          ) : openPending.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">All surplus claimed!</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-normal">
                There are no pending food donations waiting in the network at this moment. Excellent work by our community!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openPending.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition overflow-hidden"
                >
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex justify-between items-start gap-1.5">
                      <h4 className="font-bold text-slate-900 text-xs leading-tight truncate">{d.title}</h4>
                      <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {d.foodType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>

                    <div className="text-[11px] bg-slate-50 p-2.5 rounded-md space-y-1 text-slate-600 border border-slate-200/50">
                      <div>
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Qty</span>
                        {d.quantity}
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Location</span>
                        <div className="truncate">{d.donorAddress}</div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Expires</span>
                        <div className="text-red-700 font-semibold">
                          {new Date(d.expiryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                          ({new Date(d.expiryTime).toLocaleDateString()})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaim(d.id)}
                      className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      Claim Donation <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

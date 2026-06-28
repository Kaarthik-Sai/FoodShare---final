import React, { useState, useEffect } from "react";
import { donationsApi } from "../lib/api";
import { Donation } from "../types";
import { useAuth } from "../context/AuthContext";
import { Truck, CheckCircle2, Clock, MapPin, Navigation, Phone, Check, Clipboard, MessageSquare, Plus } from "lucide-react";

export const VolunteerDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes inputs
  const [pickupNotes, setPickupNotes] = useState<Record<string, string>>({});
  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});

  const fetchVolunteerData = async () => {
    try {
      const data = await donationsApi.getAll();
      setDonations(data);
    } catch (err) {
      console.error("Failed to load volunteer shipments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const handleAssignSelf = async (id: string) => {
    try {
      await donationsApi.updateStatus(id, "assigned");
      showNotification("You have claimed this delivery rescue assignment! Please proceed to the pickup location.", "success");
      fetchVolunteerData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to claim delivery task", "error");
    }
  };

  const handleMarkPickedUp = async (id: string) => {
    try {
      const notes = pickupNotes[id] || "Collected surplus package in insulated boxes.";
      await donationsApi.updateStatus(id, "picked_up", { pickupNotes: notes });
      showNotification("Delivery marked as Picked Up! You are now in transit.", "success");
      fetchVolunteerData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleMarkDelivered = async (id: string) => {
    try {
      const notes = deliveryNotes[id] || "Delivered directly to community kitchen staff.";
      await donationsApi.updateStatus(id, "delivered", { deliveryNotes: notes });
      showNotification("Superb! You have completed the rescue run. Thank you for your service!", "success");
      fetchVolunteerData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to complete delivery", "error");
    }
  };

  // Group listings
  const unassignedJobs = donations.filter(d => d.status === "accepted" && !d.volunteerId);
  const myActiveShipments = donations.filter(d => d.volunteerId === user?.id && d.status !== "delivered" && d.status !== "cancelled");
  const myCompletedRuns = donations.filter(d => d.volunteerId === user?.id && d.status === "delivered");

  const foodTypeLabels: Record<Donation["foodType"], string> = {
    cooked: "Cooked Meal",
    raw: "Raw Produce",
    packaged: "Packaged Box",
    dry: "Pantry Goods",
    other: "Other Food"
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Header */}
      <div className="bg-slate-900 p-4 rounded-lg text-white border border-slate-800 shadow-xs">
        <h2 className="text-lg font-extrabold tracking-tight">Rescue Driver Dashboard</h2>
        <p className="text-slate-300 text-xs mt-0.5">
          Hello, {user?.name}. Your delivery efforts translate directly into hot meals for families.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Navigation className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{unassignedJobs.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Unassigned Pickups</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{myActiveShipments.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Your Active Tasks</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="leading-none space-y-1">
            <div className="text-lg font-extrabold text-slate-900">{myCompletedRuns.length}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Deliveries</div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Missions & Available Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: My Current Missions */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Truck className="h-4 w-4 text-emerald-700" />
            Your Current Active Missions ({myActiveShipments.length})
          </h3>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">Loading your mission boards...</div>
          ) : myActiveShipments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <Truck className="h-7 w-7 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No active deliveries</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                You don't have any ongoing rescue deliveries. View and claim unassigned shipments on the right to start!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveShipments.map((d) => (
                <div key={d.id} className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  
                  {/* Title & Status */}
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{d.title}</h4>
                      <p className="text-[10px] text-slate-400">ID: {d.id} &bull; Qty: {d.quantity}</p>
                    </div>
                    <span className="text-[9px] font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full uppercase">
                      {d.status === "assigned" ? "Assigned" : "In Transit"}
                    </span>
                  </div>

                  {/* Route details */}
                  <div className="p-4 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Pickup point */}
                      <div className="border border-emerald-100 bg-emerald-50/20 p-2.5 rounded-md space-y-1">
                        <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider block">1. Pickup point</span>
                        <div className="font-bold text-xs text-slate-900">{d.donorName}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                          <span className="truncate">{d.donorAddress}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Phone className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                          <span>{d.donorPhone}</span>
                        </div>
                      </div>

                      {/* Dropoff point */}
                      <div className="border border-blue-100 bg-blue-50/20 p-2.5 rounded-md space-y-1">
                        <span className="text-[9px] font-extrabold text-blue-800 uppercase tracking-wider block">2. Dropoff shelter</span>
                        <div className="font-bold text-xs text-slate-900">{d.ngoName}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-blue-600" />
                          <span>Claiming NGO Station</span>
                        </div>
                      </div>
                    </div>

                    {/* Flow steps input & action */}
                    {d.status === "assigned" ? (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                            <Clipboard className="h-3.5 w-3.5 text-slate-400" />
                            Optional Pickup Report Notes
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., Loaded in cooler bag, 4 containers, food is piping hot..."
                            value={pickupNotes[d.id] || ""}
                            onChange={(e) => setPickupNotes({ ...pickupNotes, [d.id]: e.target.value })}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                          />
                        </div>
                        <button
                          onClick={() => handleMarkPickedUp(d.id)}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold transition cursor-pointer uppercase tracking-wider"
                        >
                          Mark as Picked Up (In-Transit)
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="space-y-1 bg-amber-50/50 p-2 rounded-md text-[11px] text-slate-700 border border-amber-100">
                          <span className="font-extrabold text-amber-800">Your Pickup Notes:</span> {d.pickupNotes || "None logged"}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                            Delivery Handover Report Notes
                          </label>
                          <input
                            type="text"
                            placeholder="E.g., Left with Chef Alice inside shelter, signed clipboard..."
                            value={deliveryNotes[d.id] || ""}
                            onChange={(e) => setDeliveryNotes({ ...deliveryNotes, [d.id]: e.target.value })}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                          />
                        </div>
                        <button
                          onClick={() => handleMarkDelivered(d.id)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition cursor-pointer uppercase tracking-wider"
                        >
                          Mark Delivery Completed &bull; Handover Done
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Completed deliveries history */}
          {myCompletedRuns.length > 0 && (
            <div className="pt-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Your Completed Rescue Runs
              </h4>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {myCompletedRuns.map((d) => (
                  <div key={d.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{d.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[10px]">Delivered to: {d.ngoName} &bull; Qty: {d.quantity}</div>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                      Success
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Available Delivery Jobs */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Navigation className="h-4 w-4 text-emerald-700" />
            Claim Available Delivery Jobs
          </h3>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">Scanning network dispatches...</div>
          ) : unassignedJobs.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">All clear!</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-normal">
                There are no claimed NGO shipments currently waiting for a courier pickup in our network. Check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unassignedJobs.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition p-3.5 space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-1.5">
                    <h4 className="font-bold text-slate-900 text-xs leading-tight truncate">{d.title}</h4>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {foodTypeLabels[d.foodType]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>

                  <div className="bg-slate-50 p-2.5 rounded-md text-xs space-y-1.5 text-slate-600 leading-normal border border-slate-200/50">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] block">Pickup from:</span>
                      <span className="font-bold text-slate-800">{d.donorName}</span> ({d.donorAddress})
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] block">Deliver to:</span>
                      <span className="font-bold text-slate-800">{d.ngoName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] block">Quantity:</span>
                      <span>{d.quantity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignSelf(d.id)}
                    className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                  >
                    Accept Delivery Mission <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

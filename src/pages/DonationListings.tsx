import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donationsApi } from "../lib/api";
import { Donation } from "../types";
import { useAuth } from "../context/AuthContext";
import { Search, MapPin, Calendar, Clock, Phone, Sparkles, Filter, ChevronRight, X, Heart, Utensils, Tag } from "lucide-react";

export const DonationListings: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Detailed Modal overlay
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await donationsApi.getAll();
      setDonations(data);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleClaim = async (id: string) => {
    if (!user) {
      showNotification("Please log in or register an account to claim food listings", "error");
      return;
    }
    if (user.role !== "ngo" && user.role !== "admin") {
      showNotification("Only registered NGO partners are authorized to claim food packages", "error");
      return;
    }

    try {
      await donationsApi.updateStatus(id, "accepted");
      showNotification("Success! You have claimed this surplus food package. Details updated.", "success");
      fetchListings();
      // Update modal if open
      if (selectedDonation && selectedDonation.id === id) {
        const updated = await donationsApi.getById(id);
        setSelectedDonation(updated);
      }
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to claim donation", "error");
    }
  };

  // Filter listings
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || d.foodType === selectedType;
    
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending" && d.status === "pending") ||
      (selectedStatus === "active" && ["accepted", "assigned", "picked_up"].includes(d.status)) ||
      (selectedStatus === "delivered" && d.status === "delivered");

    return matchesSearch && matchesType && matchesStatus;
  });

  const foodTypeLabels: Record<Donation["foodType"], string> = {
    cooked: "Cooked Hot Food",
    raw: "Fresh Produce",
    packaged: "Pre-packaged",
    dry: "Pantry Staples",
    other: "Other Surplus",
  };

  const statusTags: Record<Donation["status"], { label: string; style: string }> = {
    pending: { label: "Available", style: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    accepted: { label: "Claimed by NGO", style: "bg-blue-50 text-blue-800 border-blue-200" },
    assigned: { label: "Driver Dispatched", style: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    picked_up: { label: "In Transit", style: "bg-purple-50 text-purple-800 border-purple-200" },
    delivered: { label: "Delivered & Shared", style: "bg-teal-50 text-teal-800 border-teal-200" },
    cancelled: { label: "Cancelled", style: "bg-gray-50 text-gray-500 border-gray-200" },
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Block */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Browse Active Food Rescues
          </h2>
          <p className="text-xs text-slate-500">
            Real-time surplus listings shared by restaurants, grocers, and caterers. Help coordinate collection, driving, or shelter sharing today.
          </p>
        </div>

        {/* Search and Filters Segment */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:gap-3 justify-between">
          
          {/* Keyword search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by meal title, donor name, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Select */}
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 rounded-md bg-white font-semibold text-slate-600 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="cooked">Cooked Meals</option>
                <option value="packaged">Pre-packaged</option>
                <option value="raw">Fresh Produce</option>
                <option value="dry">Dry Staples</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs p-1.5 border border-slate-200 rounded-md bg-white font-semibold text-slate-600 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Available (Unclaimed)</option>
              <option value="active">Active Rescues</option>
              <option value="delivered">Completed / Shared</option>
            </select>
          </div>

        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs font-semibold">Scanning local networks for food surplus...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-xs">
            <Utensils className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No surplus listings match filters</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
              Try adjusting your search terms or checking different category options to explore active network packages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonations.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDonation(d)}
                className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-150 overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Photo or placeholder banner */}
                  {d.image ? (
                    <div className="h-32 overflow-hidden border-b border-slate-100">
                      <img
                        src={d.image}
                        alt={d.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-200"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-20 bg-gradient-to-r from-emerald-600 to-teal-500 p-3 flex flex-col justify-between text-white border-b border-slate-100">
                      <Tag className="h-4 w-4 text-emerald-200" />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-black/10 px-1.5 py-0.5 rounded self-start">
                        {foodTypeLabels[d.foodType]}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-1.5">
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 leading-tight transition text-xs sm:text-sm truncate">
                        {d.title}
                      </h3>
                      <span
                        className={`text-[9px] font-extrabold border px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                          statusTags[d.status]?.style || ""
                        }`}
                      >
                        {statusTags[d.status]?.label || d.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px]">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Qty: {d.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{d.donorAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-medium">By: {d.donorName}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition duration-150">
                    Details <ChevronRight className="h-3 w-3" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Slided Detailed Drawer / Modal */}
        {selectedDonation && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
            <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between">
              
              {/* Top Details */}
              <div>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-6 pt-4">
                  
                  {/* Title and Category */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                      {foodTypeLabels[selectedDonation.foodType]}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 tracking-tight">
                      {selectedDonation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold border px-3 py-1 rounded-full ${
                        statusTags[selectedDonation.status]?.style || ""
                      }`}>
                        {statusTags[selectedDonation.status]?.label || selectedDonation.status}
                      </span>
                      <span className="text-xs text-gray-400">Posted on {new Date(selectedDonation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Visual card image */}
                  {selectedDonation.image && (
                    <div className="rounded-xl overflow-hidden h-48 border border-gray-100">
                      <img src={selectedDonation.image} alt="Selected meal details" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  {/* Quantity and Safety window */}
                  <div className="grid grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold block text-emerald-900 mb-0.5 uppercase tracking-wider text-[10px]">Portion Size</span>
                      <span className="font-semibold text-gray-800">{selectedDonation.quantity}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-900 mb-0.5 uppercase tracking-wider text-[10px]">Best Before Expiry</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(selectedDonation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{" "}
                        ({new Date(selectedDonation.expiryTime).toLocaleDateString()})
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Surplus Food Summary</span>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3.5 rounded-lg border border-gray-100/50">
                      {selectedDonation.description}
                    </p>
                  </div>

                  {/* Donor Contact Details (Show only if signed-in or admin for data protection, or show to NGOs) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Donor Handshake Details</span>
                    {user ? (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs sm:text-sm text-gray-700 leading-normal">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Heart className="h-4 w-4 text-emerald-600" /> Source: {selectedDonation.donorName}
                        </div>
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{selectedDonation.donorAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <a href={`tel:${selectedDonation.donorPhone}`} className="hover:underline hover:text-emerald-700">
                            {selectedDonation.donorPhone}
                          </a>
                        </div>
                        {selectedDonation.pickupNotes && (
                          <div className="mt-2.5 pt-2 border-t border-gray-200 text-gray-500 text-xs">
                            <span className="font-semibold text-gray-700">Special Pickup Instructions:</span> {selectedDonation.pickupNotes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 text-xs text-amber-900 leading-normal">
                        To protect our partners' security, donor locations and phone dials are restricted to signed-in platform participants.{" "}
                        <Link to="/auth" className="font-bold underline text-emerald-800">Sign in here</Link>
                      </div>
                    )}
                  </div>

                  {/* Delivery Telemetry / Handovers */}
                  {(selectedDonation.ngoName || selectedDonation.volunteerName) && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Rescue Progress Telemetry</span>
                      <div className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
                        {selectedDonation.ngoName && (
                          <div>
                            &bull; claimed by NGO: <span className="font-semibold text-gray-800">{selectedDonation.ngoName}</span>
                          </div>
                        )}
                        {selectedDonation.volunteerName && (
                          <div>
                            &bull; Assigned Courier: <span className="font-semibold text-gray-800">{selectedDonation.volunteerName}</span>
                          </div>
                        )}
                        {selectedDonation.deliveryNotes && (
                          <div className="bg-emerald-50/50 p-2.5 rounded-lg text-emerald-950 font-medium border border-emerald-100 mt-1">
                            Handoff notes: {selectedDonation.deliveryNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Action Button at bottom of Drawer */}
              {selectedDonation.status === "pending" && (user?.role === "ngo" || user?.role === "admin") && (
                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleClaim(selectedDonation.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer"
                  >
                    Claim Food surplus for {user?.organizationName || "Our NGO"}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

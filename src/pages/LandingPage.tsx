import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { statsApi } from "../lib/api";
import { SystemStats } from "../types";
import { useAuth } from "../context/AuthContext";
import { Leaf, Heart, Users, Truck, ArrowRight, ShieldCheck, HelpCircle, Utensils, Star } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-12 sm:py-16">
        <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 bg-slate-50/50 rounded-l-3xl -z-10 transform translate-x-12" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-200/60">
                <Heart className="h-3 w-3 text-emerald-600" /> Rescue surplus, support local
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
                Connect Abundant Food With <span className="text-emerald-600">Communities In Need</span>
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                FoodShare bridges the gap between surplus-generating restaurants, hotels, and grocery stores and local NGOs & volunteer drivers. List surplus in minutes and help feed families today.
              </p>
              
              <div className="flex flex-wrap gap-2.5 pt-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-md shadow-xs text-white bg-emerald-600 hover:bg-emerald-700 transition gap-1.5"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      state={{ mode: "register" }}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-md shadow-xs text-white bg-emerald-600 hover:bg-emerald-700 transition gap-1.5"
                    >
                      Get Started Today
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/listings"
                      className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-semibold rounded-md text-slate-700 bg-white hover:bg-slate-50 transition"
                    >
                      Browse Active Listings
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Col: Interactive Visual Card */}
            <div className="mt-10 lg:mt-0 lg:col-span-5 flex justify-center">
              <div className="relative bg-white p-5 rounded-lg shadow-xs border border-slate-200 max-w-sm w-full">
                <div className="absolute -top-3 -right-3 h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm -rotate-12 border border-emerald-400">
                  <span className="font-extrabold text-[10px] text-center leading-none">100%<br/>Fresh</span>
                </div>
                
                <h3 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Utensils className="h-4 w-4 text-emerald-600" /> Recent Rescue
                </h3>
                <div className="bg-slate-50 rounded-md p-3.5 mb-3 border border-slate-200/60">
                  <div className="font-bold text-sm text-slate-800">Veg Biryani & Salads</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">From: Marriott Bistro</div>
                  <div className="text-xs mt-2 font-bold text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-100">Qty: 45 Portions</div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">NGO: Feeding Hope NGO</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="font-medium">Deliverer: Sam G.</span>
                  </div>
                </div>

                <Link
                  to="/listings"
                  className="mt-4 block text-center w-full py-2 border border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/30 rounded-md text-xs font-bold transition"
                >
                  Join the Rescue Mission
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-white py-6 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
            <div className="py-2 px-4">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                {loading ? "..." : stats?.estimatedMeals.toLocaleString()}+
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Meals shared</div>
            </div>
            <div className="py-2 px-4">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                {loading ? "..." : stats?.totalNgos}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">NGO Partners</div>
            </div>
            <div className="py-2 px-4">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                {loading ? "..." : stats?.totalVolunteers}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Active Drivers</div>
            </div>
            <div className="py-2 px-4">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                {loading ? "..." : stats?.totalDonations}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Rescues Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Ecosystem */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
              An Ecosystem Built on Synergy
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Our unique, role-based workflow connects different stakeholders to deliver maximum impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200/80 rounded-lg overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
            
            {/* Donor Tier */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-700 border border-emerald-100">
                  <Leaf className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Food Donors</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Restaurants, bakeries, markets, and caterers list surplus foods easily with quantities, safety labels, and strict expiry timers.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[9px] font-extrabold text-emerald-700 block mb-1 uppercase tracking-wider">Core benefit</span>
                <span className="text-xs text-slate-700 font-medium">Reduce waste, claim tax benefits, and support local networks.</span>
              </div>
            </div>

            {/* NGO Tier */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-700 border border-emerald-100">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2. NGOs & Shelters</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verified shelters, social kitchens, and community centers browse listing maps, claim appropriate foods, and assign distribution vectors.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[9px] font-extrabold text-emerald-700 block mb-1 uppercase tracking-wider">Core benefit</span>
                <span className="text-xs text-slate-700 font-medium">Instant access to free, healthy, high-quality nourishment resources.</span>
              </div>
            </div>

            {/* Volunteer Tier */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-700 border border-emerald-100">
                  <Truck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">3. Rescue Volunteers</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Local drivers and riders claim deliveries, pick up insulated packs from donors, and coordinate safe handovers directly with NGO representatives.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[9px] font-extrabold text-emerald-700 block mb-1 uppercase tracking-wider">Core benefit</span>
                <span className="text-xs text-slate-700 font-medium">Empower local delivery champions to make real hand-to-hand impact.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-1 mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Our Impact Stories</h2>
            <p className="text-xs text-slate-400">See what our partners and local drivers say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "Listing our excess evening catering trays takes less than a minute. Our kitchen team loves knowing that we are supporting our downtown shelters instead of discarding good meals!"
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 mt-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">M</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">Manager John</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Marriott Bistro</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "Our daily breakfast operations depend deeply on food donations. FoodShare has streamlined listing alerts so our drivers can securely collect items when restaurants have surplus."
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 mt-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">C</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">Coordinator Clara</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Feeding Hope NGO</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "I claim 2 deliveries on my way home twice a week. The handoff coordination is incredibly fast, and seeing the children's faces at the refuge makes it the best part of my week."
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 mt-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">S</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">Sam Green</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Volunteer Deliverer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality commitment banner */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Our Safety & Hygiene Promise</h2>
          <p className="text-slate-300 text-xs max-w-xl mx-auto leading-relaxed">
            We follow strict safe food handling protocols. Cooked dishes require preparing timestamps, immediate refrigeration storage guides, and standard food-grade container packing. Verified users agree to maintain active transport standards to ensure freshness.
          </p>
          <div className="pt-2">
            <Link
              to="/auth"
              state={{ mode: "register" }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-md text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
            >
              Sign Up & Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

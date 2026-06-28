import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Heart, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Leaf className="h-4.5 w-4.5 text-emerald-400" />
              <span className="font-bold text-base tracking-tight text-white">
                Food<span className="text-emerald-400">Share</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An ecosystem where restaurants, markets, and individuals connect instantly with local NGOs and volunteers to bridge food abundance with community hunger.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-100 font-bold text-[10px] tracking-wider uppercase mb-3">Quick Links</h3>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 hover:underline transition">Home</Link>
              </li>
              <li>
                <Link to="/listings" className="hover:text-emerald-400 hover:underline transition">Browse Food Listings</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 hover:underline transition">Contact Us</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-emerald-400 hover:underline transition">Join the Network</Link>
              </li>
            </ul>
          </div>

          {/* Core Roles */}
          <div>
            <h3 className="text-slate-100 font-bold text-[10px] tracking-wider uppercase mb-3">Our Network</h3>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>
                <span className="font-semibold text-slate-200">Donors:</span> Restaurants, Hotels, Caterers, and Households listing fresh surplus.
              </li>
              <li>
                <span className="font-semibold text-slate-200">NGOs:</span> Registered soup kitchens and shelters claiming food.
              </li>
              <li>
                <span className="font-semibold text-slate-200">Volunteers:</span> Local drivers delivering donations safely.
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-slate-100 font-bold text-[10px] tracking-wider uppercase mb-3">Get In Touch</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <a href="mailto:support@foodshare.org" className="hover:text-emerald-400 hover:underline">support@foodshare.org</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>+1 (555) Food-Share</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>742 Evergreen Terrace, EcoCity</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} FoodShare. Dedicated to reducing food waste and hunger.
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500/30" /> for a sustainable future.
          </div>
        </div>
      </div>
    </footer>
  );
};

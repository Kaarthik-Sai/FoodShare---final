import React from "react";
import { useAuth } from "../context/AuthContext";
import { DonorDashboard } from "./DonorDashboard";
import { NgoDashboard } from "./NgoDashboard";
import { VolunteerDashboard } from "./VolunteerDashboard";
import { ShieldCheck, MessageSquare, Plus, Trash2, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="py-16 text-center max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-gray-900">Please Sign In</h3>
        <p className="text-sm text-gray-500 mt-2">You need to have an active session to view the dashboard.</p>
        <Link to="/auth" className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition">
          Sign In
        </Link>
      </div>
    );
  }

  // Sub-component: Administrator Panel
  const AdminDashboard = () => (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-slate-900 p-4 rounded-lg text-white border border-slate-800">
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Platform Administrator Panel
          </h2>
          <p className="text-slate-300 text-xs mt-0.5">
            Full moderator control. Review global statistics, inquiries, and audit listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NGO Actions card */}
          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <LandmarkAdminIcon className="h-8 w-8 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Manage Donations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Directly view, edit, or delete any active food listing to ensure guidelines are followed.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider"
            >
              Go to Global Listings &rarr;
            </Link>
          </div>

          {/* Messaging Admin card */}
          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <MessageSquare className="h-8 w-8 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Visitor Inquiries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review contact messages and partnership requests submitted by visitors.
            </p>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider"
            >
              Review Inquiries &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Render role-specific dashboard
  switch (user.role) {
    case "donor":
      return <DonorDashboard />;
    case "ngo":
      return <NgoDashboard />;
    case "volunteer":
      return <VolunteerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="py-12 text-center text-gray-400">
          Unknown user role. Please contact support.
        </div>
      );
  }
};

const LandmarkAdminIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 22v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M5 14V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10" />
    <path d="M12 11h.01" />
  </svg>
);

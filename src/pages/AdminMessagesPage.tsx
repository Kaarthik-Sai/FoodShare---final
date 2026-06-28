import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contactApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, Mail, Calendar, MessageSquare, ArrowLeft } from "lucide-react";

export const AdminMessagesPage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Role protection gate
    if (!user || user.role !== "admin") {
      showNotification("Restricted: Administrative access is required to view inquiries.", "error");
      navigate("/dashboard");
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await contactApi.getMessages();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load admin contact inbox", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="py-24 text-center max-w-sm mx-auto space-y-3">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Access Restricted</h3>
        <p className="text-sm text-gray-500">Only authorized administrators are allowed to audit this resource.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      
      {/* Back Link */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Panel
      </button>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">Visitor Inquiries ({messages.length})</h2>
          <p className="text-sm text-slate-500">Review feedback submissions and outreach inquiries sent by visitors.</p>
        </div>
      </div>

      {/* Inbox List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400 uppercase tracking-wider font-semibold">Loading admin inbox...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
          <Mail className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Inbox is empty</h4>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
            There are no customer messages or partner outreach tickets logged in the system.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 hover:border-emerald-500 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight">{msg.subject}</h3>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-xs sm:text-sm text-slate-500">
                    <span className="font-bold text-emerald-700 uppercase">By: {msg.name}</span>
                    <span>&bull;</span>
                    <a href={`mailto:${msg.email}`} className="hover:underline hover:text-emerald-800 font-semibold text-emerald-700">
                      {msg.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50/50 p-4 rounded border border-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

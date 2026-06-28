import React from "react";
import { useAuth } from "../context/AuthContext";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export const Notification: React.FC = () => {
  const { notification, clearNotification } = useAuth();

  if (!notification) return null;

  const isSuccess = notification.type === "success";

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-fade-in-down">
      <div
        className={`rounded-xl shadow-lg border p-4 flex items-start gap-3 bg-white ${
          isSuccess 
            ? "border-emerald-100 bg-emerald-50/90 text-emerald-900" 
            : "border-red-100 bg-red-50/90 text-red-900"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1 text-sm font-medium leading-normal">
          {notification.message}
        </div>

        <button
          onClick={clearNotification}
          className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100/50 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

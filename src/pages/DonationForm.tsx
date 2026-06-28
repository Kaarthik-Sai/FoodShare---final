import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { donationsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Leaf, Sparkles, Upload, Clock, Calendar, Utensils, Heart } from "lucide-react";

export const DonationForm: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodType, setFoodType] = useState<"cooked" | "raw" | "packaged" | "dry" | "other">("cooked");
  const [cookedTime, setCookedTime] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [image, setImage] = useState(""); // Base64
  const [saving, setSaving] = useState(false);

  // Check if editing
  useEffect(() => {
    if (editId) {
      const loadDonation = async () => {
        try {
          const d = await donationsApi.getById(editId);
          // Security gate: only author can edit
          if (d.donorId !== user?.id && user?.role !== "admin") {
            showNotification("You are not authorized to edit this listing", "error");
            navigate("/dashboard");
            return;
          }
          if (d.status !== "pending") {
            showNotification("Cannot edit listing once it is claimed", "error");
            navigate("/dashboard");
            return;
          }

          setTitle(d.title);
          setDescription(d.description);
          setQuantity(d.quantity);
          setFoodType(d.foodType);
          setCookedTime(d.cookedTime ? d.cookedTime.substring(0, 16) : ""); // slice to match datetime-local format
          setExpiryTime(d.expiryTime.substring(0, 16));
          setPickupNotes(d.pickupNotes || "");
          setImage(d.image || "");
        } catch (err) {
          console.error("Failed to load donation details for edit", err);
          showNotification("Failed to load listing for edit", "error");
        }
      };
      loadDonation();
    }
  }, [editId]);

  // Handle image upload via Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification("File size exceeds 2MB limit. Please upload a smaller image.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setImage(presetUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !quantity || !expiryTime) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        description,
        quantity,
        foodType,
        cookedTime: foodType === "cooked" ? new Date(cookedTime).toISOString() : undefined,
        expiryTime: new Date(expiryTime).toISOString(),
        pickupNotes,
        image: image || undefined,
      };

      if (editId) {
        await donationsApi.update(editId, payload);
        showNotification("Surplus food listing updated successfully!", "success");
      } else {
        await donationsApi.create(payload);
        showNotification("Thank you! Your surplus food listing is now live for NGOs.", "success");
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Save donation failed", err);
      showNotification(err.response?.data?.message || "Failed to save listing", "error");
    } finally {
      setSaving(false);
    }
  };

  // Preset illustration options (using nice high-quality public domain pictures / visual SVGs or pure placeholders)
  const imagePresets = [
    {
      name: "Cooked meal",
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      name: "Sandwiches",
      url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      name: "Fruits & Veggies",
      url: "https://images.unsplash.com/photo-1610397613000-f0de90a0a1a1?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      name: "Bakery / Bread",
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
  ];

  return (
    <div className="py-6 px-4 max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Form Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              {editId ? "Edit Food Listing" : "Share Surplus Food"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Provide accurate safety details so local shelters can securely accept this donation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Donation Listing Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., 30 portions of Freshly cooked Veg biryani"
              className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
            />
          </div>

          {/* Food Type & Quantity row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category *</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as any)}
                className="w-full text-sm p-3 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-emerald-600"
              >
                <option value="cooked">Cooked Hot Food</option>
                <option value="packaged">Pre-packaged Food</option>
                <option value="raw">Raw Veggies / Fruits</option>
                <option value="dry">Pantry Staples (Dry Goods)</option>
                <option value="other">Other / Surplus</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity *</label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="E.g., 35 meal boxes, 10 loaves, 5 kg pack"
                className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
              />
            </div>

          </div>

          {/* Timestamps (Conditional cooked date + expiry date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {foodType === "cooked" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-emerald-600" /> Preparation/Cooked Time *
                </label>
                <input
                  type="datetime-local"
                  required={foodType === "cooked"}
                  value={cookedTime}
                  onChange={(e) => setCookedTime(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
                />
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Required for hot-cooked recipes to ensure compliance with hygiene safety windows.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-red-600" /> Expiry Time / Best Before *
              </label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
              />
              <span className="text-[11px] text-slate-400 block leading-tight">
                Estimation when the items will no longer be safe for consumption.
              </span>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Food Description & Safety Notes *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify ingredients, allergen warnings, or dietary labels (e.g., Vegetarian, contains dairy, stored immediately in clean containers)."
              className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500 bg-slate-50/20"
            />
          </div>

          {/* Pickup Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Special Pickup Instructions</label>
            <input
              type="text"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="E.g., Knock on service door, call John upon arrival, parking available..."
              className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
            />
          </div>

          {/* Image Selection / Drag & Drop */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Food Item Visual Card Photo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Drag-drop selector */}
              <div className="border border-dashed border-slate-200 rounded-lg p-5 hover:border-emerald-600 transition text-center space-y-2 bg-slate-50/50">
                <Upload className="h-7 w-7 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-emerald-700 cursor-pointer hover:underline relative">
                    Upload custom photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </span>{" "}
                  or drag & drop
                </div>
                <div className="text-[11px] text-slate-400">PNG, JPG up to 2MB</div>
              </div>

              {/* Preset Options */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block uppercase">Or select an attractive visual preset:</span>
                <div className="grid grid-cols-4 gap-2">
                  {imagePresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p.url)}
                      className={`relative rounded overflow-hidden h-12 border transition ${
                        image === p.url ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200"
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            {image && (
              <div className="mt-2 relative rounded border border-slate-200 overflow-hidden h-32 max-w-xs">
                <img src={image} alt="Selected Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-red-600 text-white text-[10px] hover:bg-red-700 shadow-sm cursor-pointer uppercase font-extrabold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 border border-slate-200 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {saving ? "Posting..." : editId ? "Save Changes" : "Publish Food Listing"}
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

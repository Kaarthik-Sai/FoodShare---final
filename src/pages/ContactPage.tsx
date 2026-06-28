import React, { useState } from "react";
import { contactApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

export const ContactPage: React.FC = () => {
  const { showNotification } = useAuth();
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Accordion active index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    try {
      setSubmitting(true);
      await contactApi.sendMessage({ name, email, subject, message });
      setSubmitted(true);
      showNotification("Your message has been received! Our support moderators will respond via email shortly.", "success");
      // Reset
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Failed to submit message", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "What measures ensure food hygiene and safety?",
      a: "Donors are required to list preparation timestamps, ingredient summaries, and allergy triggers. We strictly restrict listings to hot foods packed immediately in clean containers, or fresh raw/packaged items with visible expiry dates."
    },
    {
      q: "Who handles the delivery courier transit?",
      a: "Our network of local volunteer drivers handles the transport! Once an NGO claims a food package, the delivery task goes on the dispatcher board, and a volunteer coordinates safe collection and dropoff."
    },
    {
      q: "Can private households list surplus food?",
      a: "Yes! While our primary network includes corporate kitchens, catering companies, and grocers, private individuals can also post unopened packaged staples or fresh home-cooked meals."
    },
    {
      q: "How can my NGO register for free food resources?",
      a: "Simply sign up on our registration page, toggle the 'NGO' option, and input your authorized charity credentials. Once registered, you will immediately have permission to claim active listings!"
    }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Intro */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
          Get In Touch With FoodShare
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          Have questions about volunteer driver signups, restaurant integration, or donation hygiene? Drop us a line.
        </p>
      </div>

      {/* Info Cards & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Contact details & FAQ */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Quick dials */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
              Support Channels
            </h3>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block uppercase text-xs tracking-wide">General Inquiries</span>
                  <a href="mailto:support@foodshare.org" className="hover:underline text-emerald-700 font-semibold">support@foodshare.org</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block uppercase text-xs tracking-wide">Hotline support</span>
                  <span className="text-slate-600 font-semibold">+1 (555) Food-Share</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block uppercase text-xs tracking-wide">HQ Operations Office</span>
                  <span>742 Evergreen Terrace, EcoCity</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="h-5 w-5 text-emerald-600" /> Frequently Asked Questions
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-2">
                  <button
                    onClick={() => toggleFaq(idx)}
                    type="button"
                    className="w-full flex justify-between items-center text-left py-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {activeFaq === idx && (
                    <p className="text-xs sm:text-sm text-slate-500 pb-2 pt-1 pl-1 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Message Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 uppercase">Message Received!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-normal">
                Thank you for reaching out. A platform moderator has been notified of your inquiry and will review it.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2 text-sm font-bold rounded bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition cursor-pointer"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleMessageSubmit} className="space-y-5">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Send A Message Directly
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chef John"
                    className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g., Business donation partnership setup..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe how we can assist your kitchen, business, or NGO operations today."
                  className="w-full text-sm p-3 border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-600 bg-slate-50/20"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider shadow-sm"
              >
                {submitting ? "Sending..." : "Submit Inquiry"}
                <Send className="h-4 w-4" />
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

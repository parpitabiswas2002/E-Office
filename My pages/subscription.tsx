import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

// --- MOCK PLAN DATA ---
const plans = [
  {
    id: "free",
    name: "Free Tier",
    price: 0.0,
    period: " / forever",
    limit: "5 drafts total limit",
    badge: "Free",
  },
  { 
    id: 'monthly', 
    name: 'Monthly Plan', 
    price: 9.00, 
    period: '/ month', 
    limit: '100 drafts / mo',
    badge: null
  },
  { 
    id: 'quarterly', 
    name: 'Three Months', 
    price: 24.00, 
    period: '/ 3 mos', 
    limit: '350 drafts / 3 mos',
    badge: 'Save 11%'
  },
  { 
    id: 'annual', 
    name: '1 Year Plan', 
    price: 84.00, 
    period: '/ year', 
    limit: '1500 drafts / yr',
    badge: 'Best Value - Save 22%'
  }
];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true); // Open by default for preview

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      
      {/* Background Dashboard UI Mockup */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">DraftFlow Workspace</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You've reached your free limit. Upgrade your account to continue crafting beautiful letters.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          Upgrade Plan
        </button>
      </div>

      {/* SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <SubscriptionModal user={{ email: "preview@eoffice.gov", id: "preview-id" }} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}


// --- MODAL COMPONENT ---
function SubscriptionModal({ user, onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState('free'); // Default selected
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ state: 'idle', message: '', discount: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    if (selectedPlan.price === 0) {
      alert("Free tier activated successfully!");
      onClose();
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on the backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          couponCode: couponStatus.state === "success" ? couponCode : "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 3. Launch Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "E-Office Letter Assistant",
        description: `${selectedPlan.name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlanId,
                userId: user?.id,
                userEmail: user?.email,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert(`Payment successful! Your account has been upgraded to ${selectedPlan.name}.`);
              onClose();
            } else {
              alert(`Payment verification failed: ${verifyData.error || "Please contact support."}`);
            }
          } catch (verifyErr) {
            console.error("Verification Error:", verifyErr);
            alert("Verification API call failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(`Payment failed: ${response.error.description || "Unknown error"}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Subscription Error:", err);
      alert(err.message || "An unexpected error occurred during subscription process.");
      setIsProcessing(false);
    }
  };

  // Get active plan details
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Handle Coupon Logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;

    // Mock validation (DRAFT20 gives 20% off)
    if (couponCode.toUpperCase() === 'DRAFT20') {
      setCouponStatus({ state: 'success', message: '20% discount applied!', discount: 0.20 });
    } else {
      setCouponStatus({ state: 'error', message: 'Invalid or expired coupon code.', discount: 0 });
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponStatus({ state: 'idle', message: '', discount: 0 });
  };

  // Calculations
  const discountAmount = selectedPlan.price * couponStatus.discount;
  const finalPrice = selectedPlan.price - discountAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Choose your plan
            </h2>
            <p className="text-sm text-gray-500 mt-1">Unlock premium drafting capabilities.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Plan Selection Cards */}
          <div className="space-y-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              
              return (
                <label 
                  key={plan.id}
                  className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="plan" 
                    value={plan.id}
                    checked={isSelected}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="sr-only"
                  />
                  
                  {/* Badge */}
                  {plan.badge && (
                    <span className={`absolute -top-2.5 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      plan.id === 'annual' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' : plan.id === 'free' ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 border-[6px]' : 'border-gray-300'
                      }`}>
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {plan.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">${plan.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  <div className="ml-8 text-sm text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`} />
                    {plan.limit}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Coupon Section (Only show if not free plan) */}
          {selectedPlan.price > 0 && (
            <>
              {/* Divider */}
              <div className="h-px bg-gray-200 w-full"></div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Have a coupon code?
                </h3>
                
                {couponStatus.state === 'success' ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{couponStatus.message}</span>
                    </div>
                    <button 
                      onClick={removeCoupon}
                      className="text-sm text-green-700 hover:text-green-800 underline decoration-green-300 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DRAFT20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                    />
                    <button 
                      type="submit"
                      disabled={!couponCode}
                      className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                
                {couponStatus.state === 'error' && (
                  <p className="text-red-500 text-xs mt-2">{couponStatus.message}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer / Summary */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{selectedPlan.name}</span>
              <span>${selectedPlan.price.toFixed(2)}</span>
            </div>
            {couponStatus.state === 'success' && selectedPlan.price > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Discount ({couponCode.toUpperCase()})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total due today</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              <>
                {selectedPlan.price === 0 ? "Get Started" : "Subscribe Now"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            {selectedPlan.price === 0 ? "Free access tier. No credit card required." : "Secure, encrypted checkout. Cancel anytime."}
          </p>
        </div>

      </div>
    </div>
  );
}
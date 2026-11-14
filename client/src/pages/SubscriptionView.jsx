import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Layers,
  Lock,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SubscriptionView() {
  const { user, showToast, updateProfileLocally } = useAuth();
  const [plans, setPlans] = useState({});
  const [subStatus, setSubStatus] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [gatewayProvider, setGatewayProvider] = useState('razorpay'); // 'razorpay' | 'stripe'
  const [paymentStep, setPaymentStep] = useState('review'); // 'review' | 'processing' | 'success' | 'failed'
  const [paymentIdInput, setPaymentIdInput] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSubscriptionData = async () => {
    try {
      const p = await api.getPlans();
      setPlans(p);
      const s = await api.getSubscriptionStatus();
      setSubStatus(s);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const handleStartCheckout = async (planKey) => {
    const selectedPlan = plans[planKey];
    if (!selectedPlan) return;

    if (planKey === 'explorer') {
      // Downgrade confirmation
      if (window.confirm('Downgrade to Free Explorer plan? Your usage limits will adjust accordingly.')) {
        try {
          await api.createCheckout({ planId: 'explorer' });
          updateProfileLocally({ plan: 'explorer', maxCredits: 150 });
          showToast('Switched to Explorer plan.', 'info');
          await loadSubscriptionData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
      return;
    }

    setCheckoutPlan(selectedPlan);
    setPaymentStep('review');
    try {
      const order = await api.createCheckout({
        planId: planKey,
        provider: gatewayProvider,
      });
      setOrderData(order);
      setPaymentIdInput(`${gatewayProvider === 'razorpay' ? 'pay' : 'ch'}_${Math.random().toString(36).slice(2, 10)}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleConfirmPayment = async (statusToReport) => {
    // STRICT RULE: "Never show a payment as successful unless the payment provider confirms it."
    setPaymentStep('processing');
    try {
      // Send verification request to backend
      const res = await api.verifyPayment({
        orderId: orderData?.orderId,
        paymentId: paymentIdInput,
        planId: checkoutPlan?.id,
        status: statusToReport, // 'confirmed' or 'declined'
      });

      if (res.success) {
        setPaymentStep('success');
        updateProfileLocally({ plan: res.plan, credits: res.credits });
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        showToast(res.message, 'success');
        await loadSubscriptionData();
      } else {
        setPaymentStep('failed');
      }
    } catch (err) {
      setPaymentStep('failed');
      showToast(err.message, 'error');
    }
  };

  const creditPercentage = Math.min(100, Math.round(((user?.credits ?? 0) / (user?.maxCredits || 150)) * 100));

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-primary" />
          <span>Subscription & SaaS Plans</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Scale your creative universe with transparent, creator-first monthly plans.
        </p>
      </div>

      {/* ACTIVE USAGE STATUS CARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Current Subscription Status
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white capitalize">
                {user?.plan || 'Explorer'} Plan
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Active Member
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-gray-400 font-medium">Monthly Renewal</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Credit Meter */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emeraldGreen" />
              <span>AI Credit Balance</span>
            </span>
            <span className="font-extrabold text-gray-900 dark:text-white">
              {user?.credits ?? 0} <span className="text-gray-400 font-normal">/ {user?.maxCredits ?? 150} credits</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-emeraldGreen h-full rounded-full transition-all duration-500"
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Credits are deducted per AI generation (World Lore: 10 cr &bull; Characters: 10 cr &bull; Chapters: 15 cr &bull; Dialogues: 12 cr).
          </p>
        </div>
      </div>

      {/* PLAN TIERS COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* EXPLORER */}
        <div className={`p-8 rounded-3xl glass-panel border flex flex-col justify-between ${
          user?.plan === 'explorer' ? 'ring-2 ring-primary/40' : 'border-gray-200 dark:border-gray-800'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Explorer (Free)</div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹0</span>
              <span className="text-xs text-gray-500">/ forever</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">For worldbuilders and authors starting out.</p>

            <div className="space-y-3 mb-8 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                <span>150 AI Generation Credits</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                <span>Up to 3 Fictional Universes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                <span>Basic Character Lab & Biographies</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                <span>AI Story Studio Drafts</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                <span>Community Discovery Feed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStartCheckout('explorer')}
            disabled={user?.plan === 'explorer'}
            className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-xs hover:border-primary text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50"
          >
            {user?.plan === 'explorer' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* CREATOR (MOST POPULAR) */}
        <div className={`p-8 rounded-3xl glass-panel relative flex flex-col justify-between border-2 border-primary shadow-glow-primary ${
          user?.plan === 'creator' ? 'ring-2 ring-primary' : ''
        }`}>
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
            Recommended for Authors
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Creator</div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-primary">₹299</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">For novelists, screenwriters, and fiction authors.</p>

            <div className="space-y-3 mb-8 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>1,000 AI Credits / month</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Unlimited Universes & Characters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Advanced World Builder with Map Routes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Character Relationship Visual Graph</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Contextual Dialogue Generator</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Interactive Branching Story Builder</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Full Exports (DOCX, PDF, Markdown)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStartCheckout('creator')}
            disabled={user?.plan === 'creator'}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold text-xs shadow-glow-primary transition-all disabled:opacity-50"
          >
            {user?.plan === 'creator' ? 'Active Plan' : 'Upgrade to Creator'}
          </button>
        </div>

        {/* STUDIO */}
        <div className={`p-8 rounded-3xl glass-panel border flex flex-col justify-between ${
          user?.plan === 'studio' ? 'ring-2 ring-electric shadow-glow-electric' : 'border-gray-200 dark:border-gray-800'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-electric mb-2">Studio</div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹999</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">For writing rooms, indie game teams, and studios.</p>

            <div className="space-y-3 mb-8 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>5,000 AI Credits / month</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>All Creator Features Included</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>Multi-Creator Collaborative Workspaces</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>Custom LLM API Key Integration</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>Timeline Paradox & Continuity Auditor</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-electric flex-shrink-0" />
                <span>Priority Fast-Lane Generation & Support</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStartCheckout('studio')}
            disabled={user?.plan === 'studio'}
            className="w-full py-3 rounded-xl border border-electric text-electric hover:bg-electric hover:text-white font-bold text-xs transition-all disabled:opacity-50"
          >
            {user?.plan === 'studio' ? 'Active Plan' : 'Upgrade to Studio'}
          </button>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      {subStatus?.recentPayments && subStatus.recentPayments.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Confirmed Payment Receipts
          </h3>
          <div className="space-y-2">
            {subStatus.recentPayments.map(pay => (
              <div
                key={pay.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {pay.plan?.toUpperCase()} Plan &bull; {pay.amount} {pay.currency}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Provider Ref: {pay.paymentId} ({pay.paymentProvider})
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600">
                    Confirmed
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAZORPAY / STRIPE CHECKOUT MODAL */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setCheckoutPlan(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step: Review & Gateway Selection */}
            {paymentStep === 'review' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Upgrade to {checkoutPlan.name}
                  </h3>
                  <div className="text-2xl font-black text-primary mt-1">
                    ₹{checkoutPlan.price} <span className="text-xs font-normal text-gray-500">/ month</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-bold">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credits Included:</span>
                    <span className="font-bold text-emerald-500">{checkoutPlan.maxCredits} credits</span>
                  </div>
                </div>

                {/* Gateway Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Provider
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGatewayProvider('razorpay')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        gatewayProvider === 'razorpay'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600'
                      }`}
                    >
                      Razorpay (UPI / Cards)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewayProvider('stripe')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        gatewayProvider === 'stripe'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600'
                      }`}
                    >
                      Stripe (Global Cards)
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                  <strong>Strict Security Policy:</strong> Per system requirements, payment is only marked successful upon confirmed verification from the payment provider.
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleConfirmPayment('confirmed')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Confirm Payment (₹{checkoutPlan.price})</span>
                  </button>
                  <button
                    onClick={() => handleConfirmPayment('declined')}
                    className="w-full py-2 text-xs font-bold text-gray-400 hover:text-rose-500 text-center"
                  >
                    Simulate Payment Decline / Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step: Processing */}
            {paymentStep === 'processing' && (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Verifying Transaction with {gatewayProvider.toUpperCase()}...</h4>
                <p className="text-xs text-gray-400">Awaiting cryptographic signature confirmation...</p>
              </div>
            )}

            {/* Step: Success */}
            {paymentStep === 'success' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Confirmed!</h3>
                <p className="text-xs text-gray-500">
                  {gatewayProvider.toUpperCase()} confirmed transaction #{paymentIdInput}. You have been upgraded to the {checkoutPlan.name} Plan!
                </p>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-glow-primary"
                >
                  Return to Studio
                </button>
              </div>
            )}

            {/* Step: Failed */}
            {paymentStep === 'failed' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Not Confirmed</h3>
                <p className="text-xs text-gray-500">
                  The payment provider was unable to verify the transaction. No charges or plan modifications were applied.
                </p>
                <button
                  onClick={() => setPaymentStep('review')}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

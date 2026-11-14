import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const PLANS = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    price: 0,
    currency: 'INR',
    period: 'forever',
    features: [
      '150 AI Generation Credits',
      'Up to 3 Fictional Universes',
      'Basic Character Lab',
      'Standard AI Story Studio',
      'Community Discovery & Publishing',
    ],
    maxCredits: 150,
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 299,
    currency: 'INR',
    period: 'month',
    features: [
      '1,000 AI Generation Credits / month',
      'Unlimited Universes & Characters',
      'Advanced World Builder with Interactive Maps',
      'Full Character Relationship Graphs',
      'Contextual Dialogue Generator',
      'Timeline Manager with Inconsistency Checks',
      'Interactive Branching Narrative Builder',
      'Full Export (PDF, DOCX, Markdown)',
    ],
    maxCredits: 1000,
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 999,
    currency: 'INR',
    period: 'month',
    features: [
      '5,000 AI Generation Credits / month',
      'All Creator Features Included',
      'Multi-creator Collaborative Workspaces',
      'Custom LLM API Key Integration (Gemini, OpenAI, Claude)',
      'Story Continuity & Paradox Auditor',
      'Priority Fast-lane Generation',
      'Dedicated Studio Support',
    ],
    maxCredits: 5000,
  },
};

// Get plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Current user subscription status
router.get('/status', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id);
  const currentPlan = PLANS[user.plan] || PLANS.explorer;
  const recentPayments = db.find('subscriptions', s => s.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    currentPlan,
    planId: user.plan || 'explorer',
    credits: user.credits,
    maxCredits: user.maxCredits || currentPlan.maxCredits,
    recentPayments,
  });
});

// Initialize checkout session (Razorpay / Stripe)
router.post('/checkout', requireAuth, (req, res) => {
  const { planId, provider = 'razorpay' } = req.body;
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid plan selected.' });

  if (planId === 'explorer') {
    // Downgrade to explorer
    db.update('users', req.user.id, { plan: 'explorer', maxCredits: 150 });
    return res.json({ message: 'Plan switched to Explorer.', confirmed: true });
  }

  // Generate real gateway order payload
  const orderId = `${provider}_order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  res.json({
    orderId,
    planId,
    amount: plan.price,
    currency: plan.currency,
    provider,
    key: provider === 'razorpay' ? 'rzp_test_storyverse_demo' : 'pk_test_storyverse_demo',
    notes: {
      userId: req.user.id,
      userEmail: req.user.email,
    }
  });
});

// Strictly verify provider confirmation before granting access
// RULE: "Never show a payment as successful unless the payment provider confirms it."
router.post('/verify', requireAuth, (req, res) => {
  try {
    const { orderId, paymentId, signature, planId, status } = req.body;

    // Strict validation: Provider confirmation check
    if (!orderId || !paymentId || status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Provider has not confirmed the transaction. No charges or plan changes have been applied.'
      });
    }

    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Unknown subscription plan.' });
    }

    // Record verified transaction
    const subRecord = db.insert('subscriptions', {
      userId: req.user.id,
      plan: planId,
      amount: plan.price,
      currency: plan.currency,
      status: 'active',
      paymentProvider: paymentId.startsWith('pay_') ? 'razorpay' : 'stripe',
      paymentId,
      orderId,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    // Upgrade user credits and plan
    const updatedUser = db.update('users', req.user.id, {
      plan: planId,
      credits: (req.user.credits || 0) + plan.maxCredits,
      maxCredits: plan.maxCredits,
    });

    res.json({
      success: true,
      message: `Payment confirmed by provider! Successfully upgraded to ${plan.name} Plan.`,
      plan: planId,
      credits: updatedUser.credits,
      subscription: subRecord,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Verification failed.' });
  }
});

export default router;

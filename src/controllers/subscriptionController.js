const Subscription = require("../models/subscription");

exports.getPlans = async (req, res) => {
  try {
    const plans = await Subscription.getPlans();

    // Convert features from CSV → array
    const formatted = plans.map(plan => ({
      id: plan.plan_id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      features: plan.features ? plan.features.split(",") : []
    }));

    res.json({ success: true, plans: formatted });
  } catch (err) {
    console.error("Error fetching plans:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.purchaseSubscription = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: "Plan ID required" });
    }

    const subscription = await Subscription.purchase(userId, planId);

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, subscription });
  } catch (err) {
    console.error("Error purchasing subscription:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

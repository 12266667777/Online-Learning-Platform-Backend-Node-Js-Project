const db = require("../config/database");

const Subscription = {
  // Get all available plans
  async getPlans() {
    return db.all(`SELECT * FROM subscriptions_plans`);
  },

  // Purchase subscription
  async purchase(userId, planId) {
    // Fetch plan
    const plan = await db.get(
      `SELECT * FROM subscriptions_plans WHERE plan_id = ?`,
      [planId]
    );
    if (!plan) return null;

    // Calculate expiry based on duration
    let expiryDate;
    if (plan.duration === "monthly") {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan.duration === "yearly") {
      expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const isoExpiry = expiryDate.toISOString();

    // Insert into user_subscriptions
    const result = await db.run(
      `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, datetime('now'), ?, 'active')`,
      [userId, planId, isoExpiry]
    );

    return {
      subscriptionId: result.lastID,
      plan,
      startDate: new Date().toISOString(),
      endDate: isoExpiry,
      status: "active"
    };
  }
};

module.exports = Subscription;

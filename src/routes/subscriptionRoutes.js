const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/auth");

// Get subscription plans
router.get("/plans", subscriptionController.getPlans);

// Purchase subscription (auth required)
router.post("/purchase", authMiddleware, subscriptionController.purchaseSubscription);

module.exports = router;

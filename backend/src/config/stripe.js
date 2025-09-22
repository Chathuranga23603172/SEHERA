const Stripe = require("stripe");
// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// Stripe configuration object
const stripeConfig = {
  apiVersion: "2023-08-16",
  maxNetworkRetries: 3,
  timeout: 20000, // 20 seconds
};
// Configure Stripe settings
if (process.env.NODE_ENV === "development") {
  stripeConfig.telemetry = false;
}
// Apply configuration
Object.keys(stripeConfig).forEach((key) => {
  if (key !== "apiVersion") {
    stripe[key] = stripeConfig[key];
  }
});
// Helper functions for common Stripe operations
const stripeHelpers = {
  // Create a payment intent
  createPaymentIntent: async (amount, currency = "usd", metadata = {}) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  },

  // Create a customer
  createCustomer: async (customerData) => {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: customerData.metadata || {},
      });
      return customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // Retrieve a customer
  retrieveCustomer: async (customerId) => {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error("Error retrieving customer:", error);
      throw error;
    }
  },

  // Create a setup intent for saving payment methods
  createSetupIntent: async (customerId) => {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });
      return setupIntent;
    } catch (error) {
      console.error("Error creating setup intent:", error);
      throw error;
    }
  },

  // List customer payment methods
  listPaymentMethods: async (customerId) => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
      return paymentMethods;
    } catch (error) {
      console.error("Error listing payment methods:", error);
      throw error;
    }
  },

  // Confirm a payment intent
  confirmPaymentIntent: async (paymentIntentId, paymentMethodId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );
      return paymentIntent;
    } catch (error) {
      console.error("Error confirming payment intent:", error);
      throw error;
    }
  },

  // Create a refund
  createRefund: async (paymentIntentId, amount = null) => {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error("Error creating refund:", error);
      throw error;
    }
  },

  // Construct webhook event
  constructEvent: (payload, signature, endpointSecret) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
      return event;
    } catch (error) {
      console.error("Error constructing webhook event:", error);
      throw error;
    }
  },
};

// Export both the stripe instance and helper functions
module.exports = {
  stripe,
  stripeHelpers,
};

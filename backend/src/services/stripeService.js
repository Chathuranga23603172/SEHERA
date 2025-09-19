const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// Create Payment Intent
const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};
// Confirm Payment Intent
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};
// Create Customer
const createCustomer = async (customerData) => {
  try {
    const { email, name, phone, address } = customerData;
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      address,
    });
    return customer;
  } catch (error) {
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};
// Get Customer by ID
const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    throw new Error(`Customer retrieval failed: ${error.message}`);
  }
};
// Update Customer
const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await stripe.customers.update(customerId, updateData);
    return customer;
  } catch (error) {
    throw new Error(`Customer update failed: ${error.message}`);
  }
};
// Create Payment Method
const createPaymentMethod = async (paymentMethodData) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create(paymentMethodData);
    return paymentMethod;
  } catch (error) {
    throw new Error(`Payment method creation failed: ${error.message}`);
  }
};
// Attach Payment Method to Customer
const attachPaymentMethodToCustomer = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return paymentMethod;
  } catch (error) {
    throw new Error(`Payment method attachment failed: ${error.message}`);
  }
};
// Get Customer Payment Methods
const getCustomerPaymentMethods = async (customerId, type = "card") => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return paymentMethods;
  } catch (error) {
    throw new Error(`Payment methods retrieval failed: ${error.message}`);
  }
};
// Create Subscription (for premium features)
const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  } catch (error) {
    throw new Error(`Subscription creation failed: ${error.message}`);
  }
};
// Cancel Subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    throw new Error(`Subscription cancellation failed: ${error.message}`);
  }
};
// Create Refund
const createRefund = async (
  paymentIntentId,
  amount = null,
  reason = "requested_by_customer"
) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};
// Get Payment Intent
const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment intent retrieval failed: ${error.message}`);
  }
};
// List Customer Payments
const getCustomerPayments = async (customerId, limit = 10) => {
  try {
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit,
    });
    return payments;
  } catch (error) {
    throw new Error(`Payment history retrieval failed: ${error.message}`);
  }
};
// Create Product (for wardrobe items)
const createProduct = async (productData) => {
  try {
    const { name, description, images, metadata } = productData;
    const product = await stripe.products.create({
      name,
      description,
      images,
      metadata,
    });
    return product;
  } catch (error) {
    throw new Error(`Product creation failed: ${error.message}`);
  }
};
// Create Price for Product
const createPrice = async (productId, amount, currency = "usd") => {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100),
      currency,
    });
    return price;
  } catch (error) {
    throw new Error(`Price creation failed: ${error.message}`);
  }
};
// Webhook signature verification
const verifyWebhookSignature = (payload, signature, endpointSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};
// Handle discount/coupon creation
const createCoupon = async (couponData) => {
  try {
    const {
      id,
      percent_off,
      amount_off,
      currency,
      duration,
      duration_in_months,
    } = couponData;
    const coupon = await stripe.coupons.create({
      id,
      percent_off,
      amount_off: amount_off ? Math.round(amount_off * 100) : undefined,
      currency,
      duration,
      duration_in_months,
    });
    return coupon;
  } catch (error) {
    throw new Error(`Coupon creation failed: ${error.message}`);
  }
};
// Apply coupon to payment intent
const applyCouponToPaymentIntent = async (paymentIntentId, couponId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { coupon_id: couponId },
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Coupon application failed: ${error.message}`);
  }
};
module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  createCustomer,
  getCustomer,
  updateCustomer,
  createPaymentMethod,
  attachPaymentMethodToCustomer,
  getCustomerPaymentMethods,
  createSubscription,
  cancelSubscription,
  createRefund,
  getPaymentIntent,
  getCustomerPayments,
  createProduct,
  createPrice,
  verifyWebhookSignature,
  createCoupon,
  applyCouponToPaymentIntent,
};

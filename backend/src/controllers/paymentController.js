const { validationResult } = require('express-validator'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const Payment = require('../models/Payment'); 
const User = require('../models/User'); 
// @desc    Create payment intent 
// @route   POST /api/payment/create-intent 
// @access  Private 
const createPaymentIntent = async (req, res) => { 
try { 
const errors = validationResult(req); 
if (!errors.isEmpty()) { 
return res.status(400).json({ 
success: false, 
message: 'Validation errors', 
errors: errors.array() 
}); 
} 
const userId = req.user.userId; 
const { amount, currency = 'usd', items, description } = req.body; 
// Convert amount to cents (Stripe expects amounts in smallest currency unit) 
const amountInCents = Math.round(amount * 100); 
// Create payment intent with Stripe 
const paymentIntent = await stripe.paymentIntents.create({ 
      amount: amountInCents, 
      currency: currency.toLowerCase(), 
      metadata: { 
        userId: userId.toString(), 
        description: description || 'Fashion item purchase', 
        itemCount: items ? items.length.toString() : '0' 
      }, 
      automatic_payment_methods: { 
        enabled: true 
      } 
    }); 
 
    // Save payment record in database 
    const payment = new Payment({ 
      user: userId, 
      stripePaymentIntentId: paymentIntent.id, 
      amount: amount, 
      currency: currency.toUpperCase(), 
      status: 'pending', 
      description, 
      items: items || [], 
      metadata: { 
        clientSecret: paymentIntent.client_secret 
      } 
    }); 
 
    await payment.save(); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Payment intent created successfully', 
      data: { 
        clientSecret: paymentIntent.client_secret, 
        paymentIntentId: paymentIntent.id, 
        amount: amount, 
        currency: currency.toUpperCase() 
      } 
    }); 
 
  } catch (error) { 
    console.error('Create payment intent error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Confirm payment 
// @route   POST /api/payment/confirm 
// @access  Private 
const confirmPayment = async (req, res) => { 
  try { 
    const { paymentIntentId } = req.body; 
    const userId = req.user.userId; 
 
    // Retrieve payment intent from Stripe 
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId); 
 
    if (!paymentIntent) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Payment intent not found' 
      }); 
    } 
 
    // Find payment in database 
    const payment = await Payment.findOne({ 
      user: userId, 
      stripePaymentIntentId: paymentIntentId 
    }); 
 
    if (!payment) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      }); 
    } 
 
    // Update payment status based on Stripe status 
    payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 
paymentIntent.status; 
    payment.completedAt = paymentIntent.status === 'succeeded' ? new Date() : null; 
    payment.stripeChargeId = paymentIntent.latest_charge; 
 
    await payment.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Payment confirmation processed', 
      data: { 
        paymentId: payment._id, 
        status: payment.status, 
        amount: payment.amount, 
        completedAt: payment.completedAt 
      } 
    }); 
 
  } catch (error) { 
    console.error('Confirm payment error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Get payment history 
// @route   GET /api/payment/history 
// @access  Private 
const getPaymentHistory = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
    const { page = 1, limit = 10, status, startDate, endDate } = req.query; 
 
    // Build filter 
    let filter = { user: userId }; 
 
    if (status) filter.status = status; 
    if (startDate || endDate) { 
      filter.createdAt = {}; 
      if (startDate) filter.createdAt.$gte = new Date(startDate); 
      if (endDate) filter.createdAt.$lte = new Date(endDate); 
    } 
 
    const skip = (page - 1) * limit; 
 
    const payments = await Payment.find(filter) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(Number(limit)) 
      .select('-metadata.clientSecret'); // Don't expose client secret 
 
    const total = await Payment.countDocuments(filter); 
 
    // Calculate totals 
    const totals = await Payment.aggregate([ 
      { $match: { ...filter, status: 'completed' } }, 
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' }, 
          totalTransactions: { $sum: 1 }, 
          averageAmount: { $avg: '$amount' } 
        } 
      } 
    ]); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        payments, 
        pagination: { 
          page: Number(page), 
          limit: Number(limit), 
          total, 
          pages: Math.ceil(total / limit) 
        }, 
        summary: totals[0] || { 
          totalAmount: 0, 
          totalTransactions: 0, 
          averageAmount: 0 
        } 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get payment history error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve payment history', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Refund payment 
// @route   POST /api/payment/:id/refund 
// @access  Private 
const refundPayment = async (req, res) => { 
  try { 
    const paymentId = req.params.id; 
    const userId = req.user.userId; 
    const { amount, reason } = req.body; 
 
    // Find payment 
    const payment = await Payment.findOne({ 
      _id: paymentId, 
      user: userId, 
      status: 'completed' 
    }); 
 
    if (!payment) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found or cannot be refunded' 
      }); 
    } 
 
    // Calculate refund amount 
    const refundAmount = amount || payment.amount; 
    const refundAmountInCents = Math.round(refundAmount * 100); 
 
    // Create refund with Stripe 
    const refund = await stripe.refunds.create({ 
      payment_intent: payment.stripePaymentIntentId, 
      amount: refundAmountInCents, 
      metadata: { 
        reason: reason || 'Customer request', 
        originalPaymentId: paymentId 
      } 
    }); 
 
    // Update payment record 
    payment.status = refundAmount === payment.amount ? 'refunded' : 'partially_refunded'; 
    payment.refunds = payment.refunds || []; 
    payment.refunds.push({ 
      stripeRefundId: refund.id, 
      amount: refundAmount, 
      reason: reason || 'Customer request', 
      createdAt: new Date() 
    }); 
 
    await payment.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Refund processed successfully', 
      data: { 
        refundId: refund.id, 
        amount: refundAmount, 
        status: payment.status 
      } 
    }); 
 
  } catch (error) { 
    console.error('Refund payment error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process refund', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Add payment method 
// @route   POST /api/payment/methods 
// @access  Private 
const addPaymentMethod = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const userId = req.user.userId; 
    const { paymentMethodId } = req.body; 
 
    // Get user to check if they have a Stripe customer ID 
    const user = await User.findById(userId); 
    let customerId = user.stripeCustomerId; 
 
    // Create Stripe customer if doesn't exist 
    if (!customerId) { 
      const customer = await stripe.customers.create({ 
        email: user.email, 
        metadata: { 
          userId: userId.toString() 
        } 
      }); 
      customerId = customer.id; 
       
      // Save customer ID to user record 
      user.stripeCustomerId = customerId; 
      await user.save(); 
    } 
 
    // Attach payment method to customer 
    await stripe.paymentMethods.attach(paymentMethodId, { 
      customer: customerId 
    }); 
 
    // Get payment method details 
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId); 
 
    // Save payment method reference in user record 
    if (!user.paymentMethods) user.paymentMethods = []; 
    user.paymentMethods.push({ 
      stripePaymentMethodId: paymentMethodId, 
      type: paymentMethod.type, 
      last4: paymentMethod.card?.last4, 
      brand: paymentMethod.card?.brand, 
      expMonth: paymentMethod.card?.exp_month, 
      expYear: paymentMethod.card?.exp_year, 
      isDefault: user.paymentMethods.length === 0, // First method is default 
      createdAt: new Date() 
    }); 
 
    await user.save(); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Payment method added successfully', 
      data: { 
        paymentMethodId: paymentMethodId, 
        type: paymentMethod.type, 
        card: paymentMethod.card ? { 
          last4: paymentMethod.card.last4, 
          brand: paymentMethod.card.brand, 
          expMonth: paymentMethod.card.exp_month, 
          expYear: paymentMethod.card.exp_year 
        } : null 
      } 
    }); 
 
  } catch (error) { 
    console.error('Add payment method error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add payment method', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Get payment methods 
// @route   GET /api/payment/methods 
// @access  Private 
const getPaymentMethods = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
 
    const user = await User.findById(userId); 
     
    if (!user.stripeCustomerId) { 
      return res.status(200).json({ 
        success: true, 
        data: { 
          paymentMethods: [], 
          message: 'No payment methods found' 
        } 
      }); 
    } 
 
    // Get payment methods from Stripe 
    const paymentMethods = await stripe.paymentMethods.list({ 
      customer: user.stripeCustomerId, 
      type: 'card' 
    }); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        paymentMethods: paymentMethods.data.map(pm => ({ 
          id: pm.id, 
          type: pm.type, 
          card: pm.card ? { 
            last4: pm.card.last4, 
            brand: pm.card.brand, 
            expMonth: pm.card.exp_month, 
            expYear: pm.card.exp_year 
          } : null, 
          created: pm.created 
        })) 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get payment methods error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve payment methods', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Delete payment method 
// @route   DELETE /api/payment/methods/:id 
// @access  Private 
const deletePaymentMethod = async (req, res) => { 
  try { 
    const paymentMethodId = req.params.id; 
    const userId = req.user.userId; 
 
    // Detach payment method from customer 
    await stripe.paymentMethods.detach(paymentMethodId); 
 
    // Remove from user record 
    const user = await User.findById(userId); 
    if (user.paymentMethods) { 
      user.paymentMethods = user.paymentMethods.filter( 
        pm => pm.stripePaymentMethodId !== paymentMethodId 
      ); 
      await user.save(); 
    } 
 
    res.status(200).json({ 
      success: true, 
      message: 'Payment method deleted successfully' 
    }); 
 
  } catch (error) { 
    console.error('Delete payment method error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete payment method', 
      error: error.message 
    }); 
  } 
}; 
 
// @desc    Handle Stripe webhooks 
// @route   POST /api/payment/webhook 
// @access  Public (but verified by Stripe) 
const handleStripeWebhook = async (req, res) => { 
  try { 
    const sig = req.headers['stripe-signature']; 
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
 
    let event; 
 
    try { 
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret); 
    } catch (err) { 
      console.error('Webhook signature verification failed:', err.message); 
      return res.status(400).send(`Webhook Error: ${err.message}`); 
    } 
 
    // Handle the event 
    switch (event.type) { 
      case 'payment_intent.succeeded': 
        const paymentIntent = event.data.object; 
         
        // Update payment status in database 
        await Payment.findOneAndUpdate( 
          { stripePaymentIntentId: paymentIntent.id }, 
          {  
            status: 'completed', 
            completedAt: new Date(), 
            stripeChargeId: paymentIntent.latest_charge 
          } 
        ); 
        break; 
 
      case 'payment_intent.payment_failed': 
        const failedPayment = event.data.object; 
         
        await Payment.findOneAndUpdate( 
          { stripePaymentIntentId: failedPayment.id }, 
          {  
            status: 'failed', 
            failedAt: new Date(), 
            failureReason: failedPayment.last_payment_error?.message 
          } 
        ); 
        break; 
 
      default: 
        console.log(`Unhandled event type ${event.type}`); 
    } 
 
    res.status(200).json({ received: true }); 
 
  } catch (error) { 
    console.error('Stripe webhook error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Webhook processing failed', 
      error: error.message 
    }); 
  } 
}; 
 
module.exports = { 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentHistory, 
  refundPayment, 
  addPaymentMethod, 
  getPaymentMethods, 
  deletePaymentMethod, 
  handleStripeWebhook 
}; 
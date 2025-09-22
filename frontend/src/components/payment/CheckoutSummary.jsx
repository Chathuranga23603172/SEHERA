import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CheckoutSummary = ({ 
  items = [], 
  discountCode = '', 
  onDiscountApply, 
  onItemRemove, 
  onItemQuantityChange,
  onProceedToPayment,
  loading = false 
}) => {
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountInput, setDiscountInput] = useState(discountCode);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percentage / 100) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * (tax / 100);
  const total = discountedSubtotal + taxAmount + shipping;

  useEffect(() => {
    // Calculate tax based on subtotal (8.5% example rate)
    setTax(8.5);
    
    // Calculate shipping (free shipping over $100)
    setShipping(discountedSubtotal >= 100 ? 0 : 10);
  }, [discountedSubtotal]);

  const handleDiscountApply = async () => {
    if (!discountInput.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const discount = await onDiscountApply(discountInput);
      if (discount.valid) {
        setAppliedDiscount(discount);
        toast.success(`Discount "${discountInput}" applied! ${discount.percentage}% off`);
      } else {
        toast.error('Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      toast.error('Failed to apply discount code');
      console.error('Discount error:', error);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput('');
    toast.success('Discount removed');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    onItemQuantityChange(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    onItemRemove(itemId);
    toast.success('Item removed from cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-gray-400 text-lg mb-2">Your cart is empty</div>
        <div className="text-gray-500 text-sm">Add some items to get started</div>
      </div>
  };

export default CheckoutSummary;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0">
              <img
                src={item.image || '/placeholder-image.jpg'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-sm text-gray-500">Size: {item.size}</p>
              {item.color && (
                <p className="text-sm text-gray-500">Color: {item.color}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity || 1}</span>
              <button
                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {formatPrice(item.price * (item.quantity || 1))}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(item.price)} each
              </div>
            </div>
            
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Discount Code Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Discount Code</h3>
        {appliedDiscount ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-medium">
                {appliedDiscount.code} ({appliedDiscount.percentage}% off)
              </span>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
              placeholder="Enter discount code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleDiscountApply}
              disabled={!discountInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        {appliedDiscount && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({appliedDiscount.percentage}% off)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span>Tax ({tax}%)</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
        
        {shipping === 0 && discountedSubtotal >= 100 && (
          <div className="text-sm text-green-600">
            ✓ Free shipping on orders over $100
          </div>
        )}
        
        <hr className="my-4" />
        
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onProceedToPayment(total, items)}
          disabled={loading || items.length === 0}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Proceed to Payment - ${formatPrice(total)}`
          )}
        </button>
        
        <button
          onClick={() => window.history.back()}
          className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
        >
          Continue Shopping
        </button>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Secure checkout powered by Stripe</span>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <div>Estimated delivery: 3-5 business days</div>
        <div>Express shipping available at checkout</div>
      </div>
    </div>
  );
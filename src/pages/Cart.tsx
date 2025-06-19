import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios'; 
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, Copy, Phone, CreditCard, Loader2, MapPin, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PickupPoint {
  id: string;
  name: string;
  location_details: string;
  city: string;
  cost: number;
  phone_number: string;
  delivery_method: string;
  is_doorstep: boolean;
}

interface PaymentDetails {
  mpesa_code: string;
  phone_number: string;
  amount: number;
  order_id?: string | number;
}

interface OrderResponse {
  order_id?: string;
  id?: string;
  success?: boolean;
  message?: string;
}

interface OrderDetails {
  customer_name: string;
  customer_phone: string;
  pickup_point_id?: string;
  delivery_address?: string;
  city?: string;
  order_notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    custom_images?: string[];
  }>;
  total_amount: number;
}

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    getOrderIds,
    getItemByOrderId,
    getItemsByOrderId 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);
  const [orderStep, setOrderStep] = useState<'upload' | 'delivery' | 'payment'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    mpesa_code: '',
    phone_number: '',
    amount: 0,
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const fetchPickupPoints = async () => {
    setLoadingPickupPoints(true);
    try {
      const response = await axios.get<{ pickup_points: PickupPoint[] }>(
        `${import.meta.env.VITE_API_URL}/pickup-points`,
        { withCredentials: true }
      );
      setPickupPoints(response.data.pickup_points || []);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      toast({
        title: "Error",
        description: "Failed to load pickup points. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPickupPoints(false);
    }
  };

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const handlePickupPointChange = (pickupPointId: string) => {
    const selectedPoint = pickupPoints.find(point => point.id === pickupPointId);
    setSelectedPickupPoint(selectedPoint || null);
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const deliveryCost = selectedPickupPoint?.cost || 0;
    return subtotal + deliveryCost;
  };

const updateOrder = async (orderId: string | number, orderData: any): Promise<string | null> => {
  try {
    const response = await axios.put<OrderResponse>(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}`, // Note: Updated endpoint with order ID
      orderData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return orderId.toString();
  } catch (error) {
    console.error('Error updating order:', error);
    
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update order';
      toast({
        title: "Order Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Order Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    return null;
  }
};

  const submitPayment = async (paymentData: PaymentDetails): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments`,
        paymentData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Error submitting payment:', error);
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Payment submission failed';
        toast({
          title: "Payment Submission Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Payment Submission Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
      
      return false;
    }
  };

  // Function to check if order ID exists in cart
  const findOrderInCart = (searchOrderId: string): boolean => {
    const orderIds = getOrderIds();
    return orderIds.some(id => id.toString() === searchOrderId);
    
  };

  // Function to get order details from cart
  const getOrderDetailsFromCart = (searchOrderId: string) => {
    const items = getItemsByOrderId(searchOrderId);
    const orderTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return {
      items,
      total: orderTotal,
      exists: items.length > 0
    };
  };

const handleCheckout = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedPickupPoint) {
    toast({
      title: "Pickup Point Required",
      description: "Please select a pickup point for delivery.",
      variant: "destructive"
    });
    return;
  }
  
  setIsSubmitting(true);

  try {
    // Get all existing order IDs from cart items
    const existingOrderIds = getOrderIds();
    
    if (existingOrderIds.length === 0) {
      toast({
        title: "No Orders Found",
        description: "No orders found in cart. Please add items first.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Group cart items by order ID
    const orderGroups = existingOrderIds.map(orderId => ({
      orderId,
      items: getItemsByOrderId(orderId)
    }));
    

    // Update each existing order with customer details and pickup point
    const updatePromises = orderGroups.map(async (group) => {
      const orderData = {
        order_id: group.orderId, // Include the existing order ID
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        delivery_address: customerDetails.address,
        city: customerDetails.city,
        order_notes: customerDetails.notes,
        pickup_point_id: selectedPickupPoint.id,
        total_amount: calculateTotal()
      };

      return await updateOrder(group.orderId, orderData);
    });

    // Wait for all order updates to complete
    const updateResults = await Promise.all(updatePromises);
    
    // Check if all updates were successful
    const allSuccessful = updateResults.every(result => result !== null);
    
    if (allSuccessful) {
      // Use the first order ID for payment (or you might want to handle multiple orders differently)
      const primaryOrderId = existingOrderIds[0];
      setOrderId(primaryOrderId.toString());
      
      // Prepare payment details
      setPaymentDetails({
        mpesa_code: '',
        phone_number: customerDetails.phone,
        amount: calculateTotal(),
        order_id: primaryOrderId
      });
      
      toast({
        title: "Orders updated successfully!",
        description: `Your order details have been updated. Please complete payment to confirm.`,
      });
      
      setShowCheckout(false);
      setShowPayment(true);
    } else {
      throw new Error('Failed to update some orders');
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Checkout Failed",
      description: "Failed to update order details. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handlePaymentComplete = async () => {
    if (!paymentDetails.mpesa_code.trim()) {
      toast({
        title: "M-Pesa Code Required",
        description: "Please enter the M-Pesa confirmation code to complete your order.",
        variant: "destructive"
      });
      return;
    }

    // Check if order exists in cart before processing payment
    if (orderId && !findOrderInCart(orderId)) {
      // If order ID is not in cart, still proceed with payment
      // as it might be a valid order created in this session
      console.log('Order not found in cart context, but proceeding with payment');
    }

    setIsProcessingPayment(true);

    try {
      const paymentSuccess = await submitPayment({
        ...paymentDetails,
        order_id: orderId
      });

      if (paymentSuccess) {
        clearCart();
        setCustomerDetails({
          name: '',
          phone: '',
          address: '',
          city: '',
          notes: ''
        });
        setPaymentDetails({
          mpesa_code: '',
          phone_number: '',
          amount: 0,
        });
        setSelectedPickupPoint(null);
        setShowPayment(false);
        
        toast({
          title: "Payment confirmed!",
          description: "Thank you for your order. We'll start production immediately and keep you updated.",
        });
      }
    } catch (error) {
      console.error('Payment completion error:', error);
      toast({
        title: "Payment Processing Failed",
        description: "Failed to process payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to handle existing order payment (if needed)
  const handleExistingOrderPayment = (existingOrderId: string) => {
    const orderDetails = getOrderDetailsFromCart(existingOrderId);
    
    if (orderDetails.exists) {
      setOrderId(existingOrderId);
      setPaymentDetails({
        mpesa_code: '',
        phone_number: customerDetails.phone,
        amount: orderDetails.total,
        order_id: existingOrderId
      });
      setShowPayment(true);
      
      toast({
        title: "Order Found",
        description: `Resuming payment for order ${existingOrderId}`,
      });
    } else {
      toast({
        title: "Order Not Found",
        description: "The specified order was not found in your cart.",
        variant: "destructive"
      });
    }
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">Order Created!</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Order ID: <span className="font-semibold">{orderId}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h3 className="text-xl font-bold mb-4 text-purple-800 dark:text-purple-200 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Complete Payment via M-Pesa
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Step 1: Go to M-Pesa Menu</h4>
                      <p className="text-gray-700 dark:text-gray-300">On your phone, go to M-Pesa → Lipa na M-Pesa → Paybill</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Step 2: Enter Payment Details</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Paybill Number</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">522522</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard('522522', 'Paybill number')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Number</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{orderId}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(orderId, 'Account number')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">KSh {paymentDetails.amount.toLocaleString()}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(paymentDetails.amount.toString(), 'Amount')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Step 3: Confirm Payment</h4>
                      <p className="text-gray-700 dark:text-gray-300">Enter your M-Pesa PIN and confirm the payment</p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Step 4: Enter M-Pesa Confirmation Code</h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        After payment, enter the M-Pesa confirmation code you received:
                      </p>
                      <div className="space-y-3">
                        <Input
                          name="mpesa_code"
                          value={paymentDetails.mpesa_code}
                          onChange={handlePaymentDetailsChange}
                          placeholder="e.g., QEI4N2M8XY"
                          className="font-mono"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          The confirmation code is usually 10 characters long and contains letters and numbers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold mb-2 text-foreground">Order Summary:</h4>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm mb-1 text-foreground">
                        <span>{item.name} x {item.quantity}</span>
                        <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedPickupPoint && selectedPickupPoint.cost > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-foreground">
                        <span>Delivery ({selectedPickupPoint.name})</span>
                        <span>KSh {selectedPickupPoint.cost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 font-bold">
                      <div className="flex justify-between text-foreground">
                        <span>Total:</span>
                        <span className="text-purple-600 dark:text-purple-400">KSh {paymentDetails.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <Button
                      onClick={() => setShowPayment(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessingPayment}
                    >
                      Back to Cart
                    </Button>
                    <Button
                      onClick={handlePaymentComplete}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isProcessingPayment || !paymentDetails.mpesa_code.trim()}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Confirm Payment
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> Save our paybill number (522522) in your contacts for faster future payments!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any magnets to your cart yet.</p>
            <Button onClick={() => window.location.href = '/'} className="bg-purple-600 hover:bg-purple-700">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {!showCheckout ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        {item.customImages && item.customImages.length > 0 && (
                          <p className="text-purple-600 text-sm font-medium mt-1">
                            {item.customImages.length} custom design(s) uploaded
                          </p>
                        )}
                        {item.orderId && (
                          <p className="text-blue-600 text-sm font-medium mt-1">
                            Order ID: {item.orderId}
                          </p>
                        )}
                        <div className="text-purple-600 font-bold text-lg mt-2">
                          KSh {item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>KSh {getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="text-green-600">
                      {selectedPickupPoint ? 
                        (selectedPickupPoint.cost > 0 ? `KSh ${selectedPickupPoint.cost.toLocaleString()}` : 'Free') 
                        : 'Select pickup point'
                      }
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-purple-600">KSh {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Checkout Details</CardTitle>
                <CardDescription>
                  Please fill in your details to complete your order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        name="name"
                        value={customerDetails.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        name="phone"
                        value={customerDetails.phone}
                        onChange={handleInputChange}
                        placeholder="+254 700 123 456"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Pickup Point *</label>
                    <Select 
                      value={selectedPickupPoint?.id || ""} 
                      onValueChange={handlePickupPointChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingPickupPoints ? "Loading pickup points..." : "Select a pickup point"} />
                      </SelectTrigger>
                      <SelectContent>
                        {pickupPoints.map((point) => (
                          <SelectItem key={point.id} value={point.id}>
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">{point.name}</span>
                                {point.cost > 0 && (
                                  <span className="text-sm text-green-600 font-medium">
                                    +KSh {point.cost}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 ml-6">
                                {point.location_details}, {point.city}
                              </div>
                              <div className="text-xs text-gray-400 ml-6 flex items-center space-x-2">
                                <span>{point.delivery_method}</span>
                                {point.phone_number && (
                                  <>
                                    <span>•</span>
                                    <span>{point.phone_number}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPickupPoint && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-200">{selectedPickupPoint.name}</p>
                            <p className="text-blue-600 dark:text-blue-300">{selectedPickupPoint.location_details}, {selectedPickupPoint.city}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-blue-600 dark:text-blue-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{selectedPickupPoint.delivery_method}</span>
                              </span>
                              {selectedPickupPoint.phone_number && (
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{selectedPickupPoint.phone_number}</span>
                                </span>
                              )}
                              {selectedPickupPoint.cost > 0 && (
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  Delivery: KSh {selectedPickupPoint.cost.toLocaleString()}
                                </span>
                              )}
                              {selectedPickupPoint.cost === 0 && (
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  Free Delivery
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Address</label>
                      <Input
                        name="address"
                        value={customerDetails.address}
                        onChange={handleInputChange}
                        placeholder="Your delivery address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        name="city"
                        value={customerDetails.city}
                        onChange={handleInputChange}
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                    <Textarea
                      name="notes"
                      value={customerDetails.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or notes for your order..."
                      rows={3}
                    />
                  </div>

                  {/* Order Summary in Checkout */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>KSh {getCartTotal().toLocaleString()}</span>
                      </div>
                      {selectedPickupPoint && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery ({selectedPickupPoint.name}):</span>
                          <span className={selectedPickupPoint.cost > 0 ? "text-orange-600" : "text-green-600"}>
                            {selectedPickupPoint.cost > 0 ? `KSh ${selectedPickupPoint.cost.toLocaleString()}` : 'Free'}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-purple-600 dark:text-purple-400">KSh {calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Back to Cart
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={isSubmitting || !selectedPickupPoint}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Create Order & Proceed to Payment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
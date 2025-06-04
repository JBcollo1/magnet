import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, Copy, Phone, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    orderNotes: ''
  });

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate order ID
    const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderId(newOrderId);
    
    toast({
      title: "Order received!",
      description: `Your order ${newOrderId} has been received. Please complete payment to confirm.`,
    });
    
    setShowCheckout(false);
    setShowPayment(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerDetails({
      ...customerDetails,
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

  const handlePaymentComplete = () => {
    clearCart();
    setCustomerDetails({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      orderNotes: ''
    });
    setShowPayment(false);
    toast({
      title: "Order confirmed!",
      description: "Thank you for your order. We'll start production immediately.",
    });
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
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">Order Received!</CardTitle>
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
                          <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">KSh {getCartTotal().toLocaleString()}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(getCartTotal().toString(), 'Amount')}
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
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Step 4: Send Confirmation</h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        After payment, send the M-Pesa confirmation message to:
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-bold text-yellow-600 dark:text-yellow-400">+254 700 123 456</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard('+254 700 123 456', 'Phone number')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
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
                    <div className="border-t pt-2 mt-2 font-bold">
                      <div className="flex justify-between text-foreground">
                        <span>Total:</span>
                        <span className="text-purple-600 dark:text-purple-400">KSh {getCartTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <Button
                      onClick={() => setShowPayment(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Cart
                    </Button>
                    <Button
                      onClick={handlePaymentComplete}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Completed
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
                        {item.customImages && (
                          <p className="text-purple-600 text-sm font-medium mt-1">
                            {item.customImages.length} custom design(s) uploaded
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
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-purple-600">KSh {getCartTotal().toLocaleString()}</span>
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
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                    <Input
                      name="address"
                      value={customerDetails.address}
                      onChange={handleInputChange}
                      placeholder="Your delivery address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      name="city"
                      value={customerDetails.city}
                      onChange={handleInputChange}
                      placeholder="Your city"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                    <Textarea
                      name="orderNotes"
                      value={customerDetails.orderNotes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Order Summary:</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm mb-1">
                        <span>{item.name} x {item.quantity}</span>
                        <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-bold">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="text-purple-600">KSh {getCartTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1"
                    >
                      Back to Cart
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Place Order
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

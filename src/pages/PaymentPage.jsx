import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    XCircle,
    Loader2,
    CreditCard,
    ArrowLeft,
    Bike,
    Calendar,
    MapPin,
    Shield,
} from "lucide-react";
import bookingService from "../services/bookingService";
import { useToast } from "@/components/ui/toast";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const booking = location.state?.booking;
    const bike = location.state?.bike;
    const rentalDetails = location.state?.rentalDetails;

    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        if (!booking || !bike) {
            navigate("/bikes");
        }
    }, [booking, bike, navigate]);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await bookingService.loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load payment gateway. Please try again.");
            }

            // Create Razorpay order
            const orderData = await bookingService.createRazorpayOrder({
                bookingId: booking.bookingId,
                amount: booking.totalAmount
            });

            // Open Razorpay checkout
            const paymentResponse = await bookingService.openRazorpayCheckout({
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "RideOnGo",
                description: `Booking for ${bike.brandName}`,
                order_id: orderData.orderId,
                prefill: {
                    name: JSON.parse(localStorage.getItem("user"))?.firstName || "",
                    email: JSON.parse(localStorage.getItem("user"))?.email || "",
                    contact: JSON.parse(localStorage.getItem("user"))?.phone || ""
                },
                theme: {
                    color: "#EF4444"
                }
            });

            // Verify payment
            const verificationResult = await bookingService.verifyPayment({
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                bookingId: booking.bookingId,
                amount: booking.totalAmount, // Add amount
                paymentMode: "RAZORPAY"
            });

            setPaymentDetails(verificationResult);
            setPaymentStatus("success");

            toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed.",
            });

        } catch (error) {
            console.error("Payment error:", error);
            setPaymentStatus("failed");
            toast({
                title: "Payment Failed",
                description: error.message || "Payment could not be processed",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!booking || !bike) {
        return null;
    }

    // Success Screen
    if (paymentStatus === "success") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-gray-400 mb-6">Your booking has been confirmed.</p>

                        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Booking ID</span>
                                <span className="text-white font-mono">#{booking.bookingId}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Amount Paid</span>
                                <span className="text-green-500 font-bold">₹{booking.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transaction ID</span>
                                <span className="text-white font-mono text-sm">{paymentDetails?.txnRef?.slice(0, 15)}...</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate("/my-bookings")}
                                className="w-full bg-red-500 hover:bg-red-600"
                            >
                                View My Bookings
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/")}
                                className="w-full border-gray-700 text-gray-300"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Failed Screen
    if (paymentStatus === "failed") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                        <p className="text-gray-400 mb-6">Something went wrong with your payment. Please try again.</p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    setPaymentStatus(null);
                                    handlePayment();
                                }}
                                className="w-full bg-red-500 hover:bg-red-600"
                            >
                                Retry Payment
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/bikes")}
                                className="w-full border-gray-700 text-gray-300"
                            >
                                Cancel Booking
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Payment Page
    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
                </div>

                <div className="space-y-6">
                    {/* Booking Summary */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-24 h-20 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                                    {bike.image ? (
                                        <img src={bike.image} alt={bike.brandName} className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <Bike className="h-8 w-8 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">{bike.brandName}</h3>
                                    <p className="text-sm text-gray-400">{bike.category} • {bike.cc}cc</p>
                                </div>
                            </div>

                            <hr className="border-gray-700" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Pickup: {new Date(booking.pickupTs).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Drop: {new Date(booking.dropTs).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 col-span-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {booking.pickupType === "STATION"
                                            ? `Station: ${booking.pickupLocationAddress || 'Selected Location'}`
                                            : `Doorstep: ${booking.deliveryAddress}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Price Breakdown */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Price Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-gray-400">
                                <span>Rental Amount</span>
                                <span>₹{(booking.totalAmount - booking.taxAmount).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>GST (18%)</span>
                                <span>₹{booking.taxAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Discount</span>
                                <span className="text-green-500">-₹{booking.discountAmount}</span>
                            </div>
                            <hr className="border-gray-700" />
                            <div className="flex justify-between text-xl font-bold">
                                <span className="text-white">Total Amount</span>
                                <span className="text-red-500">₹{booking.totalAmount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Info */}
                    <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
                        <Shield className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-green-400">
                            Your payment is secured by Razorpay. We do not store your card details.
                        </p>
                    </div>

                    {/* Pay Button */}
                    <Button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-semibold"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pay ₹{booking.totalAmount}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

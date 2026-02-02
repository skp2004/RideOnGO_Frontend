import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bike,
    MapPin,
    Calendar,
    Clock,
    Truck,
    Building2,
    CreditCard,
    ArrowLeft,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";
import adminService from "../services/adminService";
import { useToast } from "@/components/ui/toast";

const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const bike = location.state?.bike;
    const selectedDuration = location.state?.duration || "1 Day";

    const [pickupType, setPickupType] = useState("STATION");
    const [pickupLocationId, setPickupLocationId] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [dropDate, setDropDate] = useState("");
    const [dropTime, setDropTime] = useState("10:00");
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    // Redirect if not authenticated or no bike selected (wait for auth to load first)
    useEffect(() => {
        if (authLoading) return; // Wait for auth to finish loading

        if (!isAuthenticated) {
            navigate("/login", { state: { from: "/booking" } });
            return;
        }
        if (!bike) {
            navigate("/bikes");
            return;
        }
    }, [isAuthenticated, authLoading, bike, navigate]);

    // Fetch locations for station pickup
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await adminService.getLocations();
                setLocations(data.filter(loc => loc.isActive));
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            }
        };
        fetchLocations();

        // Set default dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setPickupDate(today.toISOString().split('T')[0]);
        setDropDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    // Calculate rental details
    const calculateRentalDetails = () => {
        if (!pickupDate || !dropDate || !bike) {
            return { hours: 0, days: 0, rentalType: "DAILY", basePrice: 0, tax: 0, total: 0 };
        }

        const pickup = new Date(`${pickupDate}T${pickupTime}`);
        const drop = new Date(`${dropDate}T${dropTime}`);
        const diffMs = drop - pickup;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let rentalType, basePrice;
        if (diffDays >= 7) {
            rentalType = "WEEKLY";
            basePrice = bike.pricePer7Days || bike.ratePerDay * 7;
            basePrice = Math.ceil(diffDays / 7) * basePrice;
        } else if (diffDays >= 1) {
            rentalType = "DAILY";
            basePrice = bike.ratePerDay * diffDays;
        } else {
            rentalType = "HOURLY";
            basePrice = bike.ratePerHour * Math.max(1, diffHours);
        }

        // Add delivery charge for doorstep
        const deliveryCharge = pickupType === "DOORSTEP" ? 100 : 0;
        const tax = Math.round(basePrice * 0.18); // 18% GST
        const total = basePrice + tax + deliveryCharge;

        return {
            hours: diffHours,
            days: diffDays,
            rentalType,
            basePrice,
            deliveryCharge,
            tax,
            total
        };
    };

    const rentalDetails = calculateRentalDetails();

    const handleProceedToPayment = async () => {
        // Validation
        if (pickupType === "STATION" && !pickupLocationId) {
            toast({ title: "Error", description: "Please select a pickup station", variant: "destructive" });
            return;
        }
        if (pickupType === "DOORSTEP" && !deliveryAddress.trim()) {
            toast({ title: "Error", description: "Please enter your delivery address", variant: "destructive" });
            return;
        }
        if (!pickupDate || !dropDate) {
            toast({ title: "Error", description: "Please select pickup and drop dates", variant: "destructive" });
            return;
        }

        setIsPaymentLoading(true);

        try {
            // Create booking
            const bookingData = {
                bikeId: bike.bikeId,
                userId: user.id,
                pickupTs: `${pickupDate}T${pickupTime}:00`,
                dropTs: `${dropDate}T${dropTime}:00`,
                rentalType: rentalDetails.rentalType,
                pickupType: pickupType,
                pickupLocationId: pickupType === "STATION" ? parseInt(pickupLocationId) : null,
                deliveryAddress: pickupType === "DOORSTEP" ? deliveryAddress : null,
                taxAmount: rentalDetails.tax,
                discountAmount: 0,
                totalAmount: rentalDetails.total
            };

            const booking = await bookingService.createBooking(bookingData);

            // Navigate to payment page with booking data
            navigate("/payment", {
                state: {
                    booking,
                    bike,
                    rentalDetails
                }
            });

        } catch (error) {
            toast({
                title: "Booking Failed",
                description: error.message || "Failed to create booking",
                variant: "destructive"
            });
        } finally {
            setIsPaymentLoading(false);
        }
    };

    // Show loading while auth is checking
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }

    if (!bike) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
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
                    <h1 className="text-2xl font-bold text-white">Complete Your Booking</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Section - Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bike Summary Card */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex gap-6">
                                    <div className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                                        {bike.image ? (
                                            <img src={bike.image} alt={bike.brandName} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <Bike className="h-12 w-12 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{bike.brandName}</h2>
                                        <p className="text-gray-400">{bike.category} • {bike.cc}cc • {bike.fuelType}</p>
                                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{bike.locationCity}, {bike.locationState}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pickup Type Selection */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-red-500" />
                                    Pickup Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPickupType("STATION")}
                                        className={`p-4 rounded-lg border-2 transition-all ${pickupType === "STATION"
                                            ? "border-red-500 bg-red-500/10"
                                            : "border-gray-700 hover:border-gray-600"
                                            }`}
                                    >
                                        <Building2 className={`h-6 w-6 mx-auto mb-2 ${pickupType === "STATION" ? "text-red-500" : "text-gray-400"}`} />
                                        <p className={`font-medium ${pickupType === "STATION" ? "text-white" : "text-gray-300"}`}>Station Pickup</p>
                                        <p className="text-xs text-gray-500 mt-1">Pick from our station</p>
                                    </button>
                                    <button
                                        onClick={() => setPickupType("DOORSTEP")}
                                        className={`p-4 rounded-lg border-2 transition-all ${pickupType === "DOORSTEP"
                                            ? "border-red-500 bg-red-500/10"
                                            : "border-gray-700 hover:border-gray-600"
                                            }`}
                                    >
                                        <Truck className={`h-6 w-6 mx-auto mb-2 ${pickupType === "DOORSTEP" ? "text-red-500" : "text-gray-400"}`} />
                                        <p className={`font-medium ${pickupType === "DOORSTEP" ? "text-white" : "text-gray-300"}`}>Doorstep Delivery</p>
                                        <p className="text-xs text-gray-500 mt-1">+₹100 delivery charge</p>
                                    </button>
                                </div>

                                {pickupType === "STATION" && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Select Pickup Station</Label>
                                        <Select value={pickupLocationId} onValueChange={setPickupLocationId}>
                                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                                <SelectValue placeholder="Choose a station" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {locations.map((loc) => (
                                                    <SelectItem key={loc.id} value={loc.id.toString()} className="text-white">
                                                        {loc.address}, {loc.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {pickupType === "DOORSTEP" && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Delivery Address</Label>
                                        <Input
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter your complete address"
                                            className="bg-gray-800 border-gray-700 text-white"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Date & Time Selection */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-red-500" />
                                    Pickup & Drop Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-white">Pickup</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-gray-400 text-sm">Date</Label>
                                                <Input
                                                    type="date"
                                                    value={pickupDate}
                                                    onChange={(e) => setPickupDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-400 text-sm">Time</Label>
                                                <Input
                                                    type="time"
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-white">Drop</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-gray-400 text-sm">Date</Label>
                                                <Input
                                                    type="date"
                                                    value={dropDate}
                                                    onChange={(e) => setDropDate(e.target.value)}
                                                    min={pickupDate}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-400 text-sm">Time</Label>
                                                <Input
                                                    type="time"
                                                    value={dropTime}
                                                    onChange={(e) => setDropTime(e.target.value)}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section - Price Summary */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gray-900 border-gray-800 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-white">Price Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Rental ({rentalDetails.days} days)</span>
                                        <span>₹{rentalDetails.basePrice}</span>
                                    </div>
                                    {rentalDetails.deliveryCharge > 0 && (
                                        <div className="flex justify-between text-gray-400">
                                            <span>Delivery Charge</span>
                                            <span>₹{rentalDetails.deliveryCharge}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-400">
                                        <span>GST (18%)</span>
                                        <span>₹{rentalDetails.tax}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Discount</span>
                                        <span className="text-green-500">-₹0</span>
                                    </div>
                                    <hr className="border-gray-700" />
                                    <div className="flex justify-between text-lg font-bold text-white">
                                        <span>Total</span>
                                        <span className="text-red-500">₹{rentalDetails.total}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProceedToPayment}
                                    disabled={isPaymentLoading}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-semibold"
                                >
                                    {isPaymentLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    By proceeding, you agree to our Terms & Conditions
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

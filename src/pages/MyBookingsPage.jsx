import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bike,
    Calendar,
    MapPin,
    Clock,
    CreditCard,
    XCircle,
    Loader2,
    RefreshCw,
    ChevronRight,
    Building2,
    Truck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";
import { useToast } from "@/components/ui/toast";

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to finish loading

        if (!isAuthenticated) {
            navigate("/login", { state: { from: "/my-bookings" } });
            return;
        }
        fetchBookings();
    }, [isAuthenticated, authLoading, navigate]);

    const fetchBookings = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await bookingService.getUserBookings(user.id);
            // Sort by created date, newest first
            setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.message || "Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        try {
            await bookingService.cancelBooking(bookingId);
            toast({
                title: "Booking Cancelled",
                description: "Your booking has been cancelled successfully.",
            });
            fetchBookings();
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to cancel booking",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            CONFIRMED: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Confirmed" },
            ONGOING: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Ongoing" },
            COMPLETED: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "Completed" },
            CANCELLED: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Cancelled" },
        };
        const config = statusConfig[status] || statusConfig.CONFIRMED;
        return (
            <Badge variant="outline" className={`${config.color} border`}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">My Bookings</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchBookings}
                        className="text-gray-400 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {error ? (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-8 text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Bookings</h3>
                            <p className="text-gray-400 mb-4">{error}</p>
                            <Button onClick={fetchBookings}>Try Again</Button>
                        </CardContent>
                    </Card>
                ) : bookings.length === 0 ? (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-8 text-center">
                            <Bike className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Bookings Yet</h3>
                            <p className="text-gray-400 mb-4">You haven't made any bookings yet. Start exploring our bikes!</p>
                            <Button onClick={() => navigate("/bikes")} className="bg-red-500 hover:bg-red-600">
                                Browse Bikes
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card key={booking.bookingId} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Bike Image */}
                                        <div className="w-full md:w-32 h-24 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                            {booking.bikeImage ? (
                                                <img
                                                    src={booking.bikeImage}
                                                    alt={booking.bikeName}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <Bike className="h-10 w-10 text-gray-600" />
                                            )}
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">{booking.bikeName}</h3>
                                                    <p className="text-sm text-gray-400">Booking #{booking.bookingId}</p>
                                                </div>
                                                {getStatusBadge(booking.bookingStatus)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Pickup</p>
                                                        <p className="text-gray-300">{formatDate(booking.pickupTs)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Drop</p>
                                                        <p className="text-gray-300">{formatDate(booking.dropTs)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    {booking.pickupType === "STATION" ? (
                                                        <Building2 className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Truck className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-gray-500">Pickup Type</p>
                                                        <p className="text-gray-300">{booking.pickupType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <CreditCard className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="text-white font-bold">₹{booking.totalAmount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {booking.bookingStatus === "CONFIRMED" && (
                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                        onClick={() => handleCancelBooking(booking.bookingId)}
                                                    >
                                                        Cancel Booking
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;

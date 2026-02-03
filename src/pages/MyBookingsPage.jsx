import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bike,
    Calendar,
    MapPin,
    CreditCard,
    XCircle,
    Loader2,
    RefreshCw,
    Building2,
    Truck,
    Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";
import { useToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // Review State
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to finish loading

        if (!isAuthenticated) {
            navigate("/login", { state: { from: "/my-bookings" } });
            return;
        }

        // Only fetch bookings when user object with id is available
        if (user?.id) {
            fetchBookings();
        }
    }, [isAuthenticated, authLoading, navigate, user]);

    const fetchBookings = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            console.log("Fetching bookings for user:", user.id);
            const data = await bookingService.getUserBookings(user.id);
            console.log("Bookings received:", data);
            // Sort by created date, newest first
            setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError(err.message || "Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    const initiateCancel = (bookingId) => {
        setBookingToCancel(bookingId);
        setIsCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        try {
            await bookingService.cancelBooking(bookingToCancel);
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
        } finally {
            setIsCancelDialogOpen(false);
            setBookingToCancel(null);
        }
    };

    const handleOpenReview = (booking) => {
        setReviewBooking(booking);
        setReviewRating(5);
        setReviewComment("");
        setIsReviewDialogOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewBooking) return;

        setIsSubmittingReview(true);
        try {
            await bookingService.addReview({
                bikeId: reviewBooking.bikeId,
                rating: reviewRating,
                comments: reviewComment
            });

            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            });
            setIsReviewDialogOpen(false);
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to submit review",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingReview(false);
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

                                            {/* Location/Address Details */}
                                            {(booking.pickupType === "DOORSTEP" && booking.deliveryAddress) ||
                                                (booking.pickupType === "STATION" && booking.pickupLocationAddress) ? (
                                                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                        <div className="text-sm">
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {booking.pickupType === "DOORSTEP" ? "Delivery Address" : "Pickup Station"}
                                                            </p>
                                                            {booking.pickupType === "DOORSTEP" ? (
                                                                <p className="text-gray-300">{booking.deliveryAddress}</p>
                                                            ) : (
                                                                <div className="text-gray-300">
                                                                    <p>{booking.pickupLocationAddress}</p>
                                                                    <p className="text-gray-400">
                                                                        {booking.pickupLocationCity}, {booking.pickupLocationState} - {booking.pickupLocationPincode}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Actions */}
                                            {booking.bookingStatus === "CONFIRMED" && (
                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                        onClick={() => initiateCancel(booking.bookingId)}
                                                    >
                                                        Cancel Booking
                                                    </Button>
                                                </div>
                                            )}
                                            {booking.bookingStatus === "COMPLETED" && (
                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                                                        onClick={() => handleOpenReview(booking)}
                                                    >
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Write Review
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
                {/* Cancel Dialog */}
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cancel Booking</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Are you sure you want to cancel this booking? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setIsCancelDialogOpen(false)}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                                Keep Booking
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmCancel}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Yes, Cancel Booking
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Rate your experience with {reviewBooking?.bikeName}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-gray-300">Rating</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${star <= reviewRating
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-gray-600"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="comment" className="text-gray-300">Review</Label>
                                <Textarea
                                    id="comment"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="bg-gray-800 border-gray-700 text-white resize-none"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting
                                    </>
                                ) : (
                                    "Submit Review"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default MyBookingsPage;

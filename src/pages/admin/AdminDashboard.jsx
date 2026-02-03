import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Bike,
    MapPin,
    Tag,
    TrendingUp,
    Calendar,
    DollarSign,
    Activity,
    CreditCard,
    Star,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
} from "lucide-react";
import adminService from "../../services/adminService";
import bookingService from "../../services/bookingService";
import reviewService from "../../services/reviewService";
import { format, isToday, startOfMonth, isWithinInterval, endOfMonth } from "date-fns";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBikes: 0,
        totalLocations: 0,
        totalBrands: 0,
        totalBookings: 0,
        totalRevenue: 0,
        todaysBookings: 0,
        todaysRevenue: 0,
        monthlyRevenue: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        availableBikes: 0,
        totalReviews: 0,
        avgRating: 0,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, bikes, locations, brands, bookings, reviews] = await Promise.all([
                    adminService.getUsers(),
                    adminService.getBikes(),
                    adminService.getLocations(),
                    adminService.getBrands(),
                    bookingService.getAllBookings(),
                    reviewService.getAllReviews().catch(() => []),
                ]);

                // Calculate booking stats
                const today = new Date();
                const monthStart = startOfMonth(today);
                const monthEnd = endOfMonth(today);

                const todaysBookings = bookings.filter(b =>
                    b.createdAt && isToday(new Date(b.createdAt))
                );

                const monthlyBookings = bookings.filter(b =>
                    b.createdAt && isWithinInterval(new Date(b.createdAt), { start: monthStart, end: monthEnd })
                );

                const completedBookings = bookings.filter(b => b.bookingStatus === "COMPLETED");
                const pendingBookings = bookings.filter(b => b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED");
                const cancelledBookings = bookings.filter(b => b.bookingStatus === "CANCELLED");
                const availableBikes = bikes.filter(b => b.status === "AVAILABLE");

                // Calculate revenue
                const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                const todaysRevenue = todaysBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

                // Review stats
                const avgRating = reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0;

                setStats({
                    totalUsers: users?.length || 0,
                    totalBikes: bikes?.length || 0,
                    totalLocations: locations?.length || 0,
                    totalBrands: brands?.length || 0,
                    totalBookings: bookings?.length || 0,
                    totalRevenue,
                    todaysBookings: todaysBookings.length,
                    todaysRevenue,
                    monthlyRevenue,
                    pendingBookings: pendingBookings.length,
                    completedBookings: completedBookings.length,
                    cancelledBookings: cancelledBookings.length,
                    availableBikes: availableBikes.length,
                    totalReviews: reviews.length,
                    avgRating,
                });

                // Recent bookings (sorted by date, latest first)
                const sorted = [...bookings].sort((a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                ).slice(0, 5);
                setRecentBookings(sorted);

            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: "bg-green-500/20 text-green-400",
            CONFIRMED: "bg-blue-500/20 text-blue-400",
            PENDING: "bg-yellow-500/20 text-yellow-400",
            ONGOING: "bg-purple-500/20 text-purple-400",
            CANCELLED: "bg-red-500/20 text-red-400",
        };
        return styles[status] || "bg-gray-500/20 text-gray-400";
    };

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Total Bikes",
            value: stats.totalBikes,
            icon: Bike,
            color: "bg-red-500",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: Calendar,
            color: "bg-green-500",
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "bg-yellow-500",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">
                    Welcome back! Here's an overview of your bike rental business.
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="bg-gray-800/80 border border-gray-700 shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.color}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Completed</p>
                                <p className="text-xl font-bold text-white">{stats.completedBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Clock className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Pending</p>
                                <p className="text-xl font-bold text-white">{stats.pendingBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Cancelled</p>
                                <p className="text-xl font-bold text-white">{stats.cancelledBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Bike className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Available Bikes</p>
                                <p className="text-xl font-bold text-white">{stats.availableBikes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                    <CardHeader className="border-b border-gray-800">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Today's Bookings</span>
                                </div>
                                <span className="font-bold text-green-400">{stats.todaysBookings}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Today's Revenue</span>
                                </div>
                                <span className="font-bold text-green-400">₹{stats.todaysRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">This Month's Revenue</span>
                                </div>
                                <span className="font-bold text-blue-400">₹{stats.monthlyRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <Star className="h-5 w-5 text-yellow-400" />
                                    <span className="text-gray-300">Reviews ({stats.totalReviews})</span>
                                </div>
                                <span className="font-bold text-yellow-400">{stats.avgRating} ★</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Locations</span>
                                </div>
                                <span className="font-bold text-purple-400">{stats.totalLocations}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Brands</span>
                                </div>
                                <span className="font-bold text-orange-400">{stats.totalBrands}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                    <CardHeader className="border-b border-gray-800">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Activity className="h-5 w-5 text-red-500" />
                            Recent Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {recentBookings.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No bookings yet</p>
                            ) : (
                                recentBookings.map((booking) => (
                                    <div key={booking.bookingId} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <Bike className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">
                                                {booking.bikeName || `Booking #${booking.bookingId}`}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {booking.createdAt
                                                    ? format(new Date(booking.createdAt), "MMM d, yyyy h:mm a")
                                                    : "N/A"
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusBadge(booking.bookingStatus)}>
                                                {booking.bookingStatus}
                                            </Badge>
                                            <p className="text-sm font-bold text-white mt-1">
                                                ₹{booking.totalAmount || 0}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Search,
    Loader2,
    RefreshCw,
    Filter,
    X,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";
import bookingService from "../../services/bookingService";
import { useToast } from "@/components/ui/toast";

const AdminBookingsPage = () => {
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pickupTypeFilter, setPickupTypeFilter] = useState("all");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await bookingService.getAllBookings();
            setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.message || "Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            toast({
                title: "Status Updated",
                description: `Booking #${bookingId} status changed to ${newStatus}`,
            });
            fetchBookings();
        } catch (err) {
            toast({
                title: "Update Failed",
                description: err.message || "Failed to update status",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            CONFIRMED: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
            ONGOING: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
            COMPLETED: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: CheckCircle },
            CANCELLED: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
        };
        const config = statusConfig[status] || statusConfig.CONFIRMED;
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={`${config.color} border flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const matchesSearch =
                booking.bookingId.toString().includes(searchTerm) ||
                booking.bikeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.userId.toString().includes(searchTerm);
            const matchesStatus = statusFilter === "all" || booking.bookingStatus === statusFilter;
            const matchesPickupType = pickupTypeFilter === "all" || booking.pickupType === pickupTypeFilter;
            return matchesSearch && matchesStatus && matchesPickupType;
        });
    }, [bookings, searchTerm, statusFilter, pickupTypeFilter]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPickupTypeFilter("all");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || pickupTypeFilter !== "all";

    // Stats
    const stats = useMemo(() => ({
        total: bookings.length,
        confirmed: bookings.filter(b => b.bookingStatus === "CONFIRMED").length,
        ongoing: bookings.filter(b => b.bookingStatus === "ONGOING").length,
        completed: bookings.filter(b => b.bookingStatus === "COMPLETED").length,
        cancelled: bookings.filter(b => b.bookingStatus === "CANCELLED").length,
        totalRevenue: bookings
            .filter(b => b.bookingStatus !== "CANCELLED")
            .reduce((sum, b) => sum + b.totalAmount, 0)
    }), [bookings]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
                <Button onClick={fetchBookings} variant="outline" size="sm" className="border-gray-700">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-gray-400">Total</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
                        <p className="text-sm text-gray-400">Confirmed</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.ongoing}</p>
                        <p className="text-sm text-gray-400">Ongoing</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-gray-400">{stats.completed}</p>
                        <p className="text-sm text-gray-400">Completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
                        <p className="text-sm text-gray-400">Cancelled</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">₹{stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by ID, bike, or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="ONGOING">Ongoing</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={pickupTypeFilter} onValueChange={setPickupTypeFilter}>
                            <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Pickup Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="STATION">Station</SelectItem>
                                <SelectItem value="DOORSTEP">Doorstep</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400">
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-800">
                                    <TableHead className="text-gray-400">ID</TableHead>
                                    <TableHead className="text-gray-400">Bike</TableHead>
                                    <TableHead className="text-gray-400">User ID</TableHead>
                                    <TableHead className="text-gray-400">Pickup</TableHead>
                                    <TableHead className="text-gray-400">Drop</TableHead>
                                    <TableHead className="text-gray-400">Type</TableHead>
                                    <TableHead className="text-gray-400">Amount</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.bookingId} className="border-gray-800">
                                            <TableCell className="text-white font-mono">#{booking.bookingId}</TableCell>
                                            <TableCell className="text-white">{booking.bikeName}</TableCell>
                                            <TableCell className="text-gray-400">{booking.userId}</TableCell>
                                            <TableCell className="text-gray-400">{formatDate(booking.pickupTs)}</TableCell>
                                            <TableCell className="text-gray-400">{formatDate(booking.dropTs)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-gray-300 border-gray-600">
                                                    {booking.pickupType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-white font-semibold">₹{booking.totalAmount}</TableCell>
                                            <TableCell>{getStatusBadge(booking.bookingStatus)}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={booking.bookingStatus}
                                                    onValueChange={(value) => handleStatusChange(booking.bookingId, value)}
                                                    disabled={booking.bookingStatus === "CANCELLED"}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700 text-white text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBookingsPage;

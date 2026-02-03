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
    MapPin,
    Building2,
    Truck,
    Phone,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    CalendarDays,
} from "lucide-react";
import bookingService from "../../services/bookingService";
import { useToast } from "@/components/ui/toast";

const AdminBookingsPage = () => {
    const { toast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pickupTypeFilter, setPickupTypeFilter] = useState("all");
    const [rentalTypeFilter, setRentalTypeFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("newest");

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

    const toggleRow = (bookingId) => {
        setExpandedRows(prev => ({
            ...prev,
            [bookingId]: !prev[bookingId]
        }));
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

    const getPickupTypeBadge = (pickupType) => {
        if (pickupType === "DOORSTEP") {
            return (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Doorstep
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Station
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

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const filteredBookings = useMemo(() => {
        let result = bookings.filter((booking) => {
            const matchesSearch =
                booking.bookingId.toString().includes(searchTerm) ||
                booking.bikeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.userId.toString().includes(searchTerm);
            const matchesStatus = statusFilter === "all" || booking.bookingStatus === statusFilter;
            const matchesPickupType = pickupTypeFilter === "all" || booking.pickupType === pickupTypeFilter;
            const matchesRentalType = rentalTypeFilter === "all" || booking.rentalType === rentalTypeFilter;

            // Date range filter
            let matchesDateRange = true;
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                const bookingDate = new Date(booking.createdAt);
                matchesDateRange = matchesDateRange && bookingDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                const bookingDate = new Date(booking.createdAt);
                matchesDateRange = matchesDateRange && bookingDate <= toDate;
            }

            return matchesSearch && matchesStatus && matchesPickupType && matchesRentalType && matchesDateRange;
        });

        // Apply sorting
        switch (sortBy) {
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "amount-high":
                result.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case "amount-low":
                result.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [bookings, searchTerm, statusFilter, pickupTypeFilter, rentalTypeFilter, dateFrom, dateTo, sortBy]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPickupTypeFilter("all");
        setRentalTypeFilter("all");
        setDateFrom("");
        setDateTo("");
        setSortBy("newest");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || pickupTypeFilter !== "all" ||
        rentalTypeFilter !== "all" || dateFrom || dateTo || sortBy !== "newest";

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
                <CardContent className="p-4 space-y-4">
                    {/* First row of filters */}
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
                            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
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
                            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Pickup Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="all">All Pickup</SelectItem>
                                <SelectItem value="STATION">Station</SelectItem>
                                <SelectItem value="DOORSTEP">Doorstep</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={rentalTypeFilter} onValueChange={setRentalTypeFilter}>
                            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Rental Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="all">All Rentals</SelectItem>
                                <SelectItem value="HOURLY">Hourly</SelectItem>
                                <SelectItem value="DAILY">Daily</SelectItem>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Second row - Date range and Sort */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">From:</span>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-[150px] bg-gray-800 border-gray-700 text-white"
                            />
                            <span className="text-sm text-gray-400">To:</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-[150px] bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="amount-high">Amount (High-Low)</SelectItem>
                                <SelectItem value="amount-low">Amount (Low-High)</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                                <X className="h-4 w-4 mr-1" />
                                Clear All Filters
                            </Button>
                        )}
                        <span className="text-sm text-gray-500 ml-auto">
                            Showing {filteredBookings.length} of {bookings.length} bookings
                        </span>
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
                                    <TableHead className="text-gray-400 w-8"></TableHead>
                                    <TableHead className="text-gray-400">ID</TableHead>
                                    <TableHead className="text-gray-400">Bike</TableHead>
                                    <TableHead className="text-gray-400">User ID</TableHead>
                                    <TableHead className="text-gray-400">Pickup</TableHead>
                                    <TableHead className="text-gray-400">Drop</TableHead>
                                    <TableHead className="text-gray-400">Type</TableHead>
                                    <TableHead className="text-gray-400">Delivery</TableHead>
                                    <TableHead className="text-gray-400">Amount</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-gray-400">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <React.Fragment key={booking.bookingId}>
                                            {/* Main Row */}
                                            <TableRow className="border-gray-800 cursor-pointer hover:bg-gray-800/50" onClick={() => toggleRow(booking.bookingId)}>
                                                <TableCell>
                                                    {expandedRows[booking.bookingId] ? (
                                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-white font-mono">#{booking.bookingId}</TableCell>
                                                <TableCell className="text-white">{booking.bikeName}</TableCell>
                                                <TableCell className="text-gray-400">{booking.userId}</TableCell>
                                                <TableCell className="text-gray-400">{formatDate(booking.pickupTs)}</TableCell>
                                                <TableCell className="text-gray-400">{formatDate(booking.dropTs)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-gray-300 border-gray-600">
                                                        {booking.rentalType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getPickupTypeBadge(booking.pickupType)}</TableCell>
                                                <TableCell className="text-white font-semibold">₹{booking.totalAmount}</TableCell>
                                                <TableCell>{getStatusBadge(booking.bookingStatus)}</TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
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

                                            {/* Expanded Details Row */}
                                            {expandedRows[booking.bookingId] && (
                                                <TableRow className="border-gray-800 bg-gray-800/30">
                                                    <TableCell colSpan={11} className="p-4">
                                                        <div className="grid md:grid-cols-3 gap-6">
                                                            {/* Schedule Details */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                                    Schedule Details
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Pickup:</span>
                                                                        <span className="text-white">{formatDateTime(booking.pickupTs)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Drop:</span>
                                                                        <span className="text-white">{formatDateTime(booking.dropTs)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Duration:</span>
                                                                        <span className="text-white">{booking.rentalType}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Location/Address Details */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                                                    {booking.pickupType === "DOORSTEP" ? (
                                                                        <><Truck className="h-4 w-4 text-purple-500" /> Doorstep Delivery</>
                                                                    ) : (
                                                                        <><Building2 className="h-4 w-4 text-cyan-500" /> Station Pickup</>
                                                                    )}
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    {booking.pickupType === "DOORSTEP" ? (
                                                                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                                                            <div className="flex items-start gap-2">
                                                                                <MapPin className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                                                                                <span className="text-gray-300">
                                                                                    {booking.deliveryAddress || "No address provided"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ) : booking.pickupLocationAddress ? (
                                                                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 space-y-2">
                                                                            <div className="flex items-start gap-2">
                                                                                <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                                                                                <div className="text-gray-300">
                                                                                    <p>{booking.pickupLocationAddress}</p>
                                                                                    <p className="text-gray-400">
                                                                                        {booking.pickupLocationCity}, {booking.pickupLocationState} - {booking.pickupLocationPincode}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {booking.pickupLocationContact && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Phone className="h-4 w-4 text-cyan-400" />
                                                                                    <span className="text-gray-300">{booking.pickupLocationContact}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-gray-500 italic">Station details not available</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Price Breakdown */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                                                    <span className="text-red-500">₹</span>
                                                                    Price Breakdown
                                                                </h4>
                                                                <div className="space-y-2 text-sm bg-gray-800/50 rounded-lg p-3">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Tax:</span>
                                                                        <span className="text-white">₹{booking.taxAmount}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Discount:</span>
                                                                        <span className="text-green-400">-₹{booking.discountAmount}</span>
                                                                    </div>
                                                                    <hr className="border-gray-700" />
                                                                    <div className="flex justify-between font-bold">
                                                                        <span className="text-gray-300">Total:</span>
                                                                        <span className="text-red-500">₹{booking.totalAmount}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
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


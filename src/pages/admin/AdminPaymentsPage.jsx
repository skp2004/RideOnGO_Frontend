import React, { useState, useEffect, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
    Search,
    Loader2,
    RefreshCw,
    X,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    IndianRupee,
    CalendarDays,
    ArrowUpDown,
} from "lucide-react";
import bookingService from "../../services/bookingService";
import { useToast } from "@/components/ui/toast";

const AdminPaymentsPage = () => {
    const { toast } = useToast();

    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modeFilter, setModeFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await bookingService.getAllPayments();
            setPayments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.message || "Failed to load payments");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            SUCCESS: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
            PENDING: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
            FAILED: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
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
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const filteredPayments = useMemo(() => {
        let result = payments.filter((payment) => {
            const matchesSearch =
                payment.id?.toString().includes(searchTerm) ||
                payment.bookingId?.toString().includes(searchTerm) ||
                payment.txnRef?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
            const matchesMode = modeFilter === "all" || payment.paymentMode === modeFilter;

            // Date range filter
            let matchesDateRange = true;
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                const paymentDate = new Date(payment.createdAt);
                matchesDateRange = matchesDateRange && paymentDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                const paymentDate = new Date(payment.createdAt);
                matchesDateRange = matchesDateRange && paymentDate <= toDate;
            }

            return matchesSearch && matchesStatus && matchesMode && matchesDateRange;
        });

        // Apply sorting
        switch (sortBy) {
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "amount-high":
                result.sort((a, b) => b.amount - a.amount);
                break;
            case "amount-low":
                result.sort((a, b) => a.amount - b.amount);
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [payments, searchTerm, statusFilter, modeFilter, dateFrom, dateTo, sortBy]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setModeFilter("all");
        setDateFrom("");
        setDateTo("");
        setSortBy("newest");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || modeFilter !== "all" ||
        dateFrom || dateTo || sortBy !== "newest";

    // Stats
    const stats = useMemo(() => ({
        total: payments.length,
        success: payments.filter(p => p.status === "SUCCESS").length,
        pending: payments.filter(p => p.status === "PENDING").length,
        failed: payments.filter(p => p.status === "FAILED").length,
        totalAmount: payments
            .filter(p => p.status === "SUCCESS")
            .reduce((sum, p) => sum + (p.amount || 0), 0)
    }), [payments]);

    // Get unique payment modes
    const paymentModes = useMemo(() => {
        const modes = [...new Set(payments.map(p => p.paymentMode).filter(Boolean))];
        return modes;
    }, [payments]);

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
                <h1 className="text-2xl font-bold text-white">Payments Management</h1>
                <Button onClick={fetchPayments} variant="outline" size="sm" className="border-gray-700">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-gray-400">Total Transactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-bold text-green-400">{stats.success}</p>
                        <p className="text-sm text-gray-400">Successful</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                        <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                        <p className="text-sm text-gray-400">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                        <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
                        <p className="text-sm text-gray-400">Failed</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <IndianRupee className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold text-green-500">₹{stats.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Total Collected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 space-y-4">
                    {/* First row - Search and dropdowns */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by ID, booking ID, or transaction ref..."
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
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={modeFilter} onValueChange={setModeFilter}>
                            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="all">All Modes</SelectItem>
                                {paymentModes.map(mode => (
                                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                ))}
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
                            Showing {filteredPayments.length} of {payments.length} payments
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
                                    <TableHead className="text-gray-400">Payment ID</TableHead>
                                    <TableHead className="text-gray-400">Booking ID</TableHead>
                                    <TableHead className="text-gray-400">Amount</TableHead>
                                    <TableHead className="text-gray-400">Mode</TableHead>
                                    <TableHead className="text-gray-400">Type</TableHead>
                                    <TableHead className="text-gray-400">Transaction Ref</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                                            No payments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} className="border-gray-800">
                                            <TableCell className="text-white font-mono">#{payment.id}</TableCell>
                                            <TableCell className="text-gray-400 font-mono">#{payment.bookingId}</TableCell>
                                            <TableCell className="text-white font-semibold">₹{payment.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-gray-300 border-gray-600">
                                                    {payment.paymentMode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-400">{payment.paymentType}</TableCell>
                                            <TableCell className="text-gray-400 font-mono text-sm">
                                                {payment.txnRef?.slice(0, 20)}...
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell className="text-gray-400">{formatDate(payment.createdAt)}</TableCell>
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

export default AdminPaymentsPage;

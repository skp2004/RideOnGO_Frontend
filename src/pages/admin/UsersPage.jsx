import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import {
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Loader2,
    Eye,
    RefreshCw,
    Phone,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Shield,
    Filter,
    X,
    FileText,
    CreditCard,
    Image,
    ExternalLink,
    Bike,
    Clock,
    ShieldCheck,
    ShieldX,
    AlertTriangle,
} from "lucide-react";
import adminService from "../../services/adminService";
import bookingService from "../../services/bookingService";

const roleColors = {
    ROLE_ADMIN: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-purple-400",
    ROLE_CUSTOMER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ROLE_USER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// Format role for display
const formatRole = (role) => {
    if (!role) return "User";
    return role.replace("ROLE_", "").charAt(0) + role.replace("ROLE_", "").slice(1).toLowerCase();
};

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // User bookings
    const [userBookings, setUserBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // Document preview
    const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState({ url: "", title: "" });

    // Filters
    const [roleFilter, setRoleFilter] = useState("all");
    const [verifiedFilter, setVerifiedFilter] = useState("all");

    // Track if initial fetch has been done to prevent double calls
    const hasFetchedRef = useRef(false);

    // Fetch users on component mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch users",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserBookings = async (userId) => {
        setIsLoadingBookings(true);
        try {
            const data = await bookingService.getUserBookings(userId);
            setUserBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Failed to fetch user bookings:", error);
            setUserBookings([]);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleRefresh = () => {
        hasFetchedRef.current = false;
        fetchUsers();
    };

    // Get unique roles for filter
    const uniqueRoles = [...new Set(users.map(user => user.userRole))];

    // Enhanced search and filter
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
        const roleText = formatRole(user.userRole).toLowerCase();
        const verifiedText = user.verified ? "verified" : "unverified";

        const matchesSearch = (
            fullName.includes(query) ||
            (user.phone && user.phone.toLowerCase().includes(query)) ||
            roleText.includes(query) ||
            verifiedText.includes(query) ||
            (user.id && user.id.toString().includes(query))
        );

        const matchesRole = roleFilter === "all" || user.userRole === roleFilter;
        const matchesVerified =
            verifiedFilter === "all" ||
            (verifiedFilter === "verified" && user.verified) ||
            (verifiedFilter === "unverified" && !user.verified);

        return matchesSearch && matchesRole && matchesVerified;
    });

    // Clear all filters
    const clearFilters = () => {
        setRoleFilter("all");
        setVerifiedFilter("all");
        setSearchQuery("");
    };

    const hasActiveFilters = roleFilter !== "all" || verifiedFilter !== "all" || searchQuery !== "";

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await adminService.deleteUser(selectedUser.id);

            toast({
                title: "User Deleted",
                description: `${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`,
                variant: "success",
            });

            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const openViewModal = (user) => {
        setSelectedUser(user);
        setUserBookings([]);
        setIsViewModalOpen(true);
        // Fetch user bookings when modal opens
        if (user.userRole === "ROLE_CUSTOMER") {
            fetchUserBookings(user.id);
        }
    };

    const openDocPreview = (url, title) => {
        setPreviewDoc({ url, title });
        setIsDocPreviewOpen(true);
    };

    // Verification handlers
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyAction, setVerifyAction] = useState("verify"); // "verify" or "unverify"
    const [isVerifying, setIsVerifying] = useState(false);

    const openVerifyModal = (user, action) => {
        setSelectedUser(user);
        setVerifyAction(action);
        setIsVerifyModalOpen(true);
    };

    const handleVerifyUser = async () => {
        setIsVerifying(true);
        try {
            if (verifyAction === "verify") {
                await adminService.verifyUser(selectedUser.id);
                toast({
                    title: "User Verified",
                    description: `${selectedUser.firstName} ${selectedUser.lastName} has been verified successfully.`,
                    variant: "success",
                });
            } else {
                await adminService.unverifyUser(selectedUser.id);
                toast({
                    title: "User Unverified",
                    description: `${selectedUser.firstName} ${selectedUser.lastName} has been unverified.`,
                    variant: "success",
                });
            }
            setIsVerifyModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || error.message || `Failed to ${verifyAction} user`,
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    // Helper to check if user can be verified (only requires both documents)
    const canVerify = (user) => {
        return user.userRole === "ROLE_CUSTOMER" &&
            !user.verified &&
            user.aadhaarUrl &&
            user.licenceUrl;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Users className="h-6 w-6 text-red-500" />
                        Users Management
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage all registered users</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <CardTitle className="text-base text-white">Filters</CardTitle>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                                <X className="h-4 w-4 mr-1" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, phone, role..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>

                        {/* Role Filter */}
                        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {uniqueRoles.map((role) => (
                                    <SelectItem key={role} value={role}>{formatRole(role)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Verified Filter */}
                        <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Verified" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Avatar</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Documents</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Verified</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center">
                                                            {user.image ? (
                                                                <img
                                                                    src={user.image}
                                                                    alt={user.firstName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-white font-bold">
                                                                    {user.firstName?.charAt(0) || "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{user.id}</TableCell>
                                                    <TableCell className="font-medium">
                                                        {user.firstName} {user.lastName}
                                                    </TableCell>
                                                    <TableCell>{user.phone || "-"}</TableCell>
                                                    <TableCell>
                                                        {user.userRole === "ROLE_CUSTOMER" ? (
                                                            <div className="flex items-center gap-2">
                                                                {user.aadhaarUrl ? (
                                                                    <button
                                                                        onClick={() => openDocPreview(user.aadhaarUrl, "Aadhaar Card")}
                                                                        className="group relative w-10 h-10 rounded border border-gray-600 overflow-hidden hover:border-blue-500 transition-colors"
                                                                        title="View Aadhaar"
                                                                    >
                                                                        <img src={user.aadhaarUrl} alt="Aadhaar" className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                            <CreditCard className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded border border-gray-700 flex items-center justify-center bg-gray-800" title="No Aadhaar">
                                                                        <CreditCard className="h-4 w-4 text-gray-500" />
                                                                    </div>
                                                                )}
                                                                {user.licenceUrl ? (
                                                                    <button
                                                                        onClick={() => openDocPreview(user.licenceUrl, "Driving License")}
                                                                        className="group relative w-10 h-10 rounded border border-gray-600 overflow-hidden hover:border-green-500 transition-colors"
                                                                        title="View License"
                                                                    >
                                                                        <img src={user.licenceUrl} alt="License" className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                            <FileText className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded border border-gray-700 flex items-center justify-center bg-gray-800" title="No License">
                                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.userRole] || roleColors.ROLE_CUSTOMER
                                                                }`}
                                                        >
                                                            {formatRole(user.userRole)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.verified ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                                                <XCircle className="h-3 w-3" />
                                                                Unverified
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Verify/Unverify button for customers */}
                                                            {user.userRole === "ROLE_CUSTOMER" && (
                                                                <>
                                                                    {user.verified ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                                                            onClick={() => openVerifyModal(user, "unverify")}
                                                                            title="Unverify User"
                                                                        >
                                                                            <ShieldX className="h-4 w-4" />
                                                                        </Button>
                                                                    ) : canVerify(user) ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            onClick={() => openVerifyModal(user, "verify")}
                                                                            title="Verify User"
                                                                        >
                                                                            <ShieldCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-gray-400 cursor-not-allowed"
                                                                            disabled
                                                                            title="Missing documents - cannot verify"
                                                                        >
                                                                            <AlertTriangle className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openViewModal(user)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => openDeleteModal(user)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to{" "}
                                        {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
                                        {filteredUsers.length} entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={currentPage === page ? "bg-red-500 hover:bg-red-600" : ""}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View Modal - Enhanced with Tabs */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            {/* User Avatar & Name */}
                            <div className="flex items-center gap-4 pb-4 border-b">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center">
                                    {selectedUser.image ? (
                                        <img
                                            src={selectedUser.image}
                                            alt={selectedUser.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-2xl font-bold">
                                            {selectedUser.firstName?.charAt(0) || "U"}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[selectedUser.userRole] || roleColors.ROLE_CUSTOMER
                                                }`}
                                        >
                                            {formatRole(selectedUser.userRole)}
                                        </span>
                                        {selectedUser.verified ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                <CheckCircle className="h-3 w-3" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                                <XCircle className="h-3 w-3" />
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                    <TabsTrigger value="bookings">
                                        Bookings {userBookings.length > 0 && `(${userBookings.length})`}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Profile Tab */}
                                <TabsContent value="profile" className="space-y-3 mt-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">User ID</p>
                                            <p className="font-medium">#{selectedUser.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <Phone className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <p className="font-medium">{formatDate(selectedUser.dob)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <Shield className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <p className="font-medium">{formatRole(selectedUser.userRole)}</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" className="mt-4">
                                    {selectedUser.userRole === "ROLE_CUSTOMER" ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Aadhaar Card */}
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" /> Aadhaar Card
                                                </h4>
                                                {selectedUser.aadhaarUrl ? (
                                                    <div
                                                        className="relative aspect-[3/2] rounded-lg border border-gray-700 overflow-hidden cursor-pointer group"
                                                        onClick={() => openDocPreview(selectedUser.aadhaarUrl, "Aadhaar Card")}
                                                    >
                                                        <img
                                                            src={selectedUser.aadhaarUrl}
                                                            alt="Aadhaar Card"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <ExternalLink className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-[3/2] rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
                                                        <div className="text-center text-gray-500">
                                                            <CreditCard className="h-8 w-8 mx-auto mb-2" />
                                                            <p className="text-sm">Not uploaded</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Driving License */}
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" /> Driving License
                                                </h4>
                                                {selectedUser.licenceUrl ? (
                                                    <div
                                                        className="relative aspect-[3/2] rounded-lg border border-gray-700 overflow-hidden cursor-pointer group"
                                                        onClick={() => openDocPreview(selectedUser.licenceUrl, "Driving License")}
                                                    >
                                                        <img
                                                            src={selectedUser.licenceUrl}
                                                            alt="Driving License"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <ExternalLink className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-[3/2] rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
                                                        <div className="text-center text-gray-500">
                                                            <FileText className="h-8 w-8 mx-auto mb-2" />
                                                            <p className="text-sm">Not uploaded</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Documents not applicable for admin users</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Bookings Tab */}
                                <TabsContent value="bookings" className="mt-4">
                                    {selectedUser.userRole === "ROLE_CUSTOMER" ? (
                                        isLoadingBookings ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                                            </div>
                                        ) : userBookings.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Bike className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No bookings found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                {userBookings.map((booking) => (
                                                    <div
                                                        key={booking.bookingId}
                                                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Bike className="h-4 w-4 text-red-500" />
                                                                <span className="font-medium text-white">
                                                                    {booking.bikeName || `Booking #${booking.bookingId}`}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    booking.bookingStatus === "COMPLETED" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
                                                                        booking.bookingStatus === "ONGOING" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                                            booking.bookingStatus === "CONFIRMED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                                                                "bg-red-500/20 text-red-400 border-red-500/30"
                                                                }
                                                            >
                                                                {booking.bookingStatus}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(booking.pickupTs)}
                                                            </div>
                                                            <div className="text-right font-medium text-white">
                                                                ₹{booking.totalAmount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Bike className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Bookings not applicable for admin users</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            <Dialog open={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{previewDoc.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center">
                        <img
                            src={previewDoc.url}
                            alt={previewDoc.title}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDocPreviewOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => window.open(previewDoc.url, '_blank')}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Full Size
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedUser?.firstName} {selectedUser?.lastName}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verification Confirmation Modal */}
            <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {verifyAction === "verify" ? (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    Verify User
                                </>
                            ) : (
                                <>
                                    <ShieldX className="h-5 w-5 text-yellow-500" />
                                    Unverify User
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {verifyAction === "verify" ? (
                                <>
                                    Are you sure you want to verify <strong>"{selectedUser?.firstName} {selectedUser?.lastName}"</strong>?
                                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                                        <p className="font-medium mb-2">Documents Status:</p>
                                        <ul className="space-y-1">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Profile Photo uploaded
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Aadhaar document uploaded
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Driving License uploaded
                                            </li>
                                        </ul>
                                    </div>
                                    <p className="mt-2 text-green-600 dark:text-green-400">
                                        ✓ Once verified, the user can make bike bookings.
                                    </p>
                                </>
                            ) : (
                                <>
                                    Are you sure you want to unverify <strong>"{selectedUser?.firstName} {selectedUser?.lastName}"</strong>?
                                    <p className="mt-2 text-yellow-600 dark:text-yellow-400">
                                        ⚠ The user will not be able to make new bookings until verified again.
                                    </p>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVerifyModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerifyUser}
                            disabled={isVerifying}
                            className={verifyAction === "verify"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-yellow-600 hover:bg-yellow-700"
                            }
                        >
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {verifyAction === "verify" ? "Verify User" : "Unverify User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

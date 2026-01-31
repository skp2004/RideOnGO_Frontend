import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import adminService from "../../services/adminService";

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
        setIsViewModalOpen(true);
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
                                            <TableHead>Role</TableHead>
                                            <TableHead>Verified</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            {/* User Avatar & Name */}
                            <div className="flex items-center gap-4">
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

                            {/* User Details */}
                            <div className="space-y-3 pt-4 border-t">
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
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
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
        </div>
    );
}

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Tag,
    Loader2,
    RefreshCw,
    Eye,
    Filter,
    X,
    CheckCircle,
    XCircle,
} from "lucide-react";
import adminService from "../../services/adminService";

const ITEMS_PER_PAGE = 5;

export default function BrandsPage() {
    const { toast } = useToast();
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");

    const [formData, setFormData] = useState({
        brandName: "",
        isActive: true,
    });

    // Track if initial fetch has been done to prevent double calls
    const hasFetchedRef = useRef(false);

    // Fetch brands on component mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchBrands();
        }
    }, []);

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getBrands();
            setBrands(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch brands",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        hasFetchedRef.current = false;
        fetchBrands();
    };

    // Enhanced search and filter
    const filteredBrands = brands.filter((brand) => {
        const query = searchQuery.toLowerCase();
        const statusText = brand.isActive ? "active" : "inactive";
        const matchesSearch =
            brand.brandName.toLowerCase().includes(query) ||
            brand.brandId.toString().includes(query) ||
            brand.totalBikes.toString().includes(query) ||
            statusText.includes(query);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && brand.isActive) ||
            (statusFilter === "inactive" && !brand.isActive);

        return matchesSearch && matchesStatus;
    });

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter("all");
        setSearchQuery("");
    };

    const hasActiveFilters = statusFilter !== "all" || searchQuery !== "";

    // Pagination
    const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBrands = filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            brandName: "",
            isActive: true,
        });
    };

    const handleAdd = async () => {
        setIsSubmitting(true);
        try {
            await adminService.createBrand({
                brandName: formData.brandName,
                isActive: formData.isActive,
            });

            toast({
                title: "Brand Added",
                description: `${formData.brandName} has been added successfully.`,
                variant: "success",
            });

            setIsAddModalOpen(false);
            resetForm();
            fetchBrands();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to add brand",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        setIsSubmitting(true);
        try {
            await adminService.updateBrand(selectedBrand.brandId, {
                brandName: formData.brandName,
                isActive: formData.isActive,
            });

            toast({
                title: "Brand Updated",
                description: `${formData.brandName} has been updated successfully.`,
                variant: "success",
            });

            setIsEditModalOpen(false);
            setSelectedBrand(null);
            resetForm();
            fetchBrands();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update brand",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await adminService.deleteBrand(selectedBrand.brandId);

            toast({
                title: "Brand Deleted",
                description: `${selectedBrand.brandName} has been deleted.`,
                variant: "success",
            });

            setIsDeleteModalOpen(false);
            setSelectedBrand(null);
            fetchBrands();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete brand",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openViewModal = (brand) => {
        setSelectedBrand(brand);
        setIsViewModalOpen(true);
    };

    const openEditModal = (brand) => {
        setSelectedBrand(brand);
        setFormData({
            brandName: brand.brandName,
            isActive: brand.isActive,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Tag className="h-6 w-6 text-red-500" />
                        Brands Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage bike brands</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Brand
                    </Button>
                </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search brands..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <CardTitle className="text-white">All Brands ({filteredBrands.length})</CardTitle>
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
                                            <TableHead>ID</TableHead>
                                            <TableHead>Brand Name</TableHead>
                                            <TableHead>Total Bikes</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedBrands.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No brands found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedBrands.map((brand) => (
                                                <TableRow key={brand.brandId}>
                                                    <TableCell className="font-medium">{brand.brandId}</TableCell>
                                                    <TableCell className="font-medium">{brand.brandName}</TableCell>
                                                    <TableCell>{brand.totalBikes}</TableCell>
                                                    <TableCell>
                                                        {brand.isActive ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                                                <XCircle className="h-3 w-3" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openViewModal(brand)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditModal(brand)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => openDeleteModal(brand)}
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
                                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBrands.length)} of {filteredBrands.length} entries
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
                        <DialogTitle>Brand Details</DialogTitle>
                    </DialogHeader>
                    {selectedBrand && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedBrand.brandName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedBrand.brandName}</h3>
                                    {selectedBrand.isActive ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                            <CheckCircle className="h-3 w-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                            <XCircle className="h-3 w-3" />
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-500">Brand ID</p>
                                    <p className="text-xl font-bold text-red-500">#{selectedBrand.brandId}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-500">Total Bikes</p>
                                    <p className="text-xl font-bold text-red-600">{selectedBrand.totalBikes}</p>
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

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Brand</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new brand.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="brandName">Brand Name</Label>
                            <Input
                                id="brandName"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleInputChange}
                                placeholder="e.g. Royal Enfield"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="isActive">Active Status</Label>
                                <p className="text-sm text-gray-500">Enable or disable this brand</p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={isSubmitting || !formData.brandName}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Brand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                        <DialogDescription>
                            Update the brand details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-brandName">Brand Name</Label>
                            <Input
                                id="edit-brandName"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="edit-isActive">Active Status</Label>
                                <p className="text-sm text-gray-500">Enable or disable this brand</p>
                            </div>
                            <Switch
                                id="edit-isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Brand</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedBrand?.brandName}"? This will affect {selectedBrand?.totalBikes} bikes associated with this brand.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

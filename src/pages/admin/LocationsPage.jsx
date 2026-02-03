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
    MapPin,
    Loader2,
    RefreshCw,
    Eye,
    Phone,
    Building,
    Filter,
    X,
    CheckCircle,
    XCircle,
} from "lucide-react";
import adminService from "../../services/adminService";

const ITEMS_PER_PAGE = 5;

export default function LocationsPage() {
    const { toast } = useToast();
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");

    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        pincode: "",
        contactNumber: "",
        active: true,
    });

    // Track if initial fetch has been done to prevent double calls
    const hasFetchedRef = useRef(false);

    // Fetch locations on component mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchLocations();
        }
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getLocations();
            setLocations(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch locations",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        hasFetchedRef.current = false;
        fetchLocations();
    };

    // Get unique values for filters
    const uniqueCities = [...new Set(locations.map(loc => loc.city))];
    const uniqueStates = [...new Set(locations.map(loc => loc.state))];

    // Enhanced search and filter
    const filteredLocations = locations.filter((location) => {
        const query = searchQuery.toLowerCase();
        const statusText = location.isActive ? "active" : "inactive";
        const matchesSearch =
            location.address.toLowerCase().includes(query) ||
            location.city.toLowerCase().includes(query) ||
            location.state.toLowerCase().includes(query) ||
            location.pincode.toString().includes(query) ||
            location.contactNumber.toString().includes(query) ||
            location.id.toString().includes(query) ||
            location.totalBikes.toString().includes(query) ||
            statusText.includes(query);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && location.isActive) ||
            (statusFilter === "inactive" && !location.isActive);

        const matchesCity = cityFilter === "all" || location.city === cityFilter;
        const matchesState = stateFilter === "all" || location.state === stateFilter;

        return matchesSearch && matchesStatus && matchesCity && matchesState;
    });

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter("all");
        setCityFilter("all");
        setStateFilter("all");
        setSearchQuery("");
    };

    const hasActiveFilters = statusFilter !== "all" || cityFilter !== "all" || stateFilter !== "all" || searchQuery !== "";

    // Pagination
    const totalPages = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLocations = filteredLocations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // For contact number, only allow digits and limit to 10
        if (name === 'contactNumber') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
            // For pincode, only allow digits and limit to 6
        } else if (name === 'pincode') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
            setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            address: "",
            city: "",
            state: "",
            pincode: "",
            contactNumber: "",
            active: true,
        });
    };

    const handleAdd = async () => {
        setIsSubmitting(true);
        try {
            await adminService.createLocation({
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                contactNumber: formData.contactNumber,
                isActive: formData.active,
            });

            toast({
                title: "Location Added",
                description: `Location in ${formData.city} has been added successfully.`,
                variant: "success",
            });

            setIsAddModalOpen(false);
            resetForm();
            fetchLocations();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to add location",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        setIsSubmitting(true);
        try {
            await adminService.updateLocation(selectedLocation.id, {
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                contactNumber: formData.contactNumber,
                isActive: formData.active,
            });

            toast({
                title: "Location Updated",
                description: `Location in ${formData.city} has been updated successfully.`,
                variant: "success",
            });

            setIsEditModalOpen(false);
            setSelectedLocation(null);
            resetForm();
            fetchLocations();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update location",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await adminService.deleteLocation(selectedLocation.id);

            toast({
                title: "Location Deleted",
                description: `Location in ${selectedLocation.city} has been deleted.`,
                variant: "success",
            });

            setIsDeleteModalOpen(false);
            setSelectedLocation(null);
            fetchLocations();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete location",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openViewModal = (location) => {
        setSelectedLocation(location);
        setIsViewModalOpen(true);
    };

    const openEditModal = (location) => {
        setSelectedLocation(location);
        setFormData({
            address: location.address,
            city: location.city,
            state: location.state,
            pincode: location.pincode.toString(),
            contactNumber: location.contactNumber,
            active: location.isActive,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (location) => {
        setSelectedLocation(location);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <MapPin className="h-6 w-6 text-red-500" />
                        Locations Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage rental locations</p>
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
                        Add Location
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search locations..."
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

                        {/* City Filter */}
                        <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                {uniqueCities.map((city) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* State Filter */}
                        <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                {uniqueStates.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <CardTitle className="text-white">All Locations ({filteredLocations.length})</CardTitle>
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
                                            <TableHead>City</TableHead>
                                            <TableHead>State</TableHead>
                                            <TableHead>Pincode</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Total Bikes</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedLocations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    No locations found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedLocations.map((location) => (
                                                <TableRow key={location.id}>
                                                    <TableCell className="font-medium">{location.id}</TableCell>
                                                    <TableCell className="font-medium">{location.city}</TableCell>
                                                    <TableCell>{location.state}</TableCell>
                                                    <TableCell>{location.pincode}</TableCell>
                                                    <TableCell>{location.contactNumber}</TableCell>
                                                    <TableCell>{location.totalBikes}</TableCell>
                                                    <TableCell>
                                                        {location.isActive ? (
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
                                                                onClick={() => openViewModal(location)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditModal(location)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => openDeleteModal(location)}
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
                                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredLocations.length)} of {filteredLocations.length} entries
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
                        <DialogTitle>Location Details</DialogTitle>
                    </DialogHeader>
                    {selectedLocation && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center">
                                    <MapPin className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedLocation.city}, {selectedLocation.state}</h3>
                                    {selectedLocation.isActive ? (
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

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <Building className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{selectedLocation.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Pincode</p>
                                        <p className="font-medium">{selectedLocation.pincode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <Phone className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Number</p>
                                        <p className="font-medium">{selectedLocation.contactNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Location ID</p>
                                    <p className="text-lg font-bold text-red-500">#{selectedLocation.id}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Bikes</p>
                                    <p className="text-lg font-bold text-red-600">{selectedLocation.totalBikes}</p>
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
                        <DialogTitle>Add New Location</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new rental location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Maharashtra"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="400001"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                />
                                <p className="text-xs text-gray-500">Enter 6-digit pincode</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                />
                                <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="active">Active Status</Label>
                                <p className="text-sm text-gray-500">Enable or disable this location</p>
                            </div>
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={isSubmitting || !formData.address || !formData.city}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Location
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                        <DialogDescription>
                            Update the location details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-city">City</Label>
                                <Input
                                    id="edit-city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-state">State</Label>
                                <Input
                                    id="edit-state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-pincode">Pincode</Label>
                                <Input
                                    id="edit-pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                />
                                <p className="text-xs text-gray-500">Enter 6-digit pincode</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-contactNumber">Contact Number</Label>
                                <Input
                                    id="edit-contactNumber"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                />
                                <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="edit-active">Active Status</Label>
                                <p className="text-sm text-gray-500">Enable or disable this location</p>
                            </div>
                            <Switch
                                id="edit-active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
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
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the location in {selectedLocation?.city}? This will affect {selectedLocation?.totalBikes} bikes at this location.
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

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useToast } from "@/components/ui/toast";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Bike,
    Loader2,
    RefreshCw,
    Eye,
    Fuel,
    Gauge,
    Palette,
    Filter,
    X,
    Upload,
    ImageIcon,
} from "lucide-react";
import adminService from "../../services/adminService";

const statusColors = {
    AVAILABLE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    RENTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    MAINTENANCE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    UNAVAILABLE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ITEMS_PER_PAGE = 5;

export default function BikesPage() {
    const { toast } = useToast();
    const [bikes, setBikes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [fuelFilter, setFuelFilter] = useState("all");
    const [brandFilter, setBrandFilter] = useState("all");

    const [formData, setFormData] = useState({
        brandId: "",
        locationId: "",
        cc: "",
        colour: "",
        mileage: "",
        ratePerHour: "",
        ratePerDay: "",
        fuelType: "PETROL",
        status: "AVAILABLE",
    });

    // Image file state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Track if initial fetch has been done to prevent double calls
    const hasFetchedRef = useRef(false);
    const hasFetchedDropdownsRef = useRef(false);

    // Fetch only bikes on component mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchBikes();
        }
    }, []);

    const fetchBikes = async () => {
        setIsLoading(true);
        try {
            const bikesData = await adminService.getBikes();
            setBikes(bikesData);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch bikes",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch brands and locations only when needed (for add/edit modals)
    const fetchDropdownData = useCallback(async () => {
        if (hasFetchedDropdownsRef.current) return;

        try {
            const [brandsData, locationsData] = await Promise.all([
                adminService.getBrands(),
                adminService.getLocations(),
            ]);
            setBrands(brandsData);
            setLocations(locationsData);
            hasFetchedDropdownsRef.current = true;
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch dropdown data",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Get unique values for filters
    const uniqueBrands = [...new Set(bikes.map(bike => bike.brandName))];
    const uniqueStatuses = [...new Set(bikes.map(bike => bike.status))];
    const uniqueFuelTypes = [...new Set(bikes.map(bike => bike.fuelType))];

    // Enhanced search and filter
    const filteredBikes = bikes.filter((bike) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            bike.brandName.toLowerCase().includes(query) ||
            bike.colour.toLowerCase().includes(query) ||
            bike.fuelType.toLowerCase().includes(query) ||
            bike.status.toLowerCase().includes(query) ||
            bike.bikeId.toString().includes(query) ||
            bike.cc.toString().includes(query) ||
            bike.mileage.toString().includes(query) ||
            bike.ratePerHour.toString().includes(query) ||
            bike.ratePerDay.toString().includes(query) ||
            (bike.locationCity && bike.locationCity.toLowerCase().includes(query)) ||
            (bike.locationState && bike.locationState.toLowerCase().includes(query));

        const matchesStatus = statusFilter === "all" || bike.status === statusFilter;
        const matchesFuel = fuelFilter === "all" || bike.fuelType === fuelFilter;
        const matchesBrand = brandFilter === "all" || bike.brandName === brandFilter;

        return matchesSearch && matchesStatus && matchesFuel && matchesBrand;
    });

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter("all");
        setFuelFilter("all");
        setBrandFilter("all");
        setSearchQuery("");
    };

    const hasActiveFilters = statusFilter !== "all" || fuelFilter !== "all" || brandFilter !== "all" || searchQuery !== "";

    // Pagination
    const totalPages = Math.ceil(filteredBikes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBikes = filteredBikes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            brandId: "",
            locationId: "",
            cc: "",
            colour: "",
            mileage: "",
            ratePerHour: "",
            ratePerDay: "",
            fuelType: "PETROL",
            status: "AVAILABLE",
        });
        setImageFile(null);
        setImagePreview(null);
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = async () => {
        setIsSubmitting(true);
        try {
            // Create FormData for multipart request
            const formDataToSend = new FormData();

            // Create the data object matching BikeRequestDTO
            const bikeData = {
                brandId: parseInt(formData.brandId),
                locationId: parseInt(formData.locationId),
                cc: parseInt(formData.cc),
                colour: formData.colour,
                mileage: parseInt(formData.mileage),
                ratePerHour: parseFloat(formData.ratePerHour),
                ratePerDay: parseFloat(formData.ratePerDay),
                fuelType: formData.fuelType,
                status: formData.status,
            };

            // Append data as JSON blob
            formDataToSend.append('data', new Blob([JSON.stringify(bikeData)], { type: 'application/json' }));

            // Append image if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            await adminService.createBike(formDataToSend);

            // Get brand name for toast message
            const selectedBrand = brands.find(b => b.brandId === parseInt(formData.brandId));

            toast({
                title: "Bike Added",
                description: `${selectedBrand?.brandName || 'New'} bike has been added successfully.`,
                variant: "success",
            });

            setIsAddModalOpen(false);
            resetForm();
            fetchBikes();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to add bike",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        setIsSubmitting(true);
        try {
            // Create the data object matching BikeRequestDTO
            const bikeData = {
                brandId: parseInt(formData.brandId),
                locationId: parseInt(formData.locationId),
                cc: parseInt(formData.cc),
                colour: formData.colour,
                mileage: parseInt(formData.mileage),
                ratePerHour: parseFloat(formData.ratePerHour),
                ratePerDay: parseFloat(formData.ratePerDay),
                fuelType: formData.fuelType,
                status: formData.status,
            };

            await adminService.updateBike(selectedBike.bikeId, bikeData);

            // Get brand name for toast message
            const selectedBrand = brands.find(b => b.brandId === parseInt(formData.brandId));

            toast({
                title: "Bike Updated",
                description: `${selectedBrand?.brandName || 'Bike'} has been updated successfully.`,
                variant: "success",
            });

            setIsEditModalOpen(false);
            setSelectedBike(null);
            resetForm();
            fetchBikes();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update bike",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await adminService.deleteBike(selectedBike.bikeId);

            toast({
                title: "Bike Deleted",
                description: `${selectedBike.brandName} bike has been deleted.`,
                variant: "success",
            });

            setIsDeleteModalOpen(false);
            setSelectedBike(null);
            fetchBikes();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete bike",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openViewModal = (bike) => {
        setSelectedBike(bike);
        setIsViewModalOpen(true);
    };

    const openAddModal = async () => {
        resetForm();
        await fetchDropdownData();
        setIsAddModalOpen(true);
    };

    const openEditModal = async (bike) => {
        setSelectedBike(bike);

        // Fetch dropdown data first
        try {
            let brandsData = brands;
            let locationsData = locations;

            // Only fetch if not already fetched
            if (!hasFetchedDropdownsRef.current) {
                const [fetchedBrands, fetchedLocations] = await Promise.all([
                    adminService.getBrands(),
                    adminService.getLocations(),
                ]);
                setBrands(fetchedBrands);
                setLocations(fetchedLocations);
                hasFetchedDropdownsRef.current = true;
                brandsData = fetchedBrands;
                locationsData = fetchedLocations;
            }

            // Find the brand by name to get brandId
            const brand = brandsData.find(b => b.brandName === bike.brandName);

            // Find the location by city and state to get locationId
            const location = locationsData.find(l =>
                l.city === bike.locationCity && l.state === bike.locationState
            );

            setFormData({
                brandId: brand?.brandId?.toString() || bike.brandId?.toString() || "",
                locationId: location?.id?.toString() || bike.locationId?.toString() || "",
                cc: bike.cc?.toString() || "",
                colour: bike.colour || "",
                mileage: bike.mileage?.toString() || "",
                ratePerHour: bike.ratePerHour?.toString() || "",
                ratePerDay: bike.ratePerDay?.toString() || "",
                fuelType: bike.fuelType || "PETROL",
                status: bike.status || "AVAILABLE",
            });

            // Set image preview if bike has an image
            if (bike.image) {
                setImagePreview(bike.image);
            } else {
                setImagePreview(null);
            }

            setIsEditModalOpen(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load edit form data",
                variant: "destructive",
            });
        }
    };

    const openDeleteModal = (bike) => {
        setSelectedBike(bike);
        setIsDeleteModalOpen(true);
    };

    const handleRefresh = () => {
        hasFetchedRef.current = false;
        fetchBikes();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Bike className="h-6 w-6 text-red-500" />
                        Bikes Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your bike inventory</p>
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
                        onClick={openAddModal}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bike
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
                                placeholder="Search bikes..."
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
                                {uniqueStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Fuel Type Filter */}
                        <Select value={fuelFilter} onValueChange={(v) => { setFuelFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Fuel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Fuel Types</SelectItem>
                                {uniqueFuelTypes.map((fuel) => (
                                    <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Brand Filter */}
                        <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {uniqueBrands.map((brand) => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <CardTitle className="text-white">All Bikes ({filteredBikes.length})</CardTitle>
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
                                            <TableHead>Image</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>CC</TableHead>
                                            <TableHead>Rate/Hr</TableHead>
                                            <TableHead>Rate/Day</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedBikes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    No bikes found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedBikes.map((bike) => (
                                                <TableRow key={bike.bikeId}>
                                                    <TableCell>
                                                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                            {bike.image ? (
                                                                <img
                                                                    src={bike.image}
                                                                    alt={bike.brandName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Bike className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{bike.bikeId}</TableCell>
                                                    <TableCell className="font-medium">{bike.brandName}</TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {bike.locationCity}, {bike.locationState}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{bike.cc}cc</TableCell>
                                                    <TableCell>₹{bike.ratePerHour}</TableCell>
                                                    <TableCell>₹{bike.ratePerDay}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bike.status] || statusColors.UNAVAILABLE}`}>
                                                            {bike.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openViewModal(bike)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditModal(bike)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => openDeleteModal(bike)}
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
                                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBikes.length)} of {filteredBikes.length} entries
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

            {/* View Modal - Bike Details */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Bike Details</DialogTitle>
                    </DialogHeader>
                    {selectedBike && (
                        <div className="space-y-4 py-4">
                            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {selectedBike.image ? (
                                    <img
                                        src={selectedBike.image}
                                        alt={selectedBike.brandName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Bike className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">{selectedBike.brandName}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedBike.status] || statusColors.UNAVAILABLE}`}>
                                        {selectedBike.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Engine</p>
                                            <p className="font-medium">{selectedBike.cc}cc</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Fuel className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Fuel Type</p>
                                            <p className="font-medium">{selectedBike.fuelType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Colour</p>
                                            <p className="font-medium">{selectedBike.colour}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Mileage</p>
                                            <p className="font-medium">{selectedBike.mileage} km/l</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Rate per Hour</p>
                                        <p className="text-lg font-bold text-red-500">₹{selectedBike.ratePerHour}</p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Rate per Day</p>
                                        <p className="text-lg font-bold text-red-600">₹{selectedBike.ratePerDay}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="font-medium">{selectedBike.locationCity}, {selectedBike.locationState}</p>
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Bike</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new bike to inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="brandId">Brand</Label>
                                <Select value={formData.brandId} onValueChange={(v) => handleSelectChange("brandId", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.filter(b => b.isActive).map((brand) => (
                                            <SelectItem key={brand.brandId} value={brand.brandId.toString()}>
                                                {brand.brandName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="locationId">Location</Label>
                                <Select value={formData.locationId} onValueChange={(v) => handleSelectChange("locationId", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.filter(l => l.active).map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                                {loc.city}, {loc.state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cc">Engine (CC)</Label>
                                <Input
                                    id="cc"
                                    name="cc"
                                    type="number"
                                    value={formData.cc}
                                    onChange={handleInputChange}
                                    placeholder="350"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="colour">Colour</Label>
                                <Input
                                    id="colour"
                                    name="colour"
                                    value={formData.colour}
                                    onChange={handleInputChange}
                                    placeholder="Black"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mileage">Mileage (km/l)</Label>
                                <Input
                                    id="mileage"
                                    name="mileage"
                                    type="number"
                                    value={formData.mileage}
                                    onChange={handleInputChange}
                                    placeholder="35"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fuelType">Fuel Type</Label>
                                <Select value={formData.fuelType} onValueChange={(v) => handleSelectChange("fuelType", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PETROL">Petrol</SelectItem>
                                        <SelectItem value="DIESEL">Diesel</SelectItem>
                                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ratePerHour">Rate per Hour (₹)</Label>
                                <Input
                                    id="ratePerHour"
                                    name="ratePerHour"
                                    type="number"
                                    value={formData.ratePerHour}
                                    onChange={handleInputChange}
                                    placeholder="120"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ratePerDay">Rate per Day (₹)</Label>
                                <Input
                                    id="ratePerDay"
                                    name="ratePerDay"
                                    type="number"
                                    value={formData.ratePerDay}
                                    onChange={handleInputChange}
                                    placeholder="900"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="RENTED">Rented</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Image Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="image">Bike Image</Label>
                            <div className="flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload bike image (optional)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={isSubmitting || !formData.brandId || !formData.locationId}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Bike
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Bike</DialogTitle>
                        <DialogDescription>
                            Update the bike details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-brandId">Brand</Label>
                                <Select value={formData.brandId} onValueChange={(v) => handleSelectChange("brandId", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.brandId} value={brand.brandId.toString()}>
                                                {brand.brandName} {!brand.isActive && "(Inactive)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-locationId">Location</Label>
                                <Select value={formData.locationId} onValueChange={(v) => handleSelectChange("locationId", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                                {loc.city}, {loc.state} {!loc.active && "(Inactive)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-cc">Engine (CC)</Label>
                                <Input
                                    id="edit-cc"
                                    name="cc"
                                    type="number"
                                    value={formData.cc}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-colour">Colour</Label>
                                <Input
                                    id="edit-colour"
                                    name="colour"
                                    value={formData.colour}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-mileage">Mileage (km/l)</Label>
                                <Input
                                    id="edit-mileage"
                                    name="mileage"
                                    type="number"
                                    value={formData.mileage}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-fuelType">Fuel Type</Label>
                                <Select value={formData.fuelType} onValueChange={(v) => handleSelectChange("fuelType", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PETROL">Petrol</SelectItem>
                                        <SelectItem value="DIESEL">Diesel</SelectItem>
                                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-ratePerHour">Rate per Hour (₹)</Label>
                                <Input
                                    id="edit-ratePerHour"
                                    name="ratePerHour"
                                    type="number"
                                    value={formData.ratePerHour}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-ratePerDay">Rate per Day (₹)</Label>
                                <Input
                                    id="edit-ratePerDay"
                                    name="ratePerDay"
                                    type="number"
                                    value={formData.ratePerDay}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="RENTED">Rented</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Image Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">Bike Image</Label>
                            <div className="flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="edit-image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload new bike image (optional)</p>
                                </div>
                            </div>
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
                        <DialogTitle>Delete Bike</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the {selectedBike?.brandName} bike? This action cannot be undone.
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

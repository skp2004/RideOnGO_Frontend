import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Bike,
    Search,
    Fuel,
    Gauge,
    MapPin,
    Loader2,
    RefreshCw,
    Star,
    CircleDot,
    Droplets,
    Shield,
    Phone,
    ArrowRight,
    Check,
    X,
    Filter,
} from "lucide-react";
import adminService from "../services/adminService";
import locationService from "../services/locationService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/toast";

const BikesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const locationId = searchParams.get("locationId");
    const cityName = searchParams.get("city");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDurations, setSelectedDurations] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [bikes, setBikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBike, setSelectedBike] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModalDuration, setSelectedModalDuration] = useState("1 Day");

    const durationOptions = ["1 Day", "7 Days"];
    const categoryOptions = ["COMMUTER", "CRUIZER", "SCOOTER", "SPORT"];
    const modalDurationTabs = ["1 Day", "7 Days"];

    // Fetch bikes from API (all bikes or by location)
    const fetchBikes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let data;
            if (locationId) {
                // Fetch bikes by city
                data = await locationService.getBikesByCity(locationId);
            } else {
                // Fetch all bikes
                data = await adminService.getBikes();
            }
            setBikes(data);
        } catch (err) {
            setError(err.message || "Failed to load bikes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, [locationId]);

    // Get unique brands from bikes
    const brandOptions = useMemo(() => {
        const brands = [...new Set(bikes.map(bike => bike.brandName).filter(Boolean))];
        return brands.sort();
    }, [bikes]);

    // Get max price from bikes
    const maxPrice = useMemo(() => {
        if (bikes.length === 0) return 5000;
        const max = Math.max(...bikes.map(b => b.ratePerDay || 0));
        return Math.ceil(max / 100) * 100 || 5000;
    }, [bikes]);

    // Update price range when max price changes
    useEffect(() => {
        setPriceRange([0, maxPrice]);
    }, [maxPrice]);

    // Toggle selection helper
    const toggleSelection = (item, selected, setSelected) => {
        if (selected.includes(item)) {
            setSelected(selected.filter(i => i !== item));
        } else {
            setSelected([...selected, item]);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedDurations([]);
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, maxPrice]);
        setSearchTerm("");
    };

    // Check if any filter is active
    const hasActiveFilters = selectedDurations.length > 0 ||
        selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < maxPrice ||
        searchTerm !== "";

    const filteredBikes = bikes.filter((bike) => {
        const matchesSearch =
            bike.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.colour?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.locationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.locationState?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(bike.category);

        const matchesBrand =
            selectedBrands.length === 0 || selectedBrands.includes(bike.brandName);

        const matchesPrice =
            (bike.ratePerDay || 0) >= priceRange[0] && (bike.ratePerDay || 0) <= priceRange[1];

        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Get price based on duration
    const getPriceForDuration = (bike, duration) => {
        if (!bike) return 0;
        switch (duration) {
            case "1 Day":
                return bike.ratePerDay || 0;
            case "7 Days": {
                const weeklyPrice = bike.pricePer7Days || bike.ratePerDay * 7;
                // Apply 10% discount for weekly
                return Math.round(weeklyPrice * 0.9);
            }
            default:
                return bike.ratePerDay || 0;
        }
    };

    // Get original price (without discount)
    const getOriginalPrice = (bike, duration) => {
        if (!bike) return 0;
        if (duration === "7 Days") {
            return bike.pricePer7Days || bike.ratePerDay * 7;
        }
        return bike.ratePerDay || 0;
    };

    // Get category description
    const getCategoryDescription = (category) => {
        switch (category) {
            case "COMMUTER":
                return {
                    title: "Ideal for: City Commuters",
                    desc: "Daily office rides, short trips, traffic navigation. Features: Lightweight, fuel-efficient, low displacement (100-125cc), automatic or semi-automatic."
                };
            case "SPORT":
                return {
                    title: "Ideal for: Speed Enthusiasts",
                    desc: "Racing, highway cruising, weekend rides. Features: High performance, aggressive styling, powerful engine."
                };
            case "CRUIZER":
                return {
                    title: "Ideal for: Long Distance Touring",
                    desc: "Highway trips, touring, relaxed riding. Features: Comfortable seating, large fuel tank, smooth ride."
                };
            case "SCOOTER":
                return {
                    title: "Ideal for: City Commuters",
                    desc: "Daily office rides, short trips, traffic navigation. Features: Lightweight, fuel-efficient, automatic transmission."
                };
            default:
                return {
                    title: "Ideal for: All Riders",
                    desc: "Versatile bike suitable for various riding conditions and purposes."
                };
        }
    };

    const handleOpenModal = (bike) => {
        setSelectedBike(bike);
        setSelectedModalDuration("1 Day");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBike(null);
    };

    // Handle Book Now click with login check
    const handleBookNow = () => {
        // Check if user is logged in
        if (!isAuthenticated) {
            toast({
                title: "Login Required",
                description: "Please login to book a bike",
                variant: "destructive"
            });
            // Navigate to login with redirect back to bikes page
            navigate("/login", {
                state: {
                    from: "/bikes",
                    redirectToBooking: true,
                    bikeData: selectedBike,
                    duration: selectedModalDuration
                }
            });
            handleCloseModal();
            return;
        }

        // User is authenticated, proceed to booking
        navigate("/booking", {
            state: {
                bike: selectedBike,
                duration: selectedModalDuration
            }
        });
        handleCloseModal();
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "RENTED":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "MAINTENANCE":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    // Filter pill component
    const FilterPill = ({ label, isSelected, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                ? "bg-red-500 text-white shadow-md"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in bg-gray-950 min-h-screen">
            {/* Header Section */}
            <section className="py-12 bg-gradient-to-br from-red-500/10 via-gray-900 to-red-500/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl font-bold mb-4 text-white">
                            {cityName ? (
                                <>
                                    Bikes in
                                    <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                        {" "}{cityName}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Find Your Perfect
                                    <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                        {" "}Ride
                                    </span>
                                </>
                            )}
                        </h1>
                        <p className="text-gray-400 text-lg">
                            {cityName
                                ? `Browse available bikes for rent in ${cityName}. Choose from our premium selection.`
                                : "Browse our collection of premium bikes. From city cruisers to mountain explorers, we have the perfect ride for every adventure."
                            }
                        </p>
                        {cityName && (
                            <Button
                                onClick={() => navigate("/bikes")}
                                variant="outline"
                                className="mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                                <X className="h-4 w-4 mr-2" />
                                View All Bikes
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content with Sidebar */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-80 shrink-0">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl sticky top-24">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                                        <Filter className="h-5 w-5 text-red-500" />
                                        Filters
                                    </h2>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search bikes..."
                                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Duration Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                                        Duration
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {durationOptions.map((duration) => (
                                            <FilterPill
                                                key={duration}
                                                label={duration}
                                                isSelected={selectedDurations.includes(duration)}
                                                onClick={() => toggleSelection(duration, selectedDurations, setSelectedDurations)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                                        Category
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryOptions.map((category) => (
                                            <FilterPill
                                                key={category}
                                                label={category.charAt(0) + category.slice(1).toLowerCase()}
                                                isSelected={selectedCategories.includes(category)}
                                                onClick={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Brand Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                                        Brand
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {brandOptions.map((brand) => (
                                            <FilterPill
                                                key={brand}
                                                label={brand}
                                                isSelected={selectedBrands.includes(brand)}
                                                onClick={() => toggleSelection(brand, selectedBrands, setSelectedBrands)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                                        Price Range (Per Day)
                                    </h3>
                                    <div className="px-2">
                                        <Slider
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            max={maxPrice}
                                            min={0}
                                            step={50}
                                            className="mb-4"
                                        />
                                        <div className="flex justify-between text-sm text-gray-400">
                                            <span>₹{priceRange[0]}</span>
                                            <span>₹{priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Bikes Grid */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-gray-400">
                                    Showing <span className="font-semibold text-white">{filteredBikes.length}</span> bikes
                                </p>
                                <Button variant="ghost" size="sm" className="gap-2 text-gray-300 hover:text-white hover:bg-gray-800" onClick={fetchBikes}>
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                                </div>
                            ) : error ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-semibold mb-2">Error loading bikes</h3>
                                    <p className="text-muted-foreground mb-4">{error}</p>
                                    <Button onClick={fetchBikes}>Try Again</Button>
                                </div>
                            ) : filteredBikes.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold mb-2">No bikes found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Try adjusting your filters
                                    </p>
                                    <Button onClick={clearFilters}>Clear Filters</Button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredBikes.map((bike) => (
                                        <Card
                                            key={bike.bikeId}
                                            className={`group overflow-hidden bg-gray-900 border-gray-800 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-500/30 transition-all duration-300 ${bike.status !== "AVAILABLE" ? "opacity-75" : ""}`}
                                        >
                                            {/* Bike Image */}
                                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-48 overflow-hidden flex items-center justify-center p-4">
                                                {bike.image ? (
                                                    <img
                                                        src={bike.image}
                                                        alt={bike.brandName}
                                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="text-6xl">🏍️</div>
                                                )}
                                                {bike.status !== "AVAILABLE" && (
                                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bike.status)}`}>
                                                            {bike.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <CardContent className="p-4">
                                                {/* Title and Category */}
                                                <div className="text-center mb-4">
                                                    <h3 className="font-bold text-lg text-white">{bike.brandName}</h3>
                                                    <p className="text-sm text-muted-foreground">{bike.category || "Scooter"}</p>
                                                </div>

                                                {/* Duration Pricing Tabs */}
                                                <div className="flex justify-center gap-2 mb-4">
                                                    <div className="text-center px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                        <p className="text-xs text-muted-foreground">1 Day</p>
                                                        <p className="font-bold text-red-500">₹{bike.ratePerDay}</p>
                                                    </div>
                                                    <div className="text-center px-3 py-2 rounded-lg bg-green-900/20 border border-green-700 relative">
                                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">10% OFF</span>
                                                        <p className="text-xs text-gray-400">7 Days</p>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-500 line-through">₹{bike.pricePer7Days || bike.ratePerDay * 7}</span>
                                                            <p className="font-bold text-green-400">₹{Math.round((bike.pricePer7Days || bike.ratePerDay * 7) * 0.9)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Free KMs and Excess KM Rate */}
                                                <p className="text-center text-xs text-muted-foreground">
                                                    {bike.freeKms || 146} km free /day • Excess km ₹{bike.excessKmRate || 3.5}/km
                                                </p>
                                            </CardContent>

                                            <CardFooter className="p-4 pt-0">
                                                <Button
                                                    className="w-full bg-red-500 hover:bg-red-600 text-white gap-2"
                                                    onClick={() => handleOpenModal(bike)}
                                                    disabled={bike.status !== "AVAILABLE"}
                                                >
                                                    {bike.status === "AVAILABLE" ? (
                                                        <>
                                                            Check Availability
                                                            <ArrowRight className="h-4 w-4" />
                                                        </>
                                                    ) : (
                                                        "Currently Unavailable"
                                                    )}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gray-900 border-gray-800">
                    {selectedBike && (
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Left Section - Bike Info */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6">
                                {/* Bike Header with Name and Rating */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {selectedBike.brandName}
                                        </h2>
                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {selectedBike.locationCity}, {selectedBike.locationState}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg shadow-sm border border-gray-700">
                                        <Star className="h-4 w-4 text-red-400 fill-red-400" />
                                        <span className="font-semibold text-white">
                                            {selectedBike.rating || "4.5"}
                                        </span>
                                    </div>
                                </div>

                                {/* Bike Image */}
                                <div className="relative h-48 mb-6 flex items-center justify-center">
                                    {selectedBike.image ? (
                                        <img
                                            src={selectedBike.image}
                                            alt={selectedBike.brandName}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-8xl">🏍️</div>
                                    )}
                                </div>

                                {/* Specs Row */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                            <Gauge className="h-5 w-5 text-red-500" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Engine</p>
                                        <p className="font-semibold text-sm text-red-600">{selectedBike.cc} cc</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-gray-800">
                                            <CircleDot className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-400">Brakes</p>
                                        <p className="font-semibold text-sm text-gray-300">{selectedBike.brakes || "Drum, SBT"}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-green-900/30">
                                            <Fuel className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="text-xs text-gray-400">Mileage</p>
                                        <p className="font-semibold text-sm text-green-500">{selectedBike.mileage} km/l</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-red-900/30">
                                            <Droplets className="h-5 w-5 text-red-500" />
                                        </div>
                                        <p className="text-xs text-gray-400">Tank</p>
                                        <p className="font-semibold text-sm text-red-500">{selectedBike.tankCapacity || "5.1"} L</p>
                                    </div>
                                </div>

                                {/* Category Info */}
                                <div className="border-t border-gray-700 pt-4">
                                    <h4 className="font-semibold text-white mb-2">
                                        {getCategoryDescription(selectedBike.category).title}
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {getCategoryDescription(selectedBike.category).desc}
                                    </p>
                                </div>
                            </div>

                            {/* Right Section - Pricing & Details */}
                            <div className="p-6 bg-gray-900">
                                {/* Duration Tabs */}
                                <div className="flex border-b border-gray-700 mb-6">
                                    {modalDurationTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedModalDuration(tab)}
                                            className={`flex-1 py-3 text-sm font-medium transition-all ${selectedModalDuration === tab
                                                ? "text-red-500 border-b-2 border-red-500"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Price Info */}
                                <div className="mb-6">
                                    <p className="text-sm text-muted-foreground mb-3">Price</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="text-center p-3 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                            <p className="text-xs text-muted-foreground mb-1">Base price</p>
                                            <p className="text-lg font-bold text-red-500">₹{getPriceForDuration(selectedBike, selectedModalDuration)}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg border border-gray-700 bg-gray-800">
                                            <p className="text-xs text-gray-400 mb-1">Deposit</p>
                                            <p className="text-lg font-bold text-green-500">₹{selectedBike.deposit || 0}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg border border-gray-700 bg-gray-800">
                                            <p className="text-xs text-gray-400 mb-1">Free kms</p>
                                            <p className="text-lg font-bold text-white">{selectedBike.freeKms || 4}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg border border-gray-700 bg-gray-800">
                                            <p className="text-xs text-gray-400 mb-1">Excess kms</p>
                                            <p className="text-lg font-bold text-white">₹{selectedBike.excessKmRate || 3.5}/km</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inclusions */}
                                <div className="mb-6">
                                    <p className="text-sm text-gray-400 mb-3">Inclusions & add-ons</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800">
                                            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-white">1 Helmet</p>
                                                <p className="text-xs text-gray-400">Add a second helmet at checkout</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800">
                                            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                                                <Phone className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-white">Phone mount,</p>
                                                <p className="text-xs text-gray-400">bungee/luggage straps</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Why this bike section */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-white mb-3">
                                        Why {selectedBike.brandName} for {selectedBike.locationCity}
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-gray-400">
                                            <Check className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span>Powerful {selectedBike.cc} cc engine ensures effortless rides in both traffic and open roads.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-400">
                                            <Check className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span>Delivers an impressive mileage of around {selectedBike.mileage} km/l, making it ideal for daily commuting.</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-400">
                                            <Check className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span>Equipped with reliable {selectedBike.brakes || "Drum, SBT"} braking system, ensuring safe control in city conditions.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Check Availability Button */}
                                <Button
                                    onClick={handleBookNow}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-semibold gap-2"
                                >
                                    {isAuthenticated ? "Book Now" : "Login to Book"}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BikesPage;

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2 } from "lucide-react";
import locationService from "@/services/locationService";

// City images mapping - you can replace with actual city images
const cityImages = {
    "Ahmedabad": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=100&h=100&fit=crop",
    "Bengaluru": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&h=100&fit=crop",
    "Bhopal": "https://images.unsplash.com/photo-1590060292985-9bcdeb40d9c7?w=100&h=100&fit=crop",
    "Bhubaneswar": "https://images.unsplash.com/photo-1590058823826-aee9c28e7fcc?w=100&h=100&fit=crop",
    "Chennai": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop",
    "Cuttack": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&h=100&fit=crop",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100&h=100&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1572445271230-a78b5752d02f?w=100&h=100&fit=crop",
    "Indore": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&h=100&fit=crop",
    "Jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=100&h=100&fit=crop",
    "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?w=100&h=100&fit=crop",
    "Kota": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=100&h=100&fit=crop",
    "Mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&h=100&fit=crop",
    "Mysuru": "https://images.unsplash.com/photo-1600100397608-e6a5c8a8e571?w=100&h=100&fit=crop",
    "Pune": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=100&h=100&fit=crop",
    "Rourkela": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    "Rishikesh": "https://images.unsplash.com/photo-1600085965459-2b7b1cf7d93c?w=100&h=100&fit=crop",
    "Tirupati": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop",
};

// Default fallback image
const defaultCityImage = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop";

export default function FleetAndPriceModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchCities();
        }
    }, [isOpen]);

    const fetchCities = async () => {
        setIsLoading(true);
        try {
            const data = await locationService.getCities();
            setCities(data);
        } catch (error) {
            console.error("Failed to fetch cities:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique cities with their first locationId
    const uniqueCities = useMemo(() => {
        const cityMap = new Map();
        cities.forEach((item) => {
            if (!cityMap.has(item.city)) {
                cityMap.set(item.city, item.locationId);
            }
        });
        return Array.from(cityMap, ([city, locationId]) => ({ city, locationId }));
    }, [cities]);

    // Filter cities based on search
    const filteredCities = useMemo(() => {
        if (!searchQuery) return uniqueCities;
        return uniqueCities.filter((item) =>
            item.city.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [uniqueCities, searchQuery]);

    const handleCityClick = (locationId, cityName) => {
        onClose();
        navigate(`/bikes?locationId=${locationId}&city=${encodeURIComponent(cityName)}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        Select Your City
                    </DialogTitle>
                </DialogHeader>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Cities Grid */}
                <div className="overflow-y-auto max-h-[50vh] pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                        </div>
                    ) : filteredCities.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No cities found
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-4">
                            {filteredCities.map((item) => (
                                <button
                                    key={`${item.city}-${item.locationId}`}
                                    onClick={() => handleCityClick(item.locationId, item.city)}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-red-500 transition-all shadow-md">
                                        <img
                                            src={cityImages[item.city] || defaultCityImage}
                                            alt={item.city}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = defaultCityImage;
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors">
                                        {item.city}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

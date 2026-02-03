import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Bike,
    Shield,
    Clock,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Zap,
    Loader2,
    Users,
    CalendarCheck,
    Star,
    Quote,
} from "lucide-react";
import adminService from "../services/adminService";
import reviewService from "../services/reviewService";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
    const [bikes, setBikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBikes: 0,
        totalLocations: 0,
        totalBookings: 0,
        rating: "4.9"
    });
    const [reviews, setReviews] = useState([]);
    const { user } = useAuth();

    const features = [
        {
            icon: Bike,
            title: "Premium Bikes",
            description: "Wide range of well-maintained bikes for every need",
        },
        {
            icon: Shield,
            title: "Safe & Insured",
            description: "All rentals come with comprehensive insurance coverage",
        },
        {
            icon: Clock,
            title: "24/7 Support",
            description: "Round-the-clock customer support for your convenience",
        },
        {
            icon: MapPin,
            title: "Multiple Locations",
            description: "Convenient pickup points across the city",
        },
    ];

    // Fetch featured bikes and stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bikes
                const bikesData = await adminService.getBikes();
                const availableBikes = bikesData.filter(bike => bike.status === "AVAILABLE").slice(0, 4);
                setBikes(availableBikes);

                // Fetch locations for stats
                const locationsData = await adminService.getLocations();

                // Update stats with real data
                setStats({
                    totalBikes: bikesData.length,
                    totalLocations: locationsData.length,
                    totalBookings: "100+", // Placeholder - would need bookings count API
                    rating: "4.9"
                });

                // Fetch reviews
                try {
                    const reviewsData = await reviewService.getAllReviews();
                    setReviews(reviewsData.slice(0, 6)); // Show max 6 reviews
                } catch (err) {
                    console.error("Failed to fetch reviews:", err);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-500/5 to-black animate-gradient" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                                <Zap className="h-4 w-4" />
                                #1 Bike Rental Service in City
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                                Ride the City
                                <span className="block bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                    Your Way
                                </span>
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-lg">
                                Experience freedom on two wheels. Rent premium bikes at
                                affordable prices and explore the city like never before.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/bikes">
                                    <Button size="lg" className="text-lg px-8">
                                        Browse Bikes
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button variant="outline" size="lg" className="text-lg px-8">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {stats.totalBikes}+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Bikes Available
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {stats.totalLocations}+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Pickup Points
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {stats.rating}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        User Rating
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="text-[200px] leading-none text-center animate-pulse">
                                🚴
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We provide the best bike rental experience with top-notch service
                            and premium quality bikes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="border-border/50 bg-card hover:-translate-y-2 hover:border-primary/50 transition-all duration-300"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Bikes Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">Featured Bikes</h2>
                            <p className="text-muted-foreground">
                                Explore our collection of premium bikes
                            </p>
                        </div>
                        <Link to="/bikes">
                            <Button variant="outline">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                        </div>
                    ) : bikes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No bikes available at the moment</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {bikes.map((bike) => (
                                <Card
                                    key={bike.bikeId}
                                    className="group overflow-hidden hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50 transition-all duration-300 bg-card border-border/50"
                                >
                                    <div className="relative bg-gradient-to-br from-muted to-muted/50 h-48 overflow-hidden">
                                        {bike.image ? (
                                            <img
                                                src={bike.image}
                                                alt={bike.brandName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                                                🏍️
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{bike.brandName}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {bike.locationCity}, {bike.locationState}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bike.status)}`}>
                                                {bike.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {bike.cc}cc
                                            </span>
                                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {bike.fuelType}
                                            </span>
                                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {bike.colour}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                        <div>
                                            <span className="text-2xl font-bold text-primary">
                                                ₹{bike.ratePerDay}
                                            </span>
                                            <span className="text-muted-foreground text-sm">/day</span>
                                        </div>
                                        <Link to="/bikes">
                                            <Button size="sm">Book Now</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Customer Reviews Section */}
            {reviews.length > 0 && (
                <section className="py-20 bg-gradient-to-b from-black via-gray-900/50 to-black">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium mb-4">
                                Testimonials
                            </span>
                            <h2 className="text-4xl font-bold mb-4 text-white">
                                What Our Riders Say
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Real experiences from our satisfied customers who love riding with us.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300 group"
                                >
                                    {/* Quote Icon */}
                                    <div className="absolute -top-3 -left-3 p-2 bg-red-500 rounded-full">
                                        <Quote className="h-4 w-4 text-white" />
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-5 w-5 ${star <= review.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-600"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Review Comment */}
                                    <p className="text-gray-300 mb-4 leading-relaxed line-clamp-4">
                                        "{review.comments || 'Great experience renting from RideOnGo!'}"
                                    </p>

                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-700/50">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                                            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {review.userName || `User #${review.userId}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Verified Rider
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decorative gradient */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-red-600 p-12 text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-4xl font-bold mb-4">
                                Ready to Start Your Ride?
                            </h2>
                            <p className="text-lg opacity-90 mb-8">
                                Join thousands of happy riders. Get your first ride with 20%
                                off using code FIRSTRIDE.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/bikes">
                                    <Button
                                        size="lg"
                                        className="bg-white text-red-500 hover:bg-white/90"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <CheckCircle2 key={i} className="h-5 w-5" />
                                    ))}
                                    <span className="text-sm">No hidden charges</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;

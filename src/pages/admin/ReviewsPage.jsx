import React, { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/toast";
import {
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    RefreshCw,
    Star,
    MessageSquare,
    Filter,
    X,
    Bike,
    User,
    Calendar,
} from "lucide-react";
import reviewService from "../../services/reviewService";
import adminService from "../../services/adminService";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function ReviewsPage() {
    const { addToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ratingFilter, setRatingFilter] = useState("all");

    // Fetch reviews and bikes
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reviewsData, bikesData] = await Promise.all([
                reviewService.getAllReviews(),
                adminService.getBikes(),
            ]);
            setReviews(reviewsData);
            setBikes(bikesData);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            addToast({
                title: "Error",
                description: "Failed to fetch reviews",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get bike name by ID
    const getBikeName = (bikeId) => {
        const bike = bikes.find((b) => b.bikeId === bikeId);
        return bike ? `${bike.brandName} ${bike.modelName}` : `Bike #${bikeId}`;
    };

    // Filter reviews
    const filteredReviews = reviews.filter((review) => {
        const bikeName = getBikeName(review.bikeId).toLowerCase();
        const matchesSearch =
            bikeName.includes(searchTerm.toLowerCase()) ||
            (review.comments && review.comments.toLowerCase().includes(searchTerm.toLowerCase())) ||
            review.userId.toString().includes(searchTerm);

        const matchesRating =
            ratingFilter === "all" || review.rating.toString() === ratingFilter;

        return matchesSearch && matchesRating;
    });

    // Pagination
    const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setRatingFilter("all");
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || ratingFilter !== "all";

    // Calculate stats
    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

    // Render star rating
    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600"
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Reviews Management</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage customer reviews
                    </p>
                </div>
                <Button
                    onClick={fetchData}
                    variant="outline"
                    className="border-gray-700"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Total Reviews
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{reviews.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{avgRating}</span>
                            <span className="text-gray-400">/ 5</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            5-Star Reviews
                        </CardTitle>
                        <Star className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {reviews.filter((r) => r.rating === 5).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by bike, comment, or user ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 bg-gray-800/50 border-gray-700"
                            />
                        </div>

                        <Select
                            value={ratingFilter}
                            onValueChange={(value) => {
                                setRatingFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[150px] bg-gray-800/50 border-gray-700">
                                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <MessageSquare className="h-12 w-12 mb-4" />
                            <p className="text-lg font-medium">No reviews found</p>
                            <p className="text-sm">
                                {hasActiveFilters
                                    ? "Try adjusting your filters"
                                    : "Reviews will appear here when customers submit them"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                                        <TableHead className="text-gray-400">User</TableHead>
                                        <TableHead className="text-gray-400">Bike</TableHead>
                                        <TableHead className="text-gray-400">Rating</TableHead>
                                        <TableHead className="text-gray-400">Comment</TableHead>
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedReviews.map((review) => (
                                        <TableRow
                                            key={review.id}
                                            className="border-gray-700 hover:bg-gray-800/30"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                                                        U
                                                    </div>
                                                    <span className="text-white">
                                                        User #{review.userId}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Bike className="h-4 w-4 text-gray-400" />
                                                    <span className="text-white">
                                                        {getBikeName(review.bikeId)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{renderStars(review.rating)}</TableCell>
                                            <TableCell>
                                                <p className="text-gray-300 max-w-xs truncate">
                                                    {review.comments || "No comment provided"}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-gray-400 text-sm">
                                                    {review.createdAt
                                                        ? format(new Date(review.createdAt), "MMM d, yyyy")
                                                        : "N/A"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredReviews.length)} of{" "}
                                {filteredReviews.length} reviews
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    disabled={currentPage === 1}
                                    className="border-gray-700"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={currentPage === totalPages}
                                    className="border-gray-700"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Review Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-white">Review Details</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg font-bold">
                                    U
                                </div>
                                <div>
                                    <p className="font-medium text-white">User #{selectedReview.userId}</p>
                                    <p className="text-sm text-gray-400">Verified Customer</p>
                                </div>
                            </div>

                            {/* Bike Info */}
                            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                <Bike className="h-5 w-5 text-red-500" />
                                <span className="text-white">{getBikeName(selectedReview.bikeId)}</span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Rating:</span>
                                <div className="flex gap-1">
                                    {renderStars(selectedReview.rating)}
                                </div>
                                <span className="text-white font-medium">
                                    {selectedReview.rating}/5
                                </span>
                            </div>

                            {/* Comment */}
                            <div>
                                <span className="text-gray-400 text-sm">Comment:</span>
                                <p className="mt-2 p-4 bg-gray-800/30 rounded-lg text-gray-300 leading-relaxed">
                                    "{selectedReview.comments || 'No comment provided'}"
                                </p>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {selectedReview.createdAt
                                        ? format(new Date(selectedReview.createdAt), "MMMM d, yyyy 'at' h:mm a")
                                        : "Date not available"}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowViewModal(false)}
                            className="border-gray-700"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

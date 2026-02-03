import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    Camera,
    LogOut,
    Edit2,
    Check,
    X,
    Bike,
    CreditCard,
    Settings,
    ChevronRight,
    Loader2,
    AlertCircle,
    Upload,
    Eye,
    FileText,
    ExternalLink,
    Star,
    MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import bookingService from "../services/bookingService";
import reviewService from "../services/reviewService";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isLoading, refreshUser } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // File upload refs
    const profileImageInputRef = useRef(null);
    const aadhaarInputRef = useRef(null);
    const licenseInputRef = useRef(null);

    // Upload state
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);
    const [isUploadingLicense, setIsUploadingLicense] = useState(false);

    // Document preview modal
    const [previewDoc, setPreviewDoc] = useState({ url: "", title: "", isOpen: false });

    // Review modal state
    const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });
    const [reviewForm, setReviewForm] = useState({ rating: 5, comments: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        if (user) {
            setEditedUser({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            });
        }
    }, [user]);

    // Fetch bookings when bookings tab is active
    useEffect(() => {
        const fetchBookings = async () => {
            if (activeTab === "bookings" && user?.id && bookings.length === 0) {
                setIsLoadingBookings(true);
                try {
                    const data = await bookingService.getUserBookings(user.id);
                    setBookings(data || []);
                } catch (error) {
                    console.error("Failed to fetch bookings:", error);
                    toast({
                        title: "Error",
                        description: "Failed to load bookings",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoadingBookings(false);
                }
            }
        };
        fetchBookings();
    }, [activeTab, user?.id]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await authService.updateProfile({
                firstName: editedUser.firstName,
                lastName: editedUser.lastName,
                email: editedUser.email,
                phone: editedUser.phone,
                dob: editedUser.dob,
            });
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });
            // Refresh user data in context
            if (refreshUser) {
                await refreshUser();
            }
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedUser({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
        setIsEditing(false);
    };

    // Handle profile image upload
    const handleProfileImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File",
                description: "Please select an image file.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingProfile(true);
        try {
            await authService.uploadProfileImage(file);
            toast({
                title: "Profile Image Updated",
                description: "Your profile picture has been updated successfully.",
            });
            if (refreshUser) {
                await refreshUser();
            }
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload profile image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingProfile(false);
            // Reset the input
            if (profileImageInputRef.current) {
                profileImageInputRef.current.value = "";
            }
        }
    };

    // Handle Aadhaar upload
    const handleAadhaarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File",
                description: "Please select an image file.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingAadhaar(true);
        try {
            await authService.uploadDocuments(file, null);
            toast({
                title: "Aadhaar Uploaded",
                description: "Your Aadhaar card has been uploaded successfully.",
            });
            if (refreshUser) {
                await refreshUser();
            }
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload Aadhaar. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingAadhaar(false);
            if (aadhaarInputRef.current) {
                aadhaarInputRef.current.value = "";
            }
        }
    };

    // Handle License upload
    const handleLicenseUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File",
                description: "Please select an image file.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingLicense(true);
        try {
            await authService.uploadDocuments(null, file);
            toast({
                title: "License Uploaded",
                description: "Your driving license has been uploaded successfully.",
            });
            if (refreshUser) {
                await refreshUser();
            }
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload license. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingLicense(false);
            if (licenseInputRef.current) {
                licenseInputRef.current.value = "";
            }
        }
    };

    // Open document preview
    const openDocPreview = (url, title) => {
        setPreviewDoc({ url, title, isOpen: true });
    };

    // Close document preview
    const closeDocPreview = () => {
        setPreviewDoc({ url: "", title: "", isOpen: false });
    };

    // Handle review submission
    const handleSubmitReview = async () => {
        if (!reviewModal.booking) return;

        setIsSubmittingReview(true);
        try {
            await reviewService.addReview({
                rating: reviewForm.rating,
                comments: reviewForm.comments,
                bikeId: reviewModal.booking.bikeId,
            });
            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            });
            setReviewModal({ isOpen: false, booking: null });
            setReviewForm({ rating: 5, comments: "" });
        } catch (error) {
            console.error("Failed to submit review:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit review. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const menuItems = [
        { id: "profile", label: "My Profile", icon: User },
        { id: "bookings", label: "My Bookings", icon: Bike },
        { id: "payments", label: "Payment Methods", icon: CreditCard },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    // Get role badge style
    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "USER":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    // Get verification status badge
    const getVerificationBadge = (isVerified) => {
        if (isVerified) {
            return (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Verified
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="animate-fade-in min-h-screen bg-black">
            {/* Header Section */}
            <section className="relative py-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-background to-red-500/5" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                            My Profile
                        </span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar - Profile Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 bg-gray-900/50 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                                <CardContent className="p-6">
                                    {/* Profile Image */}
                                    <div className="relative mx-auto w-32 h-32 mb-4">
                                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-red-200 dark:border-red-800">
                                            {user?.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                                    <span className="text-4xl font-bold text-white">
                                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={profileImageInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleProfileImageUpload}
                                        />
                                        <button
                                            onClick={() => profileImageInputRef.current?.click()}
                                            disabled={isUploadingProfile}
                                            className="absolute bottom-0 right-0 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {isUploadingProfile ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* User Info */}
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-white">
                                            {user?.firstName} {user?.lastName}
                                        </h2>
                                        <p className="text-gray-400 text-sm">{user?.email}</p>
                                        <div className="flex justify-center gap-2 mt-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user?.role)}`}>
                                                {user?.role}
                                            </span>
                                            {getVerificationBadge(user?.isVerified)}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <nav className="space-y-2">
                                        <button
                                            onClick={() => setActiveTab("profile")}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === "profile"
                                                ? "bg-red-500/20 text-red-500 border border-red-500/30"
                                                : "hover:bg-gray-800 text-gray-300 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5" />
                                                <span className="font-medium">My Profile</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => navigate("/my-bookings")}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-300 hover:text-white"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bike className="h-5 w-5" />
                                                <span className="font-medium">My Bookings</span>
                                            </div>
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </nav>

                                    {/* Logout Button */}
                                    <Button
                                        variant="destructive"
                                        className="w-full mt-6"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            {activeTab === "profile" && (
                                <Card className="bg-gray-900/50 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-red-500/20">
                                        <CardTitle className="text-white">Personal Information</CardTitle>
                                        {!isEditing ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditing(true)}
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-red-500 hover:bg-red-600">
                                                    {isSaving ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="mr-2 h-4 w-4" />
                                                    )}
                                                    {isSaving ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-8 pt-6">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* First Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    First Name
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedUser.firstName}
                                                        onChange={(e) =>
                                                            setEditedUser({ ...editedUser, firstName: e.target.value })
                                                        }
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />
                                                ) : (
                                                    <p className="text-white font-medium">{user?.firstName}</p>
                                                )}
                                            </div>

                                            {/* Last Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Last Name
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedUser.lastName}
                                                        onChange={(e) =>
                                                            setEditedUser({ ...editedUser, lastName: e.target.value })
                                                        }
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />
                                                ) : (
                                                    <p className="text-white font-medium">{user?.lastName}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </label>
                                                <p className="text-gray-500 font-medium bg-gray-900/50 p-2 rounded border border-gray-800">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Phone
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        type="tel"
                                                        value={editedUser.phone}
                                                        onChange={(e) =>
                                                            setEditedUser({ ...editedUser, phone: e.target.value })
                                                        }
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />
                                                ) : (
                                                    <p className="text-white font-medium">{user?.phone || "Not provided"}</p>
                                                )}
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Date of Birth
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        id="dob-edit"
                                                        type="date"
                                                        value={editedUser.dob}
                                                        onChange={(e) =>
                                                            setEditedUser({ ...editedUser, dob: e.target.value })
                                                        }
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                        max={new Date().toISOString().split("T")[0]}
                                                    />
                                                ) : (
                                                    <p className="text-white font-medium pl-1">
                                                        {user?.dob ? format(new Date(user.dob), "PPP") : "Not provided"}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Account Status
                                                </label>
                                                <p className="text-white font-medium">{user?.status || "ACTIVE"}</p>
                                            </div>
                                        </div>

                                        {/* Document Verification Section */}
                                        <div className="border-t border-red-500/20 pt-6 mt-6">
                                            <h3 className="text-lg font-semibold mb-4 text-white">Document Verification</h3>

                                            {/* Hidden file inputs */}
                                            <input
                                                type="file"
                                                ref={aadhaarInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAadhaarUpload}
                                            />
                                            <input
                                                type="file"
                                                ref={licenseInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLicenseUpload}
                                            />

                                            <div className="grid md:grid-cols-2 gap-4">
                                                {/* Aadhaar Card */}
                                                <Card className="bg-black/40 backdrop-blur-md border-red-500/20 hover:border-red-500/40 transition-colors overflow-hidden">
                                                    <CardContent className="p-0">
                                                        {user?.aadhaarUrl ? (
                                                            <div className="relative">
                                                                <div
                                                                    className="aspect-[3/2] cursor-pointer group"
                                                                    onClick={() => openDocPreview(user.aadhaarUrl, "Aadhaar Card")}
                                                                >
                                                                    <img
                                                                        src={user.aadhaarUrl}
                                                                        alt="Aadhaar Card"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <Eye className="h-8 w-8 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 flex items-center justify-between border-t border-red-500/20">
                                                                    <div>
                                                                        <p className="font-medium text-white text-sm">Aadhaar Card</p>
                                                                        <p className="text-xs text-green-400 flex items-center gap-1">
                                                                            <Check className="h-3 w-3" /> Uploaded
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                                                                        onClick={(e) => { e.stopPropagation(); aadhaarInputRef.current?.click(); }}
                                                                        disabled={isUploadingAadhaar}
                                                                    >
                                                                        {isUploadingAadhaar ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            "Replace"
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4">
                                                                <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center bg-gray-800/50 mb-3">
                                                                    <CreditCard className="h-10 w-10 text-gray-500 mb-2" />
                                                                    <p className="text-sm text-gray-400">No document uploaded</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium text-white">Aadhaar Card</p>
                                                                        <p className="text-xs text-gray-400">Required for verification</p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                                        onClick={() => aadhaarInputRef.current?.click()}
                                                                        disabled={isUploadingAadhaar}
                                                                    >
                                                                        {isUploadingAadhaar ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                                        ) : (
                                                                            <Upload className="h-4 w-4 mr-1" />
                                                                        )}
                                                                        Upload
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Driving License */}
                                                <Card className="bg-black/40 backdrop-blur-md border-red-500/20 hover:border-red-500/40 transition-colors overflow-hidden">
                                                    <CardContent className="p-0">
                                                        {user?.licenceUrl ? (
                                                            <div className="relative">
                                                                <div
                                                                    className="aspect-[3/2] cursor-pointer group"
                                                                    onClick={() => openDocPreview(user.licenceUrl, "Driving License")}
                                                                >
                                                                    <img
                                                                        src={user.licenceUrl}
                                                                        alt="Driving License"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <Eye className="h-8 w-8 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 flex items-center justify-between border-t border-red-500/20">
                                                                    <div>
                                                                        <p className="font-medium text-white text-sm">Driving License</p>
                                                                        <p className="text-xs text-green-400 flex items-center gap-1">
                                                                            <Check className="h-3 w-3" /> Uploaded
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                                                                        onClick={(e) => { e.stopPropagation(); licenseInputRef.current?.click(); }}
                                                                        disabled={isUploadingLicense}
                                                                    >
                                                                        {isUploadingLicense ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            "Replace"
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4">
                                                                <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center bg-gray-800/50 mb-3">
                                                                    <FileText className="h-10 w-10 text-gray-500 mb-2" />
                                                                    <p className="text-sm text-gray-400">No document uploaded</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium text-white">Driving License</p>
                                                                        <p className="text-xs text-gray-400">Required for verification</p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                                        onClick={() => licenseInputRef.current?.click()}
                                                                        disabled={isUploadingLicense}
                                                                    >
                                                                        {isUploadingLicense ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                                        ) : (
                                                                            <Upload className="h-4 w-4 mr-1" />
                                                                        )}
                                                                        Upload
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "bookings" && (
                                <Card className="bg-gray-900/50 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                                    <CardHeader className="border-b border-red-500/20">
                                        <CardTitle className="text-white">My Bookings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-6">
                                        {isLoadingBookings ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                                            </div>
                                        ) : bookings.length > 0 ? (
                                            <div className="space-y-4">
                                                {bookings.map((booking) => (
                                                    <div
                                                        key={booking.bookingId}
                                                        className="p-4 rounded-lg bg-black/40 border border-red-500/20 hover:border-red-500/40 transition-colors"
                                                    >
                                                        <div className="flex flex-col md:flex-row gap-4">
                                                            {/* Bike Image */}
                                                            <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                                                {booking.bikeImage ? (
                                                                    <img
                                                                        src={booking.bikeImage}
                                                                        alt={booking.bikeName}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                                        🏍️
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Booking Details */}
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <h4 className="font-semibold text-white text-lg">
                                                                            {booking.bikeName || booking.brandName || `Booking #${booking.bookingId}`}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {booking.locationCity || booking.location || "Location not available"}
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={cn(
                                                                            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                                                                            booking.status === "CONFIRMED" && "bg-green-500/20 text-green-400",
                                                                            booking.status === "PENDING" && "bg-yellow-500/20 text-yellow-400",
                                                                            booking.status === "CANCELLED" && "bg-red-500/20 text-red-400",
                                                                            booking.status === "COMPLETED" && "bg-blue-500/20 text-blue-400",
                                                                            booking.status === "ONGOING" && "bg-purple-500/20 text-purple-400"
                                                                        )}
                                                                    >
                                                                        {booking.status}
                                                                    </span>
                                                                </div>

                                                                {/* Dates */}
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded bg-green-500/20">
                                                                            <Calendar className="h-3 w-3 text-green-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500 text-xs">Pickup</p>
                                                                            <p className="text-white">
                                                                                {booking.pickupTs ? format(new Date(booking.pickupTs), "MMM d, yyyy h:mm a") : "N/A"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded bg-red-500/20">
                                                                            <Calendar className="h-3 w-3 text-red-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500 text-xs">Drop-off</p>
                                                                            <p className="text-white">
                                                                                {booking.dropTs ? format(new Date(booking.dropTs), "MMM d, yyyy h:mm a") : "N/A"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Footer */}
                                                                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                                                                    <div className="text-sm text-gray-400">
                                                                        Booking ID: <span className="text-white">#{booking.bookingId}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {booking.status === "COMPLETED" && (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setReviewModal({ isOpen: true, booking });
                                                                                    setReviewForm({ rating: 5, comments: "" });
                                                                                }}
                                                                                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
                                                                            >
                                                                                <Star className="h-4 w-4 mr-1" />
                                                                                Write Review
                                                                            </Button>
                                                                        )}
                                                                        <span className="text-xl font-bold text-white">
                                                                            ₹{booking.totalAmount || 0}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Bike className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                                                <h3 className="text-xl font-semibold mb-2 text-white">No Bookings Yet</h3>
                                                <p className="text-gray-400 mb-4">
                                                    You haven't made any bike bookings yet.
                                                </p>
                                                <Button onClick={() => navigate("/bikes")} className="bg-red-500 hover:bg-red-600">
                                                    Browse Bikes
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "payments" && (
                                <Card className="bg-gray-900/50 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                                    <CardHeader className="border-b border-red-500/20">
                                        <CardTitle className="text-white">Payment Methods</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center py-12">
                                        <CreditCard className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                                        <h3 className="text-xl font-semibold mb-2 text-white">No Payment Methods</h3>
                                        <p className="text-gray-400 mb-4">
                                            You haven't added any payment methods yet.
                                        </p>
                                        <Button className="bg-red-500 hover:bg-red-600">Add Payment Method</Button>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "settings" && (
                                <Card className="bg-gray-900/50 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                                    <CardHeader className="border-b border-red-500/20">
                                        <CardTitle className="text-white">Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 backdrop-blur-md border border-red-500/20 hover:border-red-500/40 transition-colors">
                                            <div>
                                                <p className="font-medium text-white">Email Notifications</p>
                                                <p className="text-sm text-gray-400">
                                                    Receive booking updates via email
                                                </p>
                                            </div>
                                            <input type="checkbox" className="accent-red-500 h-5 w-5" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 backdrop-blur-md border border-red-500/20 hover:border-red-500/40 transition-colors">
                                            <div>
                                                <p className="font-medium text-white">SMS Notifications</p>
                                                <p className="text-sm text-gray-400">
                                                    Receive booking updates via SMS
                                                </p>
                                            </div>
                                            <input type="checkbox" className="accent-red-500 h-5 w-5" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 backdrop-blur-md border border-red-500/20 hover:border-red-500/40 transition-colors">
                                            <div>
                                                <p className="font-medium text-white">Marketing Emails</p>
                                                <p className="text-sm text-gray-400">
                                                    Receive promotional offers and updates
                                                </p>
                                            </div>
                                            <input type="checkbox" className="accent-red-500 h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Document Preview Modal */}
            {previewDoc.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="relative max-w-4xl w-full mx-4">
                        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{previewDoc.title}</h3>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={previewDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                    <button
                                        onClick={closeDocPreview}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <img
                                    src={previewDoc.url}
                                    alt={previewDoc.title}
                                    className="w-full h-auto max-h-[70vh] object-contain rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <Dialog open={reviewModal.isOpen} onOpenChange={(open) => !open && setReviewModal({ isOpen: false, booking: null })}>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Write a Review
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Share your experience with {reviewModal.booking?.bikeName || "this bike"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Star Rating */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= reviewForm.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-600 hover:text-yellow-400/50"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Your Review (Optional)</label>
                            <Textarea
                                placeholder="Tell us about your experience..."
                                value={reviewForm.comments}
                                onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                                className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {reviewForm.comments.length}/500
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReviewModal({ isOpen: false, booking: null })}
                            className="border-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        >
                            {isSubmittingReview ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePage;

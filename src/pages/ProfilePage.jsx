import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});

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
            });
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSave = () => {
        // API call to update user would go here
        setIsEditing(false);
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
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
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
        <div className="animate-fade-in min-h-screen bg-gray-50 dark:bg-gray-900">
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
                            <Card className="sticky top-24 bg-gray-900/90 border-gray-800 shadow-xl">
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
                                        <button className="absolute bottom-0 right-0 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors">
                                            <Camera className="h-4 w-4" />
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
                                        {menuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                                        ? "bg-red-500/20 text-red-500 border border-red-500/30"
                                                        : "hover:bg-gray-800 text-gray-300 hover:text-white"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-5 w-5" />
                                                        <span className="font-medium">{item.label}</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            );
                                        })}
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
                                <Card className="bg-gray-900/90 border-gray-800 shadow-xl">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800">
                                        <CardTitle className="text-white">Personal Information</CardTitle>
                                        {!isEditing ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditing(true)}
                                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleSave} className="bg-red-500 hover:bg-red-600">
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleCancel}
                                                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
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
                                                {isEditing ? (
                                                    <Input
                                                        type="email"
                                                        value={editedUser.email}
                                                        onChange={(e) =>
                                                            setEditedUser({ ...editedUser, email: e.target.value })
                                                        }
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />
                                                ) : (
                                                    <p className="text-white font-medium">{user?.email}</p>
                                                )}
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
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Date of Birth
                                                </label>
                                                <p className="text-white font-medium">
                                                    {user?.dob ? new Date(user.dob).toLocaleDateString() : "Not provided"}
                                                </p>
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
                                        <div className="border-t border-gray-800 pt-6 mt-6">
                                            <h3 className="text-lg font-semibold mb-4 text-white">Document Verification</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Card className="bg-gray-800/50 border-gray-700">
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-white">Aadhaar Card</p>
                                                            <p className="text-sm text-gray-400">
                                                                {user?.aadhaarImage ? "Uploaded" : "Not uploaded"}
                                                            </p>
                                                        </div>
                                                        {user?.aadhaarImage ? (
                                                            <Check className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Upload</Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <Card className="bg-gray-800/50 border-gray-700">
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-white">Driving License</p>
                                                            <p className="text-sm text-gray-400">
                                                                {user?.licenseImage ? "Uploaded" : "Not uploaded"}
                                                            </p>
                                                        </div>
                                                        {user?.licenseImage ? (
                                                            <Check className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">Upload</Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "bookings" && (
                                <Card className="bg-gray-900/90 border-gray-800 shadow-xl">
                                    <CardHeader className="border-b border-gray-800">
                                        <CardTitle className="text-white">My Bookings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center py-12">
                                        <Bike className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                                        <h3 className="text-xl font-semibold mb-2 text-white">No Bookings Yet</h3>
                                        <p className="text-gray-400 mb-4">
                                            You haven't made any bike bookings yet.
                                        </p>
                                        <Button onClick={() => navigate("/bikes")} className="bg-red-500 hover:bg-red-600">
                                            Browse Bikes
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "payments" && (
                                <Card className="bg-gray-900/90 border-gray-800 shadow-xl">
                                    <CardHeader className="border-b border-gray-800">
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
                                <Card className="bg-gray-900/90 border-gray-800 shadow-xl">
                                    <CardHeader className="border-b border-gray-800">
                                        <CardTitle className="text-white">Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                            <div>
                                                <p className="font-medium text-white">Email Notifications</p>
                                                <p className="text-sm text-gray-400">
                                                    Receive booking updates via email
                                                </p>
                                            </div>
                                            <input type="checkbox" className="accent-red-500 h-5 w-5" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                            <div>
                                                <p className="font-medium text-white">SMS Notifications</p>
                                                <p className="text-sm text-gray-400">
                                                    Receive booking updates via SMS
                                                </p>
                                            </div>
                                            <input type="checkbox" className="accent-red-500 h-5 w-5" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
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
        </div>
    );
};

export default ProfilePage;

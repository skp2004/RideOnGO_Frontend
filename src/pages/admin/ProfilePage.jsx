import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    MapPin,
    Loader2,
    LogOut,
    RefreshCw,
    Bike,
    Tag,
    Users,
    Edit2,
    Check,
    X,
} from "lucide-react";
import adminService from "../../services/adminService";

export default function ProfilePage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getAdminProfile();
            setProfile(data);
            setEditedProfile({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                phone: data.phone || "",
                dob: data.dob || "",
            });
            localStorage.setItem("adminUser", JSON.stringify(data));
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedData = await adminService.updateAdminProfile(editedProfile);
            setProfile({ ...profile, ...updatedData });
            localStorage.setItem("adminUser", JSON.stringify({ ...profile, ...updatedData }));
            setIsEditing(false);
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
                variant: "success",
            });
            // Refresh to get latest data
            fetchProfile();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile({
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
            phone: profile?.phone || "",
            dob: profile?.dob || "",
        });
        setIsEditing(false);
    };

    const handleLogout = () => {
        adminService.logout();
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
            variant: "success",
        });
        navigate("/admin/login");
    };

    const handleRefresh = () => {
        hasFetchedRef.current = false;
        fetchProfile();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Shield className="h-6 w-6 text-red-500" />
                        Admin Profile
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage your admin account</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Profile Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Profile Info */}
                <Card className="bg-gray-900/80 border-gray-800 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-gray-800">
                        <CardTitle className="text-white">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center ring-4 ring-red-500/20">
                                {profile?.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.firstName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-white" />
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={editedProfile.firstName}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                                            placeholder="First Name"
                                            className="bg-gray-800 border-gray-700 text-white w-28"
                                        />
                                        <Input
                                            value={editedProfile.lastName}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                                            placeholder="Last Name"
                                            className="bg-gray-800 border-gray-700 text-white w-28"
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-xl font-bold text-white">
                                        {profile?.firstName} {profile?.lastName}
                                    </h3>
                                )}
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full border border-red-500/30 mt-2">
                                    <Shield className="h-3 w-3" />
                                    {profile?.role || "Administrator"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <Mail className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-white">{profile?.email}</p>
                                    <p className="text-xs text-gray-500">(Cannot be changed)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <Phone className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    {isEditing ? (
                                        <Input
                                            type="tel"
                                            value={editedProfile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            className="bg-gray-700 border-gray-600 text-white mt-1"
                                        />
                                    ) : (
                                        <p className="font-medium text-white">{profile?.phone || "Not provided"}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <Calendar className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editedProfile.dob}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, dob: e.target.value })}
                                            className="bg-gray-700 border-gray-600 text-white mt-1"
                                            max={new Date().toISOString().split("T")[0]}
                                        />
                                    ) : (
                                        <p className="font-medium text-white">{formatDate(profile?.dob)}</p>
                                    )}
                                </div>
                            </div>

                            {profile?.address && (
                                <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                    <div className="p-2 rounded-lg bg-red-500/10">
                                        <MapPin className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-white">{profile.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="bg-gray-900/80 border-gray-800 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-gray-800">
                        <CardTitle className="text-white">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <User className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-medium text-white">#{profile?.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <Shield className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium text-white capitalize">{profile?.role?.toLowerCase() || "Admin"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <Calendar className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Status</p>
                                    <span className="inline-flex px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                                        Active
                                    </span>
                                </div>
                            </div>

                            {profile?.createdAt && (
                                <div className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
                                    <div className="p-2 rounded-lg bg-red-500/10">
                                        <Calendar className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="font-medium text-white">
                                            {new Date(profile.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-gray-800">
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate("/admin/bikes")}
                            className="group p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                                    <Bike className="h-6 w-6 text-red-400" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Manage Bikes</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate("/admin/brands")}
                            className="group p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                                    <Tag className="h-6 w-6 text-yellow-400" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Manage Brands</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate("/admin/locations")}
                            className="group p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-xl bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                                    <MapPin className="h-6 w-6 text-pink-400" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Manage Locations</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate("/admin/users")}
                            className="group p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Manage Users</span>
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

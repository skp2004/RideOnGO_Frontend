import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Bike,
    MapPin,
    Tag,
    TrendingUp,
    Calendar,
    DollarSign,
    Activity
} from "lucide-react";
import adminService from "../../services/adminService";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBikes: 0,
        totalLocations: 0,
        totalBrands: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, bikes, locations, brands] = await Promise.all([
                    adminService.getUsers(),
                    adminService.getBikes(),
                    adminService.getLocations(),
                    adminService.getBrands(),
                ]);
                setStats({
                    totalUsers: users?.length || 0,
                    totalBikes: bikes?.length || 0,
                    totalLocations: locations?.length || 0,
                    totalBrands: brands?.length || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-blue-500",
            bgColor: "bg-gray-800/80 border border-gray-700",
        },
        {
            title: "Total Bikes",
            value: stats.totalBikes,
            icon: Bike,
            color: "bg-red-500",
            bgColor: "bg-gray-800/80 border border-gray-700",
        },
        {
            title: "Locations",
            value: stats.totalLocations,
            icon: MapPin,
            color: "bg-green-500",
            bgColor: "bg-gray-800/80 border border-gray-700",
        },
        {
            title: "Brands",
            value: stats.totalBrands,
            icon: Tag,
            color: "bg-red-500",
            bgColor: "bg-gray-800/80 border border-gray-700",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">
                    Welcome back! Here's an overview of your bike rental business.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`${stat.bgColor} shadow-xl`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {isLoading ? "..." : stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.color}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                    <CardHeader className="border-b border-gray-800">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Activity className="h-5 w-5 text-red-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">New user registered</p>
                                    <p className="text-sm text-gray-400">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Bike className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Bike booking completed</p>
                                    <p className="text-sm text-gray-400">15 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Payment received</p>
                                    <p className="text-sm text-gray-400">1 hour ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
                    <CardHeader className="border-b border-gray-800">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Today's Bookings</span>
                                </div>
                                <span className="font-bold text-green-400">12</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <Bike className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Available Bikes</span>
                                </div>
                                <span className="font-bold text-blue-400">{stats.totalBikes}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-300">Today's Revenue</span>
                                </div>
                                <span className="font-bold text-red-400">₹15,400</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

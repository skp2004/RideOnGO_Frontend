import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Bike,
    LayoutDashboard,
    Users,
    MapPin,
    Tag,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Shield,
    Bell,
    Building,
    FileText,
    CreditCard,
    User,
    ChevronDown,
    Star,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        title: "Bikes",
        icon: Bike,
        path: "/admin/bikes",
    },
    {
        title: "Brands",
        icon: Tag,
        path: "/admin/brands",
    },
    {
        title: "Locations",
        icon: MapPin,
        path: "/admin/locations",
    },
    {
        title: "Users",
        icon: Users,
        path: "/admin/users",
    },
    {
        title: "Bookings",
        icon: FileText,
        path: "/admin/bookings",
    },
    {
        title: "Payments",
        icon: CreditCard,
        path: "/admin/payments",
    },
    {
        title: "Reviews",
        icon: Star,
        path: "/admin/reviews",
    },

];

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-gray-950 border-r border-gray-800 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
                    } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <div className="relative">
                            <Bike className="h-8 w-8 text-red-600" />
                            <Shield className="h-4 w-4 text-red-400 absolute -bottom-1 -right-1" />
                        </div>
                        {sidebarOpen && (
                            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                                Admin
                            </span>
                        )}
                    </Link>

                    {/* Collapse Button - Desktop */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className={`h-5 w-5 text-gray-400 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Close Button - Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-800"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path)
                                ? "bg-red-900/40 text-red-400"
                                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">{item.title}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                    }`}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between">
                    {/* Left Side - Mobile Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                            {menuItems.find((item) => isActive(item.path))?.title || "Admin Dashboard"}
                        </h1>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2">

                        {/* Notifications */}
                        <button className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Admin Profile with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-1 pr-2 transition-colors"
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <Link
                                        to="/admin/profile"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <User className="h-4 w-4" />
                                        My Profile
                                    </Link>

                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

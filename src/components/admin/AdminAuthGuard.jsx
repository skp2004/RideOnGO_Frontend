import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Admin Auth Guard Component
 * Protects admin routes by checking for valid admin token
 * Redirects to admin login if not authenticated
 */
export default function AdminAuthGuard({ children }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const adminToken = localStorage.getItem("adminToken");

            if (adminToken) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
            setIsChecking(false);
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with the attempted URL for redirect after login
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}

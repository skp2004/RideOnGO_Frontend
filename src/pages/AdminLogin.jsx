import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bike, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle, Shield } from "lucide-react";
import authService from "../services/authService";

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: "", title: "", message: "" });

    // Get the redirect path from location state or default to dashboard
    const from = location.state?.from?.pathname || "/admin/dashboard";

    // Check if already logged in
    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (adminToken) {
            navigate(from, { replace: true });
        }
    }, [navigate, from]);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Error state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case "email":
                if (!value.trim()) return "Email is required";
                if (value.length > 50) return "Email must be 50 characters or less";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
                return "";

            case "password":
                if (!value) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                return "";

            default:
                return "";
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    // Handle blur
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};
        newErrors.email = validateField("email", formData.email);
        newErrors.password = validateField("password", formData.password);

        setErrors(newErrors);
        setTouched({
            email: true,
            password: true,
        });

        return !Object.values(newErrors).some(error => error !== "");
    };

    // Show alert helper
    const showAlert = (type, title, message) => {
        setAlert({ show: true, type, title, message });
        setTimeout(() => {
            setAlert({ show: false, type: "", title: "", message: "" });
        }, 5000);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert({ show: false, type: "", title: "", message: "" });

        if (validateForm()) {
            setIsLoading(true);
            try {
                const response = await authService.adminLogin(formData.email, formData.password);
                localStorage.setItem("adminToken", response.token);
                showAlert("success", "Login Successful!", "Welcome back, Admin. Redirecting to dashboard...");

                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || "Admin login failed. Please check your credentials.";
                showAlert("destructive", "Login Failed", errorMessage);
            } finally {
                setIsLoading(false);
            }
        } else {
            showAlert("warning", "Validation Error", "Please fill in all required fields correctly.");
        }
    };

    // Error message component
    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Branding Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Wave Pattern */}
                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path
                            fill="rgba(255,255,255,0.1)"
                            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path
                            fill="rgba(255,255,255,0.05)"
                            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>

                    {/* Floating Circles */}
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: "1s" }}></div>
                    <div className="absolute bottom-40 left-32 w-16 h-16 bg-white/20 rounded-full blur-md animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>

                    {/* Small Dots Pattern */}
                    <div className="absolute top-32 right-32 w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="absolute top-48 right-48 w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="absolute top-64 right-24 w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="absolute bottom-48 left-48 w-2 h-2 bg-white/40 rounded-full"></div>

                    {/* Decorative Lines */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-1/3 left-1/3 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="relative">
                            <Bike className="h-10 w-10 text-white" />
                            <Shield className="h-5 w-5 text-purple-300 absolute -bottom-1 -right-1" />
                        </div>
                        <span className="text-xl font-semibold tracking-wide">ADMIN PORTAL</span>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <p className="text-purple-200 text-lg mb-2">Nice to see you again</p>
                        <h1 className="text-5xl font-bold tracking-tight mb-4">WELCOME BACK</h1>
                    </div>

                    {/* Description */}
                    <p className="text-purple-100/80 max-w-md text-sm leading-relaxed">
                        Access your admin dashboard to manage bikes, bookings, users, and more.
                        Keep your rental business running smoothly with our powerful admin tools.
                    </p>

                    {/* Decorative Bottom Element */}
                    <div className="absolute bottom-12 left-12 flex items-center gap-4">
                        <div className="w-12 h-px bg-white/30"></div>
                        <span className="text-white/50 text-xs">Secure Admin Access</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="relative">
                            <Bike className="h-10 w-10 text-purple-600" />
                            <Shield className="h-5 w-5 text-purple-400 absolute -bottom-1 -right-1" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Admin Portal
                        </span>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Enter your credentials to access admin dashboard
                        </p>
                    </div>

                    {/* Alert Component */}
                    {alert.show && (
                        <div className="mb-6">
                            <Alert variant={alert.type}>
                                {alert.type === "destructive" && <AlertCircle className="h-4 w-4" />}
                                {alert.type === "success" && <CheckCircle className="h-4 w-4" />}
                                {alert.type === "warning" && <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{alert.title}</AlertTitle>
                                <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email ID"
                                    className={`pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.email && touched.email ? "border-red-500" : ""}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={50}
                                    autoComplete="email"
                                />
                            </div>
                            <ErrorMessage error={touched.email && errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    className={`pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.password && touched.password ? "border-red-500" : ""}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="current-password"
                                />
                            </div>
                            <ErrorMessage error={touched.password && errors.password} />
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                Keep me signed in
                            </label>
                            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                                User Login?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
                            size="lg"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    SIGN IN
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

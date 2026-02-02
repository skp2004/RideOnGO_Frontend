import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bike, Mail, Lock, User, ArrowRight, Github, Chrome, Phone, Calendar, AlertCircle, Loader2, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginDemo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, error: authError, setError: setAuthError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Check if URL is /signup to show signup form directly
  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
  });

  // File upload state
  const [files, setFiles] = useState({
    profileImage: null,
    aadhaarImage: null,
    licenseImage: null,
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

  // Error state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules based on entity constraints
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.length > 30) return "First name must be 30 characters or less";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "First name can only contain letters";
        return "";

      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.length > 30) return "Last name must be 30 characters or less";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Last name can only contain letters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (value.length > 50) return "Email must be 50 characters or less";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain a lowercase letter";
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain an uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain a number";
        if (!/(?=.*[@$!%*?&])/.test(value)) return "Password must contain a special character (@$!%*?&)";
        return "";

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (value.length > 14) return "Phone must be 14 characters or less";
        if (!/^[0-9+\-\s()]+$/.test(value)) return "Please enter a valid phone number";
        if (value.replace(/[^0-9]/g, "").length < 10) return "Phone number must have at least 10 digits";
        return "";

      case "dob":
        if (!value) return "Date of birth is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
        if (actualAge < 18) return "You must be at least 18 years old";
        if (actualAge > 100) return "Please enter a valid date of birth";
        return "";

      default:
        return "";
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate on change if field was touched
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

    if (!isLogin) {
      newErrors.firstName = validateField("firstName", formData.firstName);
      newErrors.lastName = validateField("lastName", formData.lastName);
      newErrors.confirmPassword = validateField("confirmPassword", formData.confirmPassword);
      newErrors.phone = validateField("phone", formData.phone);
      newErrors.dob = validateField("dob", formData.dob);
    }

    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password);

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
      dob: true,
    });

    return !Object.values(newErrors).some(error => error !== "");
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (validateForm()) {
      if (isLogin) {
        // Login flow
        setIsLoading(true);
        try {
          await login(formData.email, formData.password);

          // Check if user was redirected here from booking flow
          const { redirectToBooking, bikeData, duration } = location.state || {};
          if (redirectToBooking && bikeData) {
            // Redirect back to booking page with bike data
            navigate("/booking", {
              state: {
                bike: bikeData,
                duration: duration
              }
            });
          } else {
            navigate("/profile");
          }
        } catch (err) {
          setApiError(err.message || "Login failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Signup flow
        setIsLoading(true);
        try {
          await register(
            {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              dob: formData.dob,
            },
            files.profileImage,
            files.aadhaarImage,
            files.licenseImage
          );
          setSuccessMessage("Account created successfully! Please login to continue.");
          // Reset form after successful signup
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            dob: "",
          });
          setFiles({
            profileImage: null,
            aadhaarImage: null,
            licenseImage: null,
          });
          setTouched({});
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } catch (err) {
          setApiError(err.message || "Registration failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      console.log("Form has errors", errors);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles && uploadedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
    }
  };

  // Reset form when switching modes
  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dob: "",
    });
    setFiles({
      profileImage: null,
      aadhaarImage: null,
      licenseImage: null,
    });
    setErrors({});
    setTouched({});
    setApiError("");
    setSuccessMessage("");
  }, [isLogin]);

  // Error message component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-destructive text-xs mt-1">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-none shadow-2xl">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Bike className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Ride On Go
            </span>
          </Link>
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to start booking bikes"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Form Fields */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        className={`pl-10 ${errors.firstName && touched.firstName ? "border-destructive" : ""}`}
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={30}
                      />
                    </div>
                    <ErrorMessage error={touched.firstName && errors.firstName} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        className={`pl-10 ${errors.lastName && touched.lastName ? "border-destructive" : ""}`}
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={30}
                      />
                    </div>
                    <ErrorMessage error={touched.lastName && errors.lastName} />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      className={`pl-10 ${errors.phone && touched.phone ? "border-destructive" : ""}`}
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={14}
                    />
                  </div>
                  <ErrorMessage error={touched.phone && errors.phone} />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="dob">
                    Date of Birth <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      className={`pl-10 ${errors.dob && touched.dob ? "border-destructive" : ""}`}
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <ErrorMessage error={touched.dob && errors.dob} />
                </div>

                {/* File Upload Section */}
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-muted-foreground">Document Uploads (Optional)</p>

                  {/* Profile Image */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="profileImage">
                      Profile Photo
                    </label>
                    <div className="relative">
                      <Input
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        accept="image/*"
                        className="file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      {files.profileImage && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{files.profileImage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Image */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="aadhaarImage">
                      Aadhaar Card
                    </label>
                    <div className="relative">
                      <Input
                        id="aadhaarImage"
                        name="aadhaarImage"
                        type="file"
                        accept="image/*"
                        className="file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      {files.aadhaarImage && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{files.aadhaarImage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Image */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="licenseImage">
                      Driving License
                    </label>
                    <div className="relative">
                      <Input
                        id="licenseImage"
                        name="licenseImage"
                        type="file"
                        accept="image/*"
                        className="file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      {files.licenseImage && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{files.licenseImage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 ${errors.email && touched.email ? "border-destructive" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={50}
                />
              </div>
              <ErrorMessage error={touched.email && errors.email} />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 ${errors.password && touched.password ? "border-destructive" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <ErrorMessage error={touched.password && errors.password} />
              {!isLogin && !errors.password && formData.password && (
                <p className="text-xs text-green-600 mt-1">✓ Password meets all requirements</p>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`pl-10 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive" : ""}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <ErrorMessage error={touched.confirmPassword && errors.confirmPassword} />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded accent-primary" />
                  Remember me
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            {/* API Error Display */}
            {apiError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

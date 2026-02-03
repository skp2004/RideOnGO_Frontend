import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast";

import HomeLayout from "./pages/Home";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginDemo from "./pages/login";
import BikesPage from "./pages/BikesPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import MyBookingsPage from "./pages/MyBookingsPage";

// Admin imports
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBikesPage from "./pages/admin/BikesPage";
import AdminBrandsPage from "./pages/admin/BrandsPage";
import AdminLocationsPage from "./pages/admin/LocationsPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminProfilePage from "./pages/admin/ProfilePage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminReviewsPage from "./pages/admin/ReviewsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Admin Login - without layout */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin routes - with admin layout and auth guard */}
              <Route path="/admin/*" element={
                <AdminAuthGuard>
                  <AdminLayout>
                    <Routes>
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/bikes" element={<AdminBikesPage />} />
                      <Route path="/brands" element={<AdminBrandsPage />} />
                      <Route path="/locations" element={<AdminLocationsPage />} />
                      <Route path="/users" element={<AdminUsersPage />} />
                      <Route path="/profile" element={<AdminProfilePage />} />
                      <Route path="/bookings" element={<AdminBookingsPage />} />
                      <Route path="/payments" element={<AdminPaymentsPage />} />
                      <Route path="/reviews" element={<AdminReviewsPage />} />
                    </Routes>
                  </AdminLayout>
                </AdminAuthGuard>
              } />

              {/* Main app routes - with user navbar */}
              <Route path="/*" element={
                <HomeLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/bikes" element={<BikesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginDemo />} />
                    <Route path="/signup" element={<LoginDemo />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                  </Routes>
                </HomeLayout>
              } />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

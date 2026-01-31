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
                      <Route path="/bookings" element={<AdminDashboard />} />
                      <Route path="/payments" element={<AdminDashboard />} />
                      <Route path="/settings" element={<AdminDashboard />} />
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

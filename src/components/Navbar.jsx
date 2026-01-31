import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Bike, Home, Info, Phone, User, LogIn, LogOut, MapPin, IndianRupee } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FleetAndPriceModal from "./FleetAndPriceModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/bikes", label: "Bikes", icon: Bike },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  const isActiveLink = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-red-500/20 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <Bike className="h-8 w-8" />
            <span className="bg-gradient-to-r from-red-500 to-red-500 bg-clip-text text-transparent">
              Ride On Go
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActiveLink(link.path)
                  ? "text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Fleet and Price Button */}
            <button
              onClick={() => setIsFleetModalOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <IndianRupee className="h-4 w-4" />
              Fleet & Price
            </button>
          </nav>

          {/* Desktop Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.firstName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {user?.firstName || "Profile"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-primary">
                    <Bike className="h-6 w-6" />
                    Ride On Go
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActiveLink(link.path)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Fleet and Price Button - Mobile */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsFleetModalOpen(true);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted text-foreground"
                  >
                    <IndianRupee className="h-5 w-5" />
                    Fleet & Price
                  </button>

                  <div className="border-t my-4" />

                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          {user?.image ? (
                            <img
                              src={user.image}
                              alt={user.firstName}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          {user?.firstName || "Profile"}
                        </Button>
                      </Link>
                      <Button className="w-full mt-2" variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full mt-2">
                          <User className="mr-2 h-4 w-4" />
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Fleet and Price Modal */}
      <FleetAndPriceModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;


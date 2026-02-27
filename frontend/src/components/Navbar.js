import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="navbar-brand" data-testid="navbar-logo">
            FixIQ
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to="/dashboard" className="nav-link" data-testid="nav-dashboard">
                  Dashboard
                </Link>
                <Link to="/report" className="nav-link" data-testid="nav-report">
                  Report Issue
                </Link>
                <Link to="/leaderboard" className="nav-link" data-testid="nav-leaderboard">
                  Leaderboard
                </Link>
                <Link to="/analytics" className="nav-link" data-testid="nav-analytics">
                  Analytics
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link" data-testid="nav-admin">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900" data-testid="user-name">{user.name}</p>
                    <p className="text-sm text-green-600 font-medium" data-testid="user-points">
                      {user.fixPoints} FixPoints
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <Button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" data-testid="nav-login-btn">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="btn-primary text-white" data-testid="nav-signup-btn">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-green-600 font-medium">{user.fixPoints} FixPoints</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="block nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/report"
                    className="block nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="block nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/analytics"
                    className="block nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full mt-4 border-2 border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="btn-primary text-white w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
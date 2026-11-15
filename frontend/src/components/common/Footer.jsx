import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Find<span className="text-blue-500">It</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              FindIt is the official centralized lost and found platform for our campus. Reconnecting students with their lost belongings through smart matching and secure verification.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse" className="hover:text-white transition">Browse All Listings</Link></li>
              <li><Link to="/create-report" className="hover:text-white transition">Report Lost Belonging</Link></li>
              <li><Link to="/create-report" className="hover:text-white transition">Report Found Belonging</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Student Dashboard</Link></li>
              <li><Link to="/my-claims" className="hover:text-white transition">Track Submitted Claims</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Electronics (Laptops, Phones, AirPods)</li>
              <li>College ID Cards & Badges</li>
              <li>Keys & Keychains</li>
              <li>Backpacks & Books</li>
              <li>Watches & Accessories</li>
            </ul>
          </div>

          {/* Col 4: Campus Security */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Campus Security Office</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Student Center, Ground Floor, Room 104</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+1 (555) CAMPUS-SEC</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>security@findit.campus.edu</span>
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                  <Shield className="w-3 h-3" /> Official Campus Portal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FindIt Campus Lost & Found. Built with Spring Boot, PostgreSQL, and React.</p>
          <p className="flex items-center gap-1">
            Academic Full-Stack Project <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


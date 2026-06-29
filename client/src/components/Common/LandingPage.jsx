import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Adjust path if needed

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#E4E4E7] font-sans antialiased flex flex-col overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="border-b border-white/[0.05] bg-[#0B0C0E]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between h-20 items-center">
            {/* Logo with scale-up hover */}
            <div className="flex items-center transform transition-transform duration-300 hover:scale-105 cursor-pointer">
              <img src={logo} alt="OffGrid Logo" className="h-12 w-auto object-contain invert" />
            </div>
            
            {/* Navigation Actions */}
            <div className="flex items-center space-x-6 sm:space-x-8">
              <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200">
                Features
              </a>
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-green-400 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36">
          {/* Animated Background Glow Ambient Blurs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-green-500/10 rounded-full blur-[120px] -z-10 animate-pulse duration-[6000ms]" />
          <div className="absolute top-1/3 right-10 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[80px] -z-10 animate-bounce duration-[10000ms] hidden lg:block" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            
            {/* Subtitle Tag with Fade-In slide animation */}
            <div className="inline-flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping mr-2.5" />
              <span className="text-xs font-medium tracking-wide text-neutral-300">Intern Leave Tracking System</span>
            </div>

            {/* Clear Premium Headline with staggered entry animation */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 delay-100 duration-1000">
              Manage your team's leave, <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent bg-[size:200%_auto] animate-pulse">
                completely hassle-free.
              </span>
            </h1>

            {/* Accessible Description */}
            <p className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in duration-1000 delay-300">
              A powerful, centralized platform designed for administrators, supervisors, and interns to manage time-off requests easily and track real-time attendance.
            </p>

            {/* Dynamic Interactive Call-To-Action Row */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in duration-1000 delay-500">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-black text-base font-semibold px-8 py-4 rounded-xl shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Get Started for Free
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.08] text-white text-base font-semibold px-8 py-4 rounded-xl border border-white/[0.08] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Learn More
              </a>
            </div>

          </div>
        </section>

        {/* Features Block */}
        <section id="features" className="bg-[#111215] border-t border-white/[0.05] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
                One platform. Three custom dashboards.
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Tailored views designed specifically to make everyone's jobs faster and easier.
              </p>
            </div>

            {/* Smooth Hover Card Grids */}
            <div className="grid gap-8 md:grid-cols-3">
              
              {/* Card 1: Admin */}
              <div className="group bg-[#16171C] border border-white/[0.04] rounded-2xl p-8 hover:border-green-500/30 transform hover:-translate-y-2 hover:bg-[#191b22] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/40">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-black transition-all duration-300">
                  A
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-200">Admin Dashboard</h3>
                <p className="text-neutral-400 text-sm leading-relaxed font-light">
                  Full system oversight. Manage user accounts, customize global leave policies, and view immutable audit logs anytime.
                </p>
              </div>

              {/* Card 2: Supervisor */}
              <div className="group bg-[#16171C] border border-white/[0.04] rounded-2xl p-8 hover:border-green-500/30 transform hover:-translate-y-2 hover:bg-[#191b22] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/40">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-black transition-all duration-300">
                  S
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-200">Supervisor Hub</h3>
                <p className="text-neutral-400 text-sm leading-relaxed font-light">
                  Quickly review team calendars, approve or deny requests in a single click, and keep track of overall department capacity.
                </p>
              </div>

              {/* Card 3: Intern */}
              <div className="group bg-[#16171C] border border-white/[0.04] rounded-2xl p-8 hover:border-green-500/30 transform hover:-translate-y-2 hover:bg-[#191b22] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/40">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-black transition-all duration-300">
                  I
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-200">Intern Portal</h3>
                <p className="text-neutral-400 text-sm leading-relaxed font-light">
                  Submit time-off requests instantly, check your remaining balances, and view your complete request history seamlessly.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-[#0B0C0E] py-10 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-semibold text-neutral-400 tracking-wider uppercase text-[10px]">
            OffGrid Systems Designed by Sharleen &copy; {new Date().getFullYear()}
          </div>
          <div>
            &copy; {new Date().getFullYear()} OffGrid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#06070B] text-[#F1F5F9] font-sans antialiased flex flex-col overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-300">
      
      {/* Top Banner Accent */}
      <div className="w-full bg-[#0B0D16] border-b border-slate-900 px-6 py-2 flex justify-center items-center text-[10px] font-mono tracking-[0.2em] text-blue-400">
        // AUTONOMOUS SUBSYSTEM INITIALIZED // NO CORE HR INTEGRATION REQUIRED
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-900 bg-[#06070B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between h-16 items-center">
            
            {/* Rigid Sharp Logo */}
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-7 w-auto object-center"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            
            {/* System Key Actions */}
            <div className="flex items-center space-x-8 font-mono text-xs tracking-wider">
              <a href="#matrix" className="text-slate-500 hover:text-slate-200 transition-colors">
                [ INFRASTRUCTURE ]
              </a>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded-md transition-all shadow-md shadow-blue-600/10"
              >
                LAUNCH SUITE
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Architectural Hero */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32">
          {/* Subtle Ambient Depth Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/[0.04] rounded-full blur-[130px] -z-10 animate-pulse duration-[8000ms]" />

          <div className="max-w-4xl mx-auto px-6 text-center">
            
            {/* System Status Tag */}
            <div className="inline-flex items-center gap-2 bg-[#0E111A] border border-slate-800 px-3 py-1 rounded-md font-mono text-[10px] tracking-widest text-slate-400 mb-8">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              STANDALONE REPOSITORY / COHORT-SPECIFIC
            </div>

            {/* Sharp Bold Typographic Polish */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
              Track intern leave. <br />
              <span className="font-light bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600 bg-clip-text text-transparent">
                Skip the corporate IT queue.
              </span>
            </h1>

            {/* Problem-Solving Specific Subtext */}
            <p className="mt-8 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
              Temporary cohorts don't need costly enterprise accounts on the company’s main active directory. OffGrid provides a sleek, standalone platform designed specifically to onboard interns, log requests, and process supervisor handoffs instantly.
            </p>

            {/* Industrial Button Cluster */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 font-mono text-xs tracking-wider">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#020617] font-semibold px-8 py-4 rounded-md transition-all text-center"
              >
                ACCESS WORKSPACE
              </Link>
              <a
                href="#matrix"
                className="w-full sm:w-auto bg-[#0E111A] text-slate-400 hover:text-white border border-slate-800 px-8 py-4 rounded-md transition-all text-center"
              >
                EXPLORE FRAMEWORK
              </a>
            </div>

          </div>
        </section>

        {/* Feature Matrix & Live Workspace Simulation Preview */}
        <section id="matrix" className="bg-[#090A0F] border-t border-slate-900 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              
              {/* Left Column Text (Spans 2 columns on desktop) */}
              <div className="lg:col-span-2 space-y-8">
                <div className="border-l border-blue-500 pl-4">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-blue-400 uppercase block mb-1">Architecture Rules</span>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    Isolated tracking logic.
                  </h2>
                </div>
                
                <p className="text-slate-400 font-light text-sm leading-relaxed">
                  Because interns exist outside your main system architecture, keeping manual spreadsheet rows updated is an operational nightmare. OffGrid completely automates the process through independent micro-modules.
                </p>

                <div className="space-y-6">
                  {/* Miniature Bullet Feature 1 */}
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-1">Dynamic Cohort Onboarding</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Set explicit contract boundaries, assign custom leave balances, and map direct supervisors in seconds.</p>
                    </div>
                  </div>

                  {/* Miniature Bullet Feature 2 */}
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-1">Instant Balance Recalculation</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Asynchronous ledger updates instantly deduct available time-off blocks the moment an entry gets approved.</p>
                    </div>
                  </div>

                  {/* Miniature Bullet Feature 3 */}
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-1">Frictionless Supervisor Pipeline</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Managers process rows, write rejection tags, and clear cross-team calendar conflicts through a private hub.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Layout Preview (Spans 3 columns on desktop) */}
              <div className="lg:col-span-3 bg-[#0E111A] border border-slate-800/80 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                
                {/* Decorative UI Window Controls */}
                <div className="flex items-center gap-1.5 mb-6 pb-4 border-b border-slate-800/60 text-xs font-mono text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="ml-2 text-[10px] text-slate-600">// INTERN_MONITOR_PANEL</span>
                </div>

                {/* Simulated UI Content Block */}
                <div className="space-y-4 font-mono text-xs">
                  
                  {/* Simulated Row 1 */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded bg-slate-900/40 border border-slate-800/30 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-slate-300">Alex Tan (Marketing Intern)</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-slate-500">Sick Leave (2 Days)</span>
                      <span className="text-amber-400/90 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded">PENDING</span>
                    </div>
                  </div>

                  {/* Simulated Row 2 */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded bg-slate-900/40 border border-slate-800/30 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">John Doe (Dev Intern)</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-slate-500">Annual Leave (1 Day)</span>
                      <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">APPROVED</span>
                    </div>
                  </div>

                  {/* Simulated Row 3 */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded bg-slate-900/40 border border-slate-800/30 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-300">Sarah Jenkins (Design Intern)</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-slate-500">Casual Leave (3 Days)</span>
                      <span className="text-rose-400 bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 rounded">REJECTED</span>
                    </div>
                  </div>

                </div>

                {/* Ambient Decorative Graphic */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>ACTIVE COHORT SIZE: 14 PARTICIPANTS</span>
                  <span>SUPABASE DATALINK: 200 OK</span>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06070B] py-10 text-[10px] font-mono tracking-widest text-slate-600">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 uppercase">
            Designed by Sharleen &copy; {new Date().getFullYear()}
          </div>
          <div className="uppercase">
            [ OffGrid Core Instance &copy; {new Date().getFullYear()}]
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
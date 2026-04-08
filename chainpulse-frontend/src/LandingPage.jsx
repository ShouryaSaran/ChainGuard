import React from 'react';

const LandingPage = ({ onLaunchDemo }) => {
  return (
    <div className="bg-surface text-on-background selection:bg-primary-container selection:text-on-primary-container dark min-h-screen w-full overflow-x-hidden overflow-y-visible">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(6,14,32,0.4)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-[#4cd6ff] uppercase font-headline">ChainPulse</div>
          <div className="hidden md:flex gap-10">
            <a className="font-headline font-bold tracking-tight text-slate-400 hover:text-white transition-colors" href="#features">Features</a>
            <a className="font-headline font-bold tracking-tight text-slate-400 hover:text-white transition-colors" href="#how-it-works">How it Works</a>
            <a className="font-headline font-bold tracking-tight text-slate-400 hover:text-white transition-colors" href="#api-docs">API Docs</a>
          </div>
          <button onClick={onLaunchDemo} className="luminous-button px-6 py-2.5 rounded-lg text-on-primary font-label text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all duration-300">Launch Demo</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-8 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 z-10">
            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
              <span className="font-label text-xs tracking-widest text-primary uppercase">v4.2 Predictive Engine Live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-none mb-6">
              Predict. Prevent. <span className="text-primary">Deliver.</span>
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl mb-10 font-body leading-relaxed">
              The autonomous command center for supply chain resilience. Navigate global disruptions with millisecond-scale ML intelligence.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={onLaunchDemo} className="luminous-button px-8 py-4 rounded-lg text-on-primary font-label text-md font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">View Live Demo</button>
              <button className="bg-surface-container-high hover:bg-surface-bright px-8 py-4 rounded-lg text-white font-label text-md font-bold uppercase tracking-widest transition-all">Read the Docs</button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="relative glass-panel rounded-2xl border border-outline-variant/20 p-4 transform rotate-1 md:rotate-3">
              <img className="rounded-xl w-full h-auto object-cover aspect-square" alt="Futuristic digital 3D globe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7PqjptcdjVdclNjQ9mSLEbVWoD32lxaDnA3CfF8AMss2apw6CR0Th-hmnL2nis_eN0-e7nbj3A8DhxH8xKOVOe5jBZp-pTsrasL84gqhFh5FbSzXRGwnZkt4NzgFayFoB3mecQzBiTwyx76hmUSTxl2qks7z_juJYwlZA_oPcU8aKiONmVHDwXtXabZkWwZlEzFwM9mZrrU1woGNA6R0KxPpzuN3JqONNFhBckXOstxNKxRswyzqqM5BiRNwh6J7mWWUVJimFLHlv" />
              <div className="absolute -bottom-8 -left-8 glass-panel p-6 rounded-xl border border-outline-variant/30 shadow-2xl">
                <div className="font-label text-[10px] text-primary mb-2 tracking-widest uppercase">Global Throughput</div>
                <div className="text-3xl font-headline font-bold">99.98%</div>
                <div className="h-12 w-32 mt-2">
                  <div className="flex items-end gap-1 h-full">
                    <div className="w-2 bg-primary/20 h-4"></div>
                    <div className="w-2 bg-primary/40 h-6"></div>
                    <div className="w-2 bg-primary/60 h-8"></div>
                    <div className="w-2 bg-primary h-10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Risk Monitor */}
      <section id="features" className="py-16 md:py-20 px-8 bg-surface-container-low scroll-mt-28">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-headline font-bold mb-4">Live Risk Monitor</h2>
              <p className="font-label text-sm text-outline tracking-wider uppercase">Socket.io real-time low-latency orchestration</p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-surface-container-high rounded-lg border border-outline-variant/10">
                <span className="font-label text-xs text-on-surface-variant block uppercase">Active Routes</span>
                <span className="text-xl font-headline font-bold text-white">4,821</span>
              </div>
              <div className="px-4 py-2 bg-surface-container-high rounded-lg border border-outline-variant/10">
                <span className="font-label text-xs text-tertiary block uppercase">Alerts</span>
                <span className="text-xl font-headline font-bold text-tertiary">14</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Map Area */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-2 h-[360px] md:h-[430px] lg:h-[480px] relative overflow-hidden group">
              <img
                className="w-full h-full object-contain rounded-xl opacity-75 bg-[#0a1226]"
                alt="Stylized dark mode world map"
                src="/maps/thonduru_midnight_blue_20260408_211952.svg"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-primary/40 animate-ping opacity-20"></div>
              </div>
              {/* Markers Overlay */}
              <div className="absolute top-1/4 left-1/3 p-3 glass-panel rounded-lg border border-primary/30 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary pulse-glow"></div>
                <div>
                  <div className="font-label text-[10px] uppercase text-primary">Shipment CP-092</div>
                  <div className="text-xs font-bold">On-Track • Score 0.02</div>
                </div>
              </div>
              <div className="absolute bottom-1/3 right-1/4 p-3 glass-panel rounded-lg border border-tertiary/30 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-tertiary pulse-glow"></div>
                <div>
                  <div className="font-label text-[10px] uppercase text-tertiary">Shipment CP-881</div>
                  <div className="text-xs font-bold">Port Congestion • Score 0.84</div>
                </div>
              </div>
            </div>
            {/* Risk Feed Area */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-surface-container p-6 rounded-2xl flex-1">
                <h3 className="font-label text-sm uppercase tracking-widest text-primary mb-6">Real-Time Risk Feed</h3>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start pb-6 border-b border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary">tsunami</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-headline font-bold text-sm">Port of Singapore</span>
                        <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded font-label text-[10px] font-bold">0.91 CRITICAL</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Severe tropical storm detected. Potential 18-hour delay for all inbound vessels.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start pb-6 border-b border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary">hub</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-headline font-bold text-sm">Rotterdam Logistics Hub</span>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-label text-[10px] font-bold">0.24 STABLE</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Labor negotiation resolved. Normal operations resumed.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-tertiary">warning</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-headline font-bold text-sm">Suez Canal Inbound</span>
                        <span className="bg-tertiary-container/30 text-tertiary-fixed px-2 py-0.5 rounded font-label text-[10px] font-bold">0.68 WARNING</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Unusual congestion pattern detected via satellite telemetry.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Technology */}
      <section id="how-it-works" className="py-24 px-8 scroll-mt-28">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter mb-4">Neural Architecture</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">psychology</span>
              <h3 className="text-2xl font-headline font-bold mb-4">ML Engine (XGBoost)</h3>
              <p className="text-on-surface-variant font-body leading-relaxed">Our ensemble learning models process historical disruption patterns to predict failures before they manifest physically.</p>
            </div>
            <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">sensors</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Live Ingestion</h3>
              <p className="text-on-surface-variant font-body leading-relaxed">Aggregating 10k+ data points per second from global weather satellites, news APIs, and vessel telemetry.</p>
            </div>
            <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">bolt</span>
              <h3 className="text-2xl font-headline font-bold mb-4">&lt;10s Rerouting</h3>
              <p className="text-on-surface-variant font-body leading-relaxed">When a pulse detects an anomaly, the graph-based rerouting logic calculates optimal paths in under 10 seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disruption Simulator */}
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/20">
                <img className="rounded-lg mb-4 h-40 w-full object-cover" alt="Flood Simulation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8AJxqXOtw5eF_buiN0ZDLk9BAEhy39szZD40HnGhqF-FD_t1VK3xXjkzyHRiBTpdTqUnffhFDi4O1Qh1RR9-uo6jJU1PN-4zEPNF5TIct8X3t-OTh4MF6D73wu889dvkNfuTn_yPCuPZCRG_ULbP_0127LGAo9jEyC3VpK5TRKHeyC3A1F1HIhV9Rm-LfKOAzlMUrZH6430dVr7vfZziYrpnH0UdF-QK614iBheJ6xOBJk-prQr6x2-a2xpDnlc_bL6zBR4waUNf_" />
                <div className="font-label text-xs uppercase tracking-widest text-primary">Flood Simulation</div>
              </div>
              <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/20 mt-8">
                <img className="rounded-lg mb-4 h-40 w-full object-cover" alt="Port Closure" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTUu9lh61pdKFjBG8WuO3EQGI40xFUEGGdl6h_i7cC7-ae_gplrNdfDFWqoR3_dT3xbkOyOLSCpKhFNL2XNnC0dtig8hX2MWGfOjVzxEYRnCEkbRO6ps1MBGjCqUHyqF2kpZJ7616gj9DJW0JzGqYFLN_2mJco2bAAeXlR3mjHEgIlYErsuk-5BP7IycDc6-XQL_YNFxWWmbpxvvXqNTEs1wL1pI3f5GiCytGlWdYmkeoLPEFgL33ItdGJSyoZhTjs7bPZ0dpxGY9K" />
                <div className="font-label text-xs uppercase tracking-widest text-tertiary">Port Closure</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter mb-8">Wargame Your Logistics.</h2>
            <p className="text-xl text-on-surface-variant mb-10 font-body leading-relaxed">
              Don't wait for disaster. Use our high-fidelity simulator to stress-test your supply chain against black swan events like port shutdowns, geopolitical shifts, or climate emergencies.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label text-sm uppercase tracking-wider">Dynamic Monte Carlo Scenarios</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label text-sm uppercase tracking-wider">Financial Impact Forecasting</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label text-sm uppercase tracking-wider">Alternate Vendor Reliability Matrix</span>
              </li>
            </ul>
            <button onClick={onLaunchDemo} className="bg-transparent border-2 border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 rounded-lg font-label text-md font-bold uppercase tracking-widest transition-all">Start Simulator</button>
          </div>
        </div>
      </section>

      {/* Tech Stack & API */}
      <section id="api-docs" className="py-24 px-8 border-t border-outline-variant/10 scroll-mt-28">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-headline font-bold mb-6">Developer First Architecture</h2>
              <p className="text-on-surface-variant font-body mb-8">Built for scale, speed, and seamless integration. ChainPulse exposes a robust FastAPI backbone with comprehensive Swagger documentation.</p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">api</span>
                  <span className="font-label font-bold text-sm tracking-widest">FASTAPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">database</span>
                  <span className="font-label font-bold text-sm tracking-widest">SUPABASE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">javascript</span>
                  <span className="font-label font-bold text-sm tracking-widest">NEXT.JS</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-surface-container-highest p-8 rounded-2xl border border-outline-variant/30 font-mono text-sm shadow-2xl">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-error/40"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
                <div className="w-3 h-3 rounded-full bg-primary/40"></div>
              </div>
              <pre className="text-on-surface-variant overflow-x-auto">
                <span className="text-primary">GET</span> /v1/routes/risk-assessment{'\n'}
                <span className="text-secondary">{'{'}{'\n'}</span>
                {'  '}<span className="text-primary">"origin"</span>: <span className="text-tertiary">"SGP"</span>,{'\n'}
                {'  '}<span className="text-primary">"destination"</span>: <span className="text-tertiary">"RTM"</span>,{'\n'}
                {'  '}<span className="text-primary">"active_simulation"</span>: <span className="text-white">true</span>{'\n'}
                <span className="text-secondary">{'}'}</span>{'\n\n'}
                <span className="text-primary">RESPONSE 200 OK</span>{'\n'}
                <span className="text-secondary">{'{'}{'\n'}</span>
                {'  '}<span className="text-primary">"risk_score"</span>: <span className="text-white">0.084</span>,{'\n'}
                {'  '}<span className="text-primary">"primary_threat"</span>: <span className="text-tertiary">null</span>,{'\n'}
                {'  '}<span className="text-primary">"status"</span>: <span className="text-white">"Optimal"</span>{'\n'}
                <span className="text-secondary">{'}'}</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-6"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-8">Ready to fortify your supply chain?</h2>
          <p className="text-xl text-on-surface-variant mb-12 font-body max-w-2xl mx-auto">Join the world's most resilient logistics networks using ChainPulse's predictive intelligence core.</p>
          <button onClick={onLaunchDemo} className="luminous-button px-12 py-6 rounded-lg text-on-primary font-label text-lg font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-2xl">Launch Predictive Platform</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b1326] w-full border-t border-[#424656]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8 py-16 max-w-screen-2xl mx-auto">
          <div className="col-span-1 lg:col-span-1">
            <div className="text-lg font-bold text-white font-headline mb-6 uppercase tracking-tighter">ChainPulse</div>
            <p className="text-slate-500 font-label text-sm uppercase tracking-widest leading-relaxed">© 2024 ChainPulse AI. Predictive Intelligence for Global Logistics.</p>
          </div>
          <div>
            <h4 className="font-label text-white text-xs font-bold uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a className="font-label text-sm uppercase tracking-widest text-slate-500 hover:text-[#4cd6ff] transition-colors" href="#">Documentation</a></li>
              <li><a className="font-label text-sm uppercase tracking-widest text-slate-500 hover:text-[#4cd6ff] transition-colors" href="#">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-white text-xs font-bold uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a className="font-label text-sm uppercase tracking-widest text-slate-500 hover:text-[#4cd6ff] transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="font-label text-sm uppercase tracking-widest text-slate-500 hover:text-[#4cd6ff] transition-colors" href="#">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-white text-xs font-bold uppercase tracking-widest mb-6">Engineering</h4>
            <p className="text-slate-500 font-label text-sm uppercase tracking-widest">Stack: Next.js + Tailwind + AI Core</p>
            <div className="mt-6 flex gap-4">
              <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors">hub</span>
              <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors">terminal</span>
              <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors">monitoring</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

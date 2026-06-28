import React from "react";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-fuchsia-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10 text-zinc-300 space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-zinc-500 font-mono text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-lg leading-relaxed font-light">
          <p>
            Welcome to FirstNote Architecture. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">1. Acceptance of Terms</h2>
          <p>
            By accessing our website and using our interactive tools (including the Piano Sandbox, Guitar Toolkit, and Theory Library), you agree to comply with these terms. If you do not agree, please do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">2. User Conduct</h2>
          <p>
            You agree to use our platform for lawful purposes only. You must not use our tools to distribute malicious software, spam, or engage in any activity that disrupts the service for other users.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">3. Intellectual Property</h2>
          <p>
            The design, code, architecture, and educational content provided on FirstNote are the intellectual property of FirstNote Architecture. You may not copy, reproduce, or distribute our proprietary content without explicit permission.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">4. Disclaimer of Warranties</h2>
          <p>
            FirstNote is provided "as is" without any warranties, express or implied. While we strive to provide accurate music theory tools, we do not guarantee that the service will be error-free or uninterrupted.
          </p>
        </div>
      </div>
    </main>
  );
}

import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10 text-zinc-300 space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-zinc-500 font-mono text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-lg leading-relaxed font-light">
          <p>
            At FirstNote Architecture, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our interactive music theory platform and tools.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when creating an account, saving chord progressions, or interacting with our toolset. This may include your email address, username, and usage data to improve your experience.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">2. How We Use Your Information</h2>
          <p>
            Your information is used to personalize your experience, synchronize your saved progressions across devices, and improve our algorithms. We do not sell your personal data to third parties.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to ensure your data is protected against unauthorized access, alteration, or destruction. Our platform uses secure, encrypted connections for all data transmission.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. If you have any questions or requests regarding your data, please contact our support team.
          </p>
        </div>
      </div>
    </main>
  );
}

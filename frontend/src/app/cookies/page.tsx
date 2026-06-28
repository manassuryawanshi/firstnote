import React from "react";

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10 text-zinc-300 space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Cookie Policy</h1>
          <p className="text-zinc-500 font-mono text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-lg leading-relaxed font-light">
          <p>
            This Cookie Policy explains how FirstNote Architecture uses cookies and similar technologies to recognize you when you visit our platform.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">1. What are Cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for several reasons. Some cookies are required for technical reasons in order for our tools (like the Grand Tour tutorial and instrument state) to operate, and we refer to these as "essential" or "strictly necessary" cookies. 
          </p>
          <p>
            For example, we use `localStorage` and `sessionStorage` to remember if you've completed the tutorial so you aren't repeatedly prompted.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">3. Third-Party Cookies</h2>
          <p>
            We do not currently use third-party tracking or advertising cookies on our platform. Your musical journey remains private.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">4. Managing Cookies</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your web browser controls to accept or refuse cookies.
          </p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                <span className="text-xs font-bold text-white">GH</span>
              </div>
              <span className="font-display text-white">
                Golf <span className="text-emerald-400">Heroes</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Combining golf performance, monthly prize draws, and meaningful charity contributions.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Platform
            </h3>
            <ul className="space-y-3">
              {[
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Monthly Draw", href: "/draw" },
                { label: "Charities", href: "/charities" },
                { label: "Subscribe", href: "/subscribe" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Account
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Sign Up", href: "/signup" },
                { label: "Sign In", href: "/login" },
                { label: "Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/60 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Golf Heroes. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built with care for golfers and good causes.
          </p>
        </div>
      </div>
    </footer>
  );
}

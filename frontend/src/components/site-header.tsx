"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Nexvora Digital Solutions home" onClick={() => setOpen(false)}>
          <span className="brand-mark">n<span>✳</span></span><span className="brand-copy">nexvora<small>DIGITAL SOLUTIONS</small></span>
        </Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><span /><span /></button>
        <nav className={open ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} className={pathname === link.href ? "nav-link nav-active" : "nav-link"} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link className="header-cta" href="/contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}

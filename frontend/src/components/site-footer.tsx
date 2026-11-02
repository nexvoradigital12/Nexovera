import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

async function CurrentYear() {
  await connection();
  return new Date().getFullYear();
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand"><Link className="brand footer-logo" href="/"><span className="brand-mark">n<span>✳</span></span><span className="brand-copy">nexvora<small>DIGITAL SOLUTIONS</small></span></Link><p>Ideas in motion.<br />Digital with direction.</p></div>
        <div className="footer-column"><span className="footer-label">Explore</span><Link href="/services">Services</Link><Link href="/portfolio">Selected work</Link><Link href="/blog">Blog</Link><Link href="/about">About Nexvora</Link></div>
        <div className="footer-column"><span className="footer-label">Say hello</span><Link href="/contact">Start a project ↗</Link><a href="mailto:hello@nexvora.com">hello@nexvora.com</a><span>Working everywhere, thoughtfully.</span></div>
      </div>
      <div className="footer-bottom"><span>© <Suspense fallback={null}><CurrentYear /></Suspense> Nexvora Digital Solutions</span><span>Made for what’s next <span className="footer-spark">✳</span></span><Link href="/admin">Admin</Link></div>
    </footer>
  );
}

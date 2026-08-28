'use client'

import { useEffect, useRef } from 'react'

const wordmark = 'FRESCO'

const navItems = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Passport', href: '/#passport' },
  { label: 'Opportunity', href: '/#opportunity' },
]

const links = [
  { label: 'How It Works', href: '/#how' },
  { label: 'Stories', href: '/#stories' },
  { label: 'The Harvest Letter', href: '/#newsletter' },
  { label: 'Sign In', href: '/auth/login' },
]

export function LandingFooter() {
  const wordmarkSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const section = wordmarkSectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          section.classList.toggle('in-view', entry.isIntersecting)
        })
      },
      { threshold: 0.35 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-nav">
          <h1>
            {navItems.map((item, index) => (
              <a key={item.label} href={item.href}>
                {item.label}
                {index < navItems.length - 1 && <br />}
              </a>
            ))}
          </h1>
          <div className="footer-links">
            {links.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-image" role="img" aria-label="Decorative gradient of the economic thread" />
      </div>

      <div className="footer-wordmark-section" ref={wordmarkSectionRef}>
        <div className="footer-wordmark">
          {Array.from(wordmark).map((char, index) => (
            <span key={index} className="letter-mask">
              <span className="letter" style={{ '--i': index } as React.CSSProperties}>
                {char}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="col">
          <a href="mailto:hello@fresco.ng">HELLO@FRESCO.NG</a>
        </div>
        <div className="col">
          <span>IKORODU, LAGOS</span>
          <span>NIGERIA</span>
        </div>
        <div className="col">
          <span>WEMA AGRI-FINANCE</span>
          <span>PROTOCOL · 2026</span>
        </div>
        <div className="login-group">
          <span className="corner c-tl" aria-hidden="true" />
          <span className="corner c-tr" aria-hidden="true" />
          <span className="corner c-bl" aria-hidden="true" />
          <span className="corner c-br" aria-hidden="true" />
          <a href="/farmer/login">Farmer Login</a>
          <a href="/consumer/login">Consumer Login</a>
          <a href="/wema/login">Wema Login</a>
        </div>
      </div>
    </footer>
  )
}
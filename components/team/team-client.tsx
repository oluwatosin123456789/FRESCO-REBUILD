'use client'

import { motion } from 'framer-motion'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

const TEAM_MEMBERS = [
  {
    name: 'Tobi Alabi',
    role: 'Founder & Chief Executive Officer',
    specialty: 'Product Architecture · Institutional Strategy',
    portrait: '/assets/analyst-portrait.svg',
  },
  {
    name: 'Chinedu Okafor',
    role: 'Co-Founder & Chief Technology Officer',
    specialty: 'Computer Vision AI · Distributed Systems',
    portrait: '/assets/logistics-portrait.svg',
  },
  {
    name: 'Fatima Bello',
    role: 'Co-Founder & Head of Operations',
    specialty: 'Agricultural Supply Chain · Cooperatives',
    portrait: '/assets/cooperative-portrait.svg',
  },
]

export function TeamClient() {
  return (
    <div className="min-h-screen bg-[#F3EFE5] text-[#171713] font-sans antialiased">
      <LandingHeader />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20">
        <section className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <p className="eyebrow">The Team</p>
          <h1 className="mt-4 text-4xl sm:text-6xl font-serif tracking-tight leading-[1.05]">
            Three people behind <em className="italic text-[#2D4739]">Fresco</em>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#68665E] leading-relaxed">
            The architects turning verified harvests into financial identity.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.figure
              key={member.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative m-0 rounded-[20px] overflow-hidden border border-[#D9D0C3] bg-[#FBF9F3] shadow-[0_1px_2px_rgba(23,23,19,.05),0_10px_30px_rgba(23,23,19,.07)] hover:shadow-[0_24px_48px_rgba(23,23,19,.16)] transition-shadow duration-300"
            >
              {/* Portrait — a real <img> slot for a headshot, compact on large screens */}
              <div className="relative w-full overflow-hidden bg-[#E8E0D0]" style={{ aspectRatio: '4 / 3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> slot so a real photo can drop in */}
                <img
                  src={member.portrait}
                  alt={`Portrait of ${member.name}`}
                  loading="lazy"
                  className="w-full h-full object-cover object-[center_28%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[.28em] text-white/80 uppercase bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  №{String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Name + role */}
              <figcaption className="p-5 text-center">
                <h2 className="font-serif text-2xl tracking-tight text-[#171713]">{member.name}</h2>
                <p className="mt-1.5 text-sm font-semibold text-[#2D4739]">{member.role}</p>
                <p className="mt-2 text-xs text-[#8C8C7A] font-mono">{member.specialty}</p>
              </figcaption>
            </motion.figure>
          ))}
        </section>
      </main>

      {/* Orange pre-footer section — smooth bridge into the footer, like the
          Harvest Letter → footer demarcation on the landing page. */}
      <section className="team-cta">
        <div className="team-cta-inner">
          <p className="eyebrow">The Fresco Protocol</p>
          <h2>Turning everyday produce into verifiable financial power</h2>
          <p>
            Fresco is built in the open — join the farmers, buyers and institutions shaping
            verified agricultural commerce.
          </p>
          <div className="team-cta-actions">
            <a href="/marketplace">Explore the marketplace</a>
            <a href="mailto:hello@fresco.ng">Talk to the team</a>
          </div>
        </div>
      </section>

      {/* Footer with an orange demarcation so it reads as distinct on the shared canvas background */}
      <div className="team-footer">
        <LandingFooter />
      </div>
    </div>
  )
}
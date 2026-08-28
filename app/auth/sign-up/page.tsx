import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ROLE_AUTH_CONFIG, type RoleKey } from '@/components/auth/role-auth-config'

const ROLES: RoleKey[] = ['farmer', 'consumer', 'wema']

export default function SignUpHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3efe5] font-sans antialiased">
      <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-[#d6cebe]">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#68665e] hover:text-[#171713] transition-colors">
          <ArrowLeft size={13} /> Back to landing
        </Link>
        <div className="flex items-center gap-2 text-[10.5px] font-mono text-[#8c8c7a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] animate-pulse" />
          Workspace onboarding
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#315642 0%,#4a6b52 100%)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V12M12 12C12 12 8 10 5 5c4 1 7 3 7 7zM12 12c0 0 4-2 7-7-4 1-7 3-7 7z" />
              </svg>
            </div>
            <div>
              <div className="font-serif text-[20px] text-[#171713] leading-none">
                fres<span className="text-[#ae4938]">co</span>
              </div>
              <div className="text-[9.5px] font-mono uppercase tracking-[0.14em] text-[#8c8c7a] mt-1">Agricultural Commerce</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-[#8c8c7a] whitespace-nowrap">
              Select Workspace Role
            </span>
            <div className="flex-1 h-px bg-[#d6cebe]" />
          </div>

          <h1 className="font-serif text-[34px] sm:text-[40px] leading-[1.06] tracking-tight text-[#171713] mb-2">
            Create your account
          </h1>
          <p className="text-[14px] text-[#68665e] leading-relaxed mb-8">
            Join the workspace that fits how you use Fresco — verified commerce that builds financial identity.
          </p>

          <div className="space-y-3">
            {ROLES.map((roleKey) => {
              const cfg = ROLE_AUTH_CONFIG[roleKey]
              const RoleIcon = cfg.icon
              return (
                <Link
                  key={roleKey}
                  href={cfg.signupPath}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-[1.5px] border-[#d6cebe] bg-[#fbf8f1] text-left transition-all duration-200 hover:border-[#b9b09f] hover:bg-white hover:scale-[1.005]"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: cfg.iconBg }}>
                    <RoleIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-[#171713]">{cfg.workspace}</div>
                    <div className="text-[11.5px] text-[#8c8c7a] truncate mt-0.5">{cfg.roleLabel}</div>
                  </div>
                  <ArrowRight size={16} className="text-[#b9b09f] group-hover:text-[#171713] group-hover:translate-x-1 transition-all" />
                </Link>
              )
            })}
          </div>

          <p className="mt-6 text-center text-[12.5px] text-[#8c8c7a]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#315642] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-4 border-t border-[#d6cebe] text-center text-[10.5px] text-[#8c8c7a] font-mono tracking-wide">
        Fresco Agricultural Commerce Protocol · Institutional Credit Intelligence · Wema Bank PLC
      </div>
    </div>
  )
}
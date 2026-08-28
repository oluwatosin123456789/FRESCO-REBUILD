// Shared styling for every role auth surface (login, signup, reset).
export const ROLE_AUTH_CSS = `
.roleauth-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: #05060a;
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
.roleauth-shell {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 640px;
  overflow: hidden;
  background: #05060a;
  isolation: isolate;
}
.roleauth-panel {
  position: absolute;
  inset-block: 0;
  width: 50%;
  will-change: transform;
  transition: transform 900ms cubic-bezier(.77,0,.18,1), box-shadow 900ms cubic-bezier(.77,0,.18,1);
}
.roleauth-form-panel {
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px clamp(28px, 7vw, 110px);
  overflow-y: auto;
  /* No card, no moulded edges — a broad luminous bloom keeps every line of the
     form readable while the holographic beams flow in at the panel's edges */
  background: radial-gradient(
    ellipse 120% 128% at 50% 50%,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(255, 255, 255, 0.88) 52%,
    rgba(255, 255, 255, 0.72) 78%,
    rgba(255, 255, 255, 0.4) 94%,
    rgba(255, 255, 255, 0) 100%
  );
}
.roleauth-form-panel::before,
.roleauth-form-panel::after {
  content: none;
}
.roleauth-orb {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(52px);
  will-change: transform;
  animation: roleauth-drift 14s ease-in-out infinite;
}
.roleauth-orb.one {
  width: 440px;
  height: 440px;
  left: -6%;
  top: -10%;
  background: radial-gradient(circle, var(--roleauth-glow-orb) 0%, transparent 66%);
}
.roleauth-orb.two {
  width: 400px;
  height: 400px;
  right: -8%;
  bottom: -12%;
  background: radial-gradient(circle, var(--roleauth-glow-orb2) 0%, transparent 66%);
  animation-delay: -7s;
  animation-duration: 18s;
}
@keyframes roleauth-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(22px, -18px) scale(1.08); }
}
.roleauth-form-wrap {
  position: relative;
  z-index: 1;
  width: min(100%, 440px);
  /* No floating card — the form lives directly on the beams' luminous bloom */
}
.roleauth-visual-panel {
  right: 0;
  z-index: 4;
  overflow: hidden;
  background: linear-gradient(150deg, #1a2e22 0%, #0d1a12 100%);
}
.roleauth-visual-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, var(--roleauth-top) 0%, transparent 30%),
    linear-gradient(0deg, var(--roleauth-bottom) 0%, transparent 32%);
}
.roleauth-visual-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  animation: roleauth-zoom 18s ease-in-out infinite alternate;
}
.roleauth-shell.signup .roleauth-form-panel { transform: translateX(100%); box-shadow: inset -18px 0 35px rgba(0,0,0,.03); }
.roleauth-shell.signup .roleauth-visual-panel { transform: translateX(-100%); box-shadow: 18px 0 42px rgba(0,0,0,.12); }
.roleauth-shell:not(.signup) .roleauth-visual-panel { box-shadow: -18px 0 42px rgba(0,0,0,.10); }

/* visual panel content */
.roleauth-visual-brand {
  position: absolute;
  top: 28px;
  left: 8%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 11px;
  color: #fff;
}
.roleauth-visual-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.14);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,.22);
}
.roleauth-visual-wordmark {
  font-family: var(--font-dm-serif), Georgia, serif;
  font-size: 20px;
  letter-spacing: .01em;
}
.roleauth-visual-badge {
  position: absolute;
  top: 28px;
  right: 8%;
  z-index: 2;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.24);
  backdrop-filter: blur(6px);
  padding: 7px 13px;
  border-radius: 999px;
}
.roleauth-visual-copy {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 11%;
  z-index: 2;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 13px;
  text-shadow: 0 2px 18px rgba(0,0,0,.3);
}
.roleauth-visual-copy p {
  margin: 0;
  font-family: var(--font-dm-serif), Georgia, serif;
  font-size: clamp(26px, 2.5vw, 42px);
  line-height: 1.05;
  letter-spacing: -.02em;
}
.roleauth-visual-copy > span {
  font-size: 13.5px;
  color: rgba(255,255,255,.84);
  font-weight: 500;
  max-width: 40ch;
}
.roleauth-visual-controls {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}
.roleauth-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.85);
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(6px);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease;
}
.roleauth-circle:hover { transform: translateY(-2px); background: rgba(255,255,255,.18); }

/* back link */
.roleauth-back {
  position: absolute;
  top: 24px;
  left: clamp(24px, 6vw, 96px);
  z-index: 5;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(23, 23, 19, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #171713;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.roleauth-back:hover {
  transform: translateX(-2px);
  background: #fff;
  border-color: rgba(23, 23, 19, 0.2);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.32);
}

/* form */
.roleauth-form { text-align: left; }
.roleauth-title {
  margin: 0 0 8px;
  text-align: center;
  font-family: var(--font-dm-serif), Georgia, serif;
  font-size: clamp(38px, 3.4vw, 54px);
  line-height: 1;
  letter-spacing: -.03em;
  font-weight: 400;
  color: #171713;
}
.roleauth-eyebrow {
  margin: 0 0 40px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #8a8a90;
}
.roleauth-field { margin-bottom: 20px; }
.roleauth-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}
.roleauth-avatar-preview {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #f0ece3 center/cover no-repeat;
  border: 1px solid rgba(23, 23, 19, 0.1);
  display: grid;
  place-items: center;
  color: #9a968c;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}
.roleauth-avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.roleauth-avatar-label {
  font-size: 12px;
  font-weight: 700;
  color: #1d1d20;
}
.roleauth-avatar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.roleauth-avatar-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(23, 23, 19, 0.12);
  background: #f7f4ed;
  color: #1d1d20;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.roleauth-avatar-btn:hover {
  background: #fff;
  border-color: rgba(23, 23, 19, 0.28);
}
.roleauth-avatar-btn.ghost {
  background: transparent;
  border-color: transparent;
  color: #8c8c92;
}
.roleauth-avatar-btn.ghost:hover {
  color: #c0392b;
  background: transparent;
}
.roleauth-field label {
  display: block;
  margin: 0 0 9px;
  font-size: 12px;
  font-weight: 700;
  color: #1d1d20;
}
.roleauth-control { position: relative; }
.roleauth-control input {
  width: 100%;
  height: 58px;
  padding: 0 52px 0 20px;
  border: 0;
  outline: 0;
  border-radius: 12px;
  background: #f7f4ed;
  color: #141419;
  font-size: 15px;
  box-shadow: inset 0 0 0 1px rgba(18,18,26,.1);
  transition: box-shadow .2s ease, transform .2s ease;
}
.roleauth-control input:focus { box-shadow: 0 0 0 3px var(--roleauth-ring); }
.roleauth-control input::placeholder { color: #acadb3; }
.roleauth-password-toggle {
  position: absolute;
  right: 17px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: #999aa1;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: color .2s ease;
}
.roleauth-password-toggle:hover { color: #3f3f45; }
.roleauth-meta {
  display: flex;
  justify-content: flex-end;
  margin: 2px 0 28px;
}
.roleauth-text-link {
  color: #8c8c92;
  font-size: 12px;
  text-decoration: none;
  transition: color .2s ease;
}
.roleauth-text-link:hover { color: #1a1a1f; }
.roleauth-primary {
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 12px;
  background: var(--roleauth-accent);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -.01em;
  cursor: pointer;
  box-shadow: 0 10px 24px var(--roleauth-shadow);
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease, opacity .2s ease;
}
.roleauth-primary:hover { transform: translateY(-1px); background: var(--roleauth-accent-dark); box-shadow: 0 14px 28px var(--roleauth-shadow); }
.roleauth-primary:disabled { opacity: .6; cursor: default; transform: none; }
.roleauth-or {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  margin: 38px 0 28px;
  color: #93939a;
  font-size: 13px;
}
.roleauth-or::before,
.roleauth-or::after { content: ""; height: 1px; background: rgba(23,23,19,.08); }
.roleauth-socials {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.roleauth-social {
  height: 58px;
  border: 1px solid rgba(23,23,19,.1);
  border-radius: 11px;
  background: #f7f4ed;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
}
.roleauth-social:hover {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 8px 18px rgba(0,0,0,.1);
}
.roleauth-demo-hint {
  margin: 14px 0 0;
  text-align: center;
  font-size: 11px;
  color: #9b9ba1;
}
.roleauth-demo-hint strong { color: #6d6d73; font-weight: 600; }
.roleauth-switch-line {
  margin-top: 26px;
  text-align: center;
  font-size: 13px;
  color: #8f9096;
}
.roleauth-switch-link {
  position: relative;
  color: #1b1b1f;
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
  cursor: pointer;
}
.roleauth-switch-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 1px;
  transform: scaleX(0);
  transform-origin: left;
  background: currentColor;
  transition: transform .25s ease;
}
.roleauth-switch-link:hover::after { transform: scaleX(1); }
.roleauth-mini-note {
  margin-top: 16px;
  text-align: center;
  color: #9b9ba1;
  font-size: 11px;
  line-height: 1.5;
}
.roleauth-alert {
  margin: 12px 0 0;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #f5c4c7;
  border-radius: 10px;
  padding: 9px 12px;
}
.roleauth-success {
  margin: 12px 0 0;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #2e8b57;
  background: #e8f4ea;
  border: 1px solid #c9e6cf;
  border-radius: 10px;
  padding: 9px 12px;
}

@keyframes roleauth-zoom {
  from { transform: scale(1); }
  to { transform: scale(1.07); }
}
@keyframes roleauth-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .roleauth-page,
  .roleauth-shell {
    background: #ffffff;
  }
  .roleauth-shell {
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
  }
  /* Plain white on small screens — no beams, no visual band, just the form */
  .roleauth-beams {
    display: none;
  }
  .roleauth-panel {
    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
    transform: none !important;
    box-shadow: none !important;
  }
  .roleauth-visual-img,
  .roleauth-visual-panel {
    display: none;
  }
  .roleauth-form-panel {
    order: 2;
    flex: 1;
    padding: 40px 24px 46px;
    background: #ffffff;
  }
  .roleauth-shell.signup { flex-direction: column-reverse; }
  .roleauth-back { top: 20px; }
  .roleauth-visual-brand { top: 20px; }
  .roleauth-visual-badge { top: 20px; }
  .roleauth-eyebrow { margin-bottom: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .roleauth-shell *,
  .roleauth-shell *::before,
  .roleauth-shell *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`

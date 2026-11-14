// The one injected stylesheet. Chrome is inline cssText built from tokens;
// this holds only what inline styles cannot express: :hover, :focus-visible,
// :disabled, media queries, ::after, scrollbars and motion. Elements opt in
// with `data-ui` hook names (ui() in dom.ts), never hand-typed.
//
// Hook rules that must beat inline cssText (hover, disabled, breakpoints,
// card tables) and the hidden attribute carry !important; nothing else does.

import { C, T, alpha } from './tokens.js';

const kebab = (k: string): string => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

function css(): string {
  const vars = Object.entries(C).map(([k, v]) => `--${kebab(k)}:${v}`).join(';');
  const capsText = `font:${T.cap};text-transform:uppercase;letter-spacing:.06em`;
  return [
    // Root
    `:root{${vars};color-scheme:dark}`,
    `*,*::before,*::after{box-sizing:border-box}`,
    // The hidden attribute wins over any inline display.
    `[hidden]{display:none!important}`,
    `#app{height:100vh;height:100dvh}`,
    // A table's frame (its section's border) closes it: the last row's own
    // rule would draw a second line under it.
    `[data-ui~=table] tbody tr:last-child>td{border-bottom:0}`,
    `body{margin:0;background:var(--bg);color:var(--text);font:${T.md};-webkit-text-size-adjust:100%}`,

    // Focus: buttons and links get an outline ring, inputs a border colour.
    `button:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--link);outline-offset:1px;border-radius:0}`,
    `input:focus-visible,textarea:focus-visible,select:focus-visible{outline:none;border-color:var(--link)!important}`,
    `input::placeholder,textarea::placeholder{color:var(--muted);opacity:1}`,
    // The outlet takes focus after an in-app navigation (the app's router); no ring.
    `main[tabindex="-1"]:focus-visible{outline:none}`,
    `[data-ui~=rowlink]:focus-visible{outline-offset:-2px}`,

    // Hover, only where there is a hovering pointer.
    `@media (hover:hover){` +
      `[data-ui~=cmd]:hover:not([aria-pressed=true]):not(:disabled){background:var(--surface)!important;border-color:var(--border)!important}` +
      `[data-ui~=hover_bg]:hover{background:var(--surface)!important}` +
      `[data-ui~=hover_bd]:hover:not(:disabled):not([aria-pressed=true]){border-color:var(--muted)!important}` +
      `[data-ui~=row]:hover{background:var(--surface)}` +
      `[data-variant=primary]:hover:not(:disabled){border-color:var(--link)!important}` +
      `[data-variant=ghost]:hover:not(:disabled){color:var(--text)!important;background:var(--surface)!important}` +
      `[data-variant=danger]:hover:not(:disabled){background:${alpha(C.err, 0.12)}!important}` +
      `[data-variant=inline]:hover:not(:disabled){color:var(--text)!important}` +
      `[data-ui~=menuitem]:hover:not(:disabled){background:var(--surface)!important}` +
    `}`,
    // Joined groups: the hovered or focused child draws its whole border.
    `[role=group]>:hover,[role=group]>:focus-visible,[role=radiogroup]>:hover,[role=radiogroup]>:focus-visible{position:relative;z-index:1}`,

    // Disabled
    `[data-ui~=ctl]{cursor:pointer}`,
    `[data-ui~=ctl]:disabled,[data-ui~=ctl][aria-disabled=true]{opacity:.5;cursor:default!important}`,

    // Stretched row link; `above` lifts interactive cells over the overlay.
    `[data-ui~=row]{position:relative}`,
    `[data-ui~=rowlink]::after{content:'';position:absolute;inset:0}`,
    `[data-ui~=above]{position:relative;z-index:1}`,

    // Touch: bigger hit targets without changing desktop layout.
    `@media (pointer:coarse){` +
      `[data-ui~=ctl]{min-height:32px}` +
      `[data-ui~=ctl][data-size=md]{min-height:36px}` +
      `[data-ui~=ctl][data-size=lg]{min-height:44px}` +
      `[data-ui~=ctl][data-variant=inline]{min-height:0}` +
      `input,select,textarea{font-size:16px!important}` +
    `}`,

    // Breakpoints: sm up to 639, md 640 to 959, lg 960 and up.
    `@media (max-width:639px){` +
      `[data-ui~=hide_sm]{display:none!important}` +
      `[data-ui~=stack_sm]{flex-direction:column!important;align-items:stretch!important}` +
      `[data-ui~=side_sm]{width:auto!important;height:45%;border-left:0!important;border-top:1px solid var(--line)}` +
      // Tables as two-line cards: title and end on line 1, sub and meta on line 2.
      `[data-ui~=cards_sm] thead{display:none!important}` +
      `[data-ui~=cards_sm] table,[data-ui~=cards_sm] tbody{display:block!important}` +
      `[data-ui~=cards_sm] tr{display:flex!important;flex-wrap:wrap;align-items:baseline;column-gap:8px;row-gap:2px;padding:8px 12px;min-height:56px;height:auto!important}` +
      `[data-ui~=cards_sm] tr::after{content:'';order:3;flex-basis:100%;height:0}` +
      `[data-ui~=cards_sm] td{display:block!important;padding:0!important;height:auto!important;border-left:0!important;border-bottom:0!important}` +
      `[data-ui~=cards_sm] tr{border-bottom:1px solid var(--line);border-left:3px solid var(--rule,transparent)}` +
      `[data-ui~=cards_sm] td[data-card=title]{order:1;flex:1 1 0;min-width:0;font:${T.h2};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}` +
      `[data-ui~=cards_sm] td[data-card=end]{order:2;margin-left:auto;text-align:right!important}` +
      `[data-ui~=cards_sm] td[data-card=sub]{order:4;flex:1 1 0;min-width:0;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}` +
      `[data-ui~=cards_sm] td[data-card=meta]{order:5;color:var(--muted);text-align:right!important}` +
      `[data-ui~=cards_sm] td[data-card=hide],[data-ui~=cards_sm] td:not([data-card]){display:none!important}` +
      // Key-value grids stack the key above the value.
      `[data-ui~=kv] dl{grid-template-columns:minmax(0,1fr)!important}` +
      `[data-ui~=kv] dt{border-right:0!important;border-bottom:0!important;min-height:0!important;padding-bottom:0!important;${capsText}}` +
      `[data-ui~=num_sm]{font-size:15px!important}` +
    `}`,
    `@media (min-width:640px){[data-ui~=show_sm]{display:none!important}}`,
    `@media (max-width:959px){[data-ui~=hide_md]{display:none!important}}`,
    `@media (min-width:960px){[data-ui~=grid2_lg]{display:grid!important;grid-template-columns:1fr 1fr;gap:16px}}`,

    // Scrollbars
    `[data-ui~=scroll_x]{overflow-x:auto;scrollbar-width:thin}`,

    // Keyframes. 
    `@keyframes spin{to{transform:rotate(360deg)}}`,
    `@keyframes pulse{from{opacity:.5}to{opacity:1}}`,
    `@keyframes fade-up{from{opacity:0;transform:translateY(6px)}}`,
    `@keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(340%)}}`,
    // Reduced motion collapses decorative animation; spinners keep spinning.
    `@media (prefers-reduced-motion:reduce){[data-anim]{animation-duration:.01ms!important;animation-iteration-count:1!important}}`,
  ].join('\n');
}

let mounted = false;

/** Inject the stylesheet once, with an app's own rules (`extra`, its pages'
 *  hooks) after it. Idempotent; the app calls it at start. */
export function mountStyles(...extra: string[]): void {
  if (mounted) return;
  mounted = true;
  const s = document.createElement('style');
  s.textContent = css() + extra.join('');
  document.head.appendChild(s);
}

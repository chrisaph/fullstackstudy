import type { ReactNode } from 'react'

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-line bg-card p-5 ${className}`}>{children}</div>
)
export const Title = ({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) => (
  <header className="mb-8 max-w-2xl">
    <p className="font-mono text-xs uppercase tracking-widest text-accent">{kicker}</p>
    <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
    {sub && <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{sub}</p>}
  </header>
)
export const Btn = ({ children, onClick, kind = 'primary', type = 'button', disabled, className = '' }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost'; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) => (
  <button type={type} disabled={disabled} onClick={onClick}
    className={`min-h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-40 ${kind === 'primary' ? 'bg-ink text-paper hover:bg-accent' : 'border border-line bg-card hover:border-ink'} ${className}`}>
    {children}
  </button>
)
export const Bar = ({ value, color = 'bg-accent' }: { value: number; color?: string }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-line/60" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
    <div className={`h-full ${color} transition-all`} style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
)

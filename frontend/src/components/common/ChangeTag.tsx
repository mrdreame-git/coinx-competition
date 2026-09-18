import { CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr'
import { formatPct } from '@/lib/format'

interface ChangeTagProps {
  /** Percent change, signed by the caller's data (1.24 means +1.24%). */
  value: number
  /** "sm" for table rows, "md" for tiles, "lg" for price headers. */
  size?: 'sm' | 'md' | 'lg'
  /** Show the caret glyph beside the number. */
  caret?: boolean
  className?: string
}

const SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg font-semibold',
} as const

/**
 * Percentage change with a real icon rather than a text arrow. Colour is
 * semantic (long/short), never a decorative accent.
 */
export default function ChangeTag({
  value,
  size = 'md',
  caret = true,
  className = '',
}: ChangeTagProps) {
  const positive = value >= 0
  const Caret = positive ? CaretUp : CaretDown

  return (
    <span
      className={`num inline-flex items-center gap-1 ${SIZES[size]} ${className}`}
      style={{ color: positive ? 'var(--color-long)' : 'var(--color-short)' }}
    >
      {caret && <Caret size={size === 'lg' ? 16 : 11} weight="bold" aria-hidden />}
      {formatPct(value)}
    </span>
  )
}

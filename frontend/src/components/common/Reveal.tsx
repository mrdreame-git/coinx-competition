'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

interface RevealProps {
  children: ReactNode
  /** Seconds of delay. Used to sequence a small group, not to decorate. */
  delay?: number
  /** Travel distance in px. */
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Reveals a block once as it enters the viewport. The motion communicates
 * hierarchy on first scroll, and collapses to a plain element when the visitor
 * has asked for reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]

  if (reduce) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/** Staggered list. Parent and children must share this client tree. */
export function RevealList({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()

  if (reduce) return <ul className={className}>{children}</ul>

  return (
    <motion.ul
      className={className}
      variants={LIST_VARIANTS}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.ul>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()

  if (reduce) return <li className={className}>{children}</li>

  return (
    <motion.li variants={ITEM_VARIANTS} className={className}>
      {children}
    </motion.li>
  )
}

import { motion } from 'framer-motion'

/** Fades and lifts content in once when it scrolls into view. */
export default function Reveal({ children, delay = 0, y = 28, as = 'div', className, ...rest }) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

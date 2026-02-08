// @ts-nocheck
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function ScrollProgress() {
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const windowHeight = document.documentElement.clientHeight
      const maxScrollTop = scrollHeight - windowHeight

      // Show/hide based on scroll position
      if (scrollTop > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      // Calculate scroll percentage
      const scrollPercent = (scrollTop / (maxScrollTop - 200)) * 100
      setScrollPercentage(Math.min(scrollPercent, 100))
    }

    // Initial call to set correct state
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // For testing - always show the component
  const alwaysVisible = true

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <motion.div
      className="fixed right-5 top-1/2 z-50"
      initial={{ opacity: 0, visibility: 'hidden' }}
      animate={{
        opacity: alwaysVisible ? 1 : (isVisible ? 1 : 0),
        visibility: alwaysVisible ? 'visible' : (isVisible ? 'visible' : 'hidden')
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        transform: 'translateY(-50%)',
        mixBlendMode: 'difference'
      }}
    >
      <motion.a
        href="#"
        className="flex flex-col justify-center items-center cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          scrollToTop()
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Scroll Text */}
        <motion.span
          className="text-white text-xs uppercase font-medium mb-4"
          style={{
            transform: 'rotate(180deg)',
            writingMode: 'vertical-lr'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: alwaysVisible ? 1 : (isVisible ? 1 : 0), y: alwaysVisible ? 0 : (isVisible ? 0 : 10) }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Scroll
        </motion.span>

        {/* Scroll Line Container */}
        <div className="relative w-0.5 h-15 bg-white/15">
          {/* Animated Progress Point */}
          <motion.div
            className="absolute top-0 left-0 w-0.5 bg-white"
            style={{
              height: `${scrollPercentage}%`
            }}
            initial={{ height: '0%' }}
            animate={{ height: `${scrollPercentage}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </motion.a>


    </motion.div>
  )
}

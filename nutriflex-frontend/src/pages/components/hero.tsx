// @ts-nocheck
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []

    // Create particles with exact specifications from HTML
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2, // Size between 2-5
        speedX: 1, // Fixed speed as per HTML config
        speedY: 0, // No vertical movement
        opacity: 0.8, // Fixed opacity as per HTML config
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.fillStyle = "#ed00a8"
        ctx.globalAlpha = particle.opacity
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Move particles to the right only
        particle.x += particle.speedX

        // Reset position when off screen
        if (particle.x > canvas.width) {
          particle.x = -particle.size
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/img/bn.jpg')",
        backgroundColor: "#1a1a1a" // Dark gray background as fallback
      }}
      id="home"
    >
      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10 h-full">
        <div className="row flex items-center h-full" dir="ltr" style={{ justifyContent: 'flex-start' }}>
          {/* Left Content - Text */}
          <div className="col-xl-7 col-lg-8 col-md-10 text-white position-relative text-center lg:!text-left" dir="ltr" style={{ direction: 'ltr' }}>
            {/* Main Title */}
            <motion.div
              className="fs-90 sm-fs-80 xs-fs-70 fw-600 mb-20px ls-minus-4px overflow-hidden"
              initial={{ opacity: 0, y: 100 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
              transition={{
                duration: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94] // easeOutCubic equivalent
              }}
            >
              <motion.div
                className="d-inline-block"
                initial={{ y: 100 }}
                animate={isVisible ? { y: 0 } : { y: 100 }}
                transition={{
                  duration: 0.9,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{
                  fontSize: "5.625rem",
                  lineHeight: "5.625rem",
                  fontWeight: 600,
                  letterSpacing: "-0.04em"
                }}
              >
                NUTRIFLEX
              </motion.div>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              className="fs-19 fw-300 mb-30px w-80 sm-w-100 opacity-60 d-block mx-auto lg:mx-0 overflow-hidden"
              initial={{ opacity: 0, y: 100 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <motion.span
                className="d-inline-block lh-32"
                initial={{ y: 100 }}
                animate={isVisible ? { y: 0 } : { y: 100 }}
                transition={{
                  duration: 0.9,
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{
                  fontSize: "19px",
                  lineHeight: "1.95rem",
                  fontWeight: 300,
                  letterSpacing: "-0.04em"
                }}
              >
                Nutriflex – smart nutrition & fitness coaching.
              </motion.span>
            </motion.div>
          </div>

          {/* Right Content - Image Placeholder */}
          <motion.div
            className="col-xl-5 col-lg-4"
            initial={{ opacity: 0, y: 100 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{
              duration: 1.2,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad equivalent
            }}
          >
            <div className="outside-box-right-7 position-relative">
              {/* Image placeholder - you can add an image here if needed */}
              {/* <img className="w-100" src="/img/he.png" alt="" /> */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-0" />
    </section>
  )
}

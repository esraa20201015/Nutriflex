// @ts-nocheck
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Technologies() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('technologies-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const imageVariants = {
    hidden: {
      opacity: 0,
      x: -100,
      scale: 1.1
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  }

  const contentVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      y: 50
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  }

  const titleVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <section
      id="technologies-section"
      className="grid lg:grid-cols-2 min-h-80vh gap-6 px-4 lg:px-0 mb-20 lg:mb-32"
    >
      {/* Image Section with Advanced Animations */}
      <motion.div
        className="relative h-96 lg:h-auto overflow-hidden rounded-2xl bg-[#fb64b6]"
        variants={imageVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#fb64b6] via-[#fb64b6] to-[#1d293d]"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(251, 100, 182, 0.9) 0%, #fb64b6 50%, #1d293d 100%)",
              "linear-gradient(135deg, rgba(251, 100, 182, 0.6) 0%, #fb64b6 40%, #1d293d 100%)",
              "linear-gradient(135deg, rgba(251, 100, 182, 0.8) 0%, #fb64b6 50%, #1d293d 100%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated Circuit Pattern Overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-18c9.941 0 18 8.059 18 18s-8.059 18-18 18-18-8.059-18-18 8.059-18 18-18z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Main Tech Image */}
        <motion.img
          src="/img/others/fitness-aerobic-other-sports-equipments-3d-rendering_808337-13224.avif"
          alt="Nutriflex fitness and nutrition"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 0.8 } : { scale: 1.1, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Glowing Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Content Section with Enhanced Animations */}
      <motion.div
        className="bg-[#fb64b6] text-white p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden rounded-2xl"
        variants={contentVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >


        {/* Animated Title */}
        <motion.h3
          className="text-2xl lg:text-3xl font-semibold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent border-b-2 border-white/60 inline-block pb-2 relative"
          variants={titleVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {t('landing.technologies.title', 'Why Nutriflex works for you')}
        </motion.h3>

        {/* Animated Text */}
        <motion.p
          className="text-pink-50 leading-relaxed relative"
          variants={textVariants}
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {t(
              'landing.technologies.description1',
              'Nutriflex combines personalized plans, simple tracking, and clear feedback so that healthy choices feel easy every day. Trainees always know what to eat and how to move, while coaches see exactly how their clients are progressing.',
            )}
          </motion.span>

          <motion.span
            className="inline-block mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {t(
              'landing.technologies.description2',
              'With Nutriflex, goals become concrete steps: structured meal plans, workout schedules, and progress graphs that keep everyone on the same page. This makes it easier to stay motivated, adjust quickly when life changes, and build habits that actually last.',
            )}
          </motion.span>
        </motion.p>

        {/* Key points under the heading */}
        <motion.ul
          className="mt-6 space-y-2 text-sm text-pink-50/90"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <li>• Clear daily guidance for meals and workouts.</li>
          <li>• Real‑time visibility into progress for both trainee and coach.</li>
          <li>• Flexible enough to fit different goals, lifestyles, and schedules.</li>
        </motion.ul>

        {/* Glowing Border Effect */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-2xl"
          animate={{
            borderColor: ["transparent", "rgba(236, 72, 153, 0.3)", "transparent"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}

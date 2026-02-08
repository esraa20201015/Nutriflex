// @ts-nocheck
'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { useLocaleStore } from '@/store/localeStore'

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()
  const { currentLang } = useLocaleStore()
  const direction = currentLang === 'ar' ? 'rtl' : 'ltr'
  
  const baseFeatures = useMemo(
    () => [
      {
        image:
          '/img/others/best-workout-from-home-equipment-1-666c6020f34fb.avif',
        title: t(
          'landing.features.dataAnalysis',
          'Personalized nutrition & workout plans',
        ),
      },
      {
        image:
          '/img/others/ai-generated-detailed-view-of-a-person-lifting-weights-in-a-gym-muscles-tensing-with-a-backdrop-of-exercise-equipment-and-blurred-movement-nearby-a-plate-of-healthy-food-emphasizing-nutrition-photo.jpeg',
        title: t(
          'landing.features.voice',
          'Smart progress tracking & insights',
        ),
      },
      {
        image: '/img/others/istockphoto-1311936090-612x612.jpg',
        title: t(
          'landing.features.legal',
          'Coach–trainee communication & feedback',
        ),
      },
      {
        image:
          '/img/others/Canva-healthy-food-healthy-lifestyle-concept-with-exercise-weights-scaled.jpg',
        title: t(
          'landing.features.reports',
          'Daily meal logging & macro tracking',
        ),
      },
      {
        image:
          '/img/others/heart-shape-ketogenic-low-carbs-diet-concept-ingredients-healthy-foods-selection-white-wooden-background_35641-4313.avif',
        title: t(
          'landing.features.risk',
          'Weight, BMI & body metrics monitoring',
        ),
      },
      {
        image:
          '/img/others/illustrated-cartoon-depicting-a-food-pyramid-with-nutrition-information-2RRF92F.jpg',
        title: t(
          'landing.features.document',
          'Goal-based programs and challenges',
        ),
      },
      {
        image:
          '/img/others/nutritional-declaration-badge-set-nutrition-facts-per-g-dietary-guide-food-drink-package-percent-portion-energy-fat-salt-188500892.webp',
        title: t(
          'landing.features.security',
          'Secure data for coaches & trainees',
        ),
      },
      {
        image: '/img/others/Canva-healthy-food-healthy-lifestyle-concept-with-exercise-weights-scaled.jpg',
        title: t(
          'landing.features.customize',
          'Flexible plans tailored to every lifestyle',
        ),
      },
    ],
    [t],
  )

  // Create features array with 500 repetitions (200 total items)
  const features = useMemo(() => Array.from({ length: 500 }, () => baseFeatures).flat(), [baseFeatures])

    // autoplay - in RTL, reverse the direction
    useEffect(() => {
        if (isPaused || !features || features.length === 0) return
        const handle = setInterval(() => {
            if (direction === 'rtl') {
                // In RTL, move backwards (right to left visually)
                setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
            } else {
                // In LTR, move forwards (left to right)
                setCurrentIndex((prev) => (prev + 1) % features.length)
            }
        }, 3000)
        return () => clearInterval(handle)
    }, [isPaused, features, direction])

    // In RTL, swap next/prev functions so buttons work correctly
    const next = () => {
        if (features.length > 0) {
            if (direction === 'rtl') {
                // In RTL, "next" means going to previous index (right to left)
                setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
            } else {
                // In LTR, "next" means going to next index (left to right)
                setCurrentIndex((prev) => (prev + 1) % features.length)
            }
        }
    }
  const prev = () => {
        if (features.length > 0) {
            if (direction === 'rtl') {
                // In RTL, "prev" means going to next index (left to right)
                setCurrentIndex((prev) => (prev + 1) % features.length)
            } else {
                // In LTR, "prev" means going to previous index
                setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
            }
        }
    }
    return (
        <motion.section
            id="features"
            className="py-20 lg:py-32 bg-gray-50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h4 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('landing.features.title', 'Application Features')}
                        </h4>
                    </motion.div>
                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-gray-600">
                            {t(
                                'landing.features.subtitle',
                                'Your health journey, smarter with Nutriflex.',
                            )}
                        </p>
                    </motion.div>
                    <div className="flex gap-2">
                        <button
                            aria-label={direction === 'rtl' ? 'next' : 'previous'}
                            onClick={direction === 'rtl' ? next : prev}
                            className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
                        >
                            {direction === 'rtl' ? (
                                <HiArrowRight className="h-4 w-4" />
                            ) : (
                                <HiArrowLeft className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            aria-label={direction === 'rtl' ? 'previous' : 'next'}
                            onClick={direction === 'rtl' ? prev : next}
                            className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
                        >
                            {direction === 'rtl' ? (
                                <HiArrowLeft className="h-4 w-4" />
                            ) : (
                                <HiArrowRight className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    className="relative overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    ref={containerRef}
                >
                    <motion.div
                        className="flex transition-transform duration-700 ease-out"
                        style={{
                            transform: features.length > 0 
                                ? direction === 'rtl' 
                                    ? `translateX(${currentIndex * (100 / 5)}%)` // Positive value for RTL (right to left)
                                    : `translateX(-${currentIndex * (100 / 5)}%)` // Negative value for LTR (left to right)
                                : 'translateX(0)',
                        }}
                        animate={{}}
                    >
                        {features && features.length > 0 && features.map((feature, index) => (
                            <div
                                key={`${feature.title}-${index}`}
                                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/5 px-3"
                            >
                                <motion.div
                                    className="relative group rounded-lg overflow-hidden shadow-lg h-80 bg-gray-200"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                >
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover block"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-white text-xl font-medium leading-tight whitespace-pre-line">
                                            {feature.title}
                                        </h3>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </motion.section>
    )
}

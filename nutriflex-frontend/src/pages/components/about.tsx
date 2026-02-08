// @ts-nocheck
// import Image from "next/image"

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function About() {
    const imgRef = useRef<HTMLImageElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    const { t } = useTranslation()

    // Parallax effect for the image
    useEffect(() => {
        const img = imgRef.current
        if (!img) return

        const handleScroll = () => {
            const rect = img.getBoundingClientRect()
            const windowHeight = window.innerHeight
            // when image is in viewport, compute a translateY based on its center distance
            const imgCenter = rect.top + rect.height / 2
            const distanceFromCenter = imgCenter - windowHeight / 2
            // adjust multiplier to change parallax intensity
            const multiplier = 0.08
            const translateY = -distanceFromCenter * multiplier
            img.style.transform = `translateY(${translateY}px)`
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    // Entrance animation for content children (staggered)
    useEffect(() => {
        const container = contentRef.current
        if (!container) return

        const children = Array.from(container.children) as HTMLElement[]

        // initial styles
        children.forEach((el) => {
            el.style.opacity = '0'
            el.style.transform =
                'rotateY(-90deg) rotateZ(-10deg) translateY(80px) translateZ(50px)'
            el.style.transition =
                'opacity 700ms cubic-bezier(.22,.98,.3,1), transform 900ms cubic-bezier(.22,.98,.3,1)'
            el.style.transformOrigin = 'center'
        })

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // stagger animation
                        children.forEach((el, idx) => {
                            setTimeout(
                                () => {
                                    el.style.opacity = '1'
                                    el.style.transform =
                                        'rotateY(0deg) rotateZ(0deg) translateY(0px) translateZ(0px)'
                                },
                                150 * idx + 200,
                            ) // stagger value and delay
                        })
                        obs.disconnect()
                    }
                })
            },
            { threshold: 0.15 },
        )

        observer.observe(container)

        return () => observer.disconnect()
    }, [])

    return (
        <section id="about" className="py-20 lg:py-32 overflow-hidden">
            <div className="container mx-auto ">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="relative md-mb-30px w-auto">
                        <img
                            ref={imgRef}
                            src="/img/others/istockphoto-1141626464-612x612.jpg"
                            alt="About Nutriflex"
                            className="w-full h-auto rounded-lg shadow-lg will-change-transform transition-transform duration-300 object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div ref={contentRef} className="space-y-6 p-20">
                        <span className="text-pink-600 font-semibold text-sm uppercase tracking-wider">
                            {t('landing.about.label', 'About Nutriflex')}
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mt-10">
                            {t(
                                'landing.about.title',
                                'Transforming nutrition and fitness into lasting habits',
                            )}
                        </h2>
                        <p className="text-gray-600 leading-relaxed p-2">
                            {t(
                                'landing.about.description',
                                "Nutriflex is your intelligent companion for healthy living, combining personalized nutrition and fitness coaching in one simple experience. We help coaches and trainees stay aligned with clear meal plans, progress tracking, and smart insights that turn goals into daily actions. Whether you're optimizing performance or building a healthier lifestyle, Nutriflex keeps everything organized, measurable, and easy to follow.",
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

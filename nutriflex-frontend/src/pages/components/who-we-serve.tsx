// @ts-nocheck
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function WhoWeServe() {
  const [activeFirst, setActiveFirst] = useState(1) // Start with second item active
  const [activeSecond, setActiveSecond] = useState(1) // Start with second item active
  const pauseFirst = useRef(false)
  const pauseSecond = useRef(false)
  const { t } = useTranslation()
  
  const departments = useMemo(
    () => [
      {
        image: '/img/others/best-workout-from-home-equipment-1-666c6020f34fb.avif',
        icon: '/img/icon/hr.png',
        title: t('landing.whoWeServe.trainees.title', 'Trainees'),
        description: t(
          'landing.whoWeServe.trainees.description',
          'People who want to lose weight, build muscle, or improve their overall health with clear, guided plans.',
        ),
      },
      {
        image:
          '/img/others/ai-generated-detailed-view-of-a-person-lifting-weights-in-a-gym-muscles-tensing-with-a-backdrop-of-exercise-equipment-and-blurred-movement-nearby-a-plate-of-healthy-food-emphasizing-nutrition-photo.jpeg',
        icon: '/img/icon/Legal.png',
        title: t('landing.whoWeServe.coaches.title', 'Coaches & trainers'),
        description: t(
          'landing.whoWeServe.coaches.description',
          'Fitness and nutrition coaches who need one place to create plans, follow up with clients, and track progress.',
        ),
      },
      {
        image: '/img/others/Canva-healthy-food-healthy-lifestyle-concept-with-exercise-weights-scaled.jpg',
        icon: '/img/icon/procurement.png',
        title: t('landing.whoWeServe.gyms.title', 'Gyms & fitness centers'),
        description: t(
          'landing.whoWeServe.gyms.description',
          'Gyms that want to offer digital coaching, nutrition guidance, and progress dashboards to their members.',
        ),
      },
      {
        image:
          '/img/others/heart-shape-ketogenic-low-carbs-diet-concept-ingredients-healthy-foods-selection-white-wooden-background_35641-4313.avif',
        icon: '/img/icon/Risk.png',
        title: t('landing.whoWeServe.nutritionists.title', 'Nutritionists & dietitians'),
        description: t(
          'landing.whoWeServe.nutritionists.description',
          'Professionals who design meal plans and need easy tools to monitor adherence and adjust recommendations.',
        ),
      },
      {
        image:
          '/img/others/illustrated-cartoon-depicting-a-food-pyramid-with-nutrition-information-2RRF92F.jpg',
        icon: '/img/icon/Compliance.png',
        title: t('landing.whoWeServe.clinics.title', 'Health & wellness clinics'),
        description: t(
          'landing.whoWeServe.clinics.description',
          'Clinics that combine medical supervision with lifestyle coaching, using Nutriflex to follow up between visits.',
        ),
      },
    ],
    [t],
  )

  // Animation refs
  const titleRef = useRef<HTMLHeadingElement>(null)
  const firstRowRef = useRef<HTMLDivElement>(null)
  const secondRowRef = useRef<HTMLDivElement>(null)
  const bottomTextRef = useRef<HTMLDivElement>(null)

  // Animation system
  useEffect(() => {
    // Delay all animations to ensure DOM is ready
    setTimeout(() => {
      // Title animation
      if (titleRef.current) {
        titleRef.current.style.transition = 'all 900ms ease-out'
        titleRef.current.style.opacity = '1'
        titleRef.current.style.transform = 'translateY(0px)'
      }

      // First row animation
      if (firstRowRef.current) {
        const children = firstRowRef.current.children
        Array.from(children).forEach((child, index) => {
          const element = child as HTMLElement
          element.style.opacity = '0'
          element.style.transform = 'translateX(50px)'
          element.style.transition = 'none'
          
          setTimeout(() => {
            element.style.transition = 'all 1200ms ease-out'
            element.style.opacity = '1'
            element.style.transform = 'translateX(0px)'
          }, index * 150)
        })
      }

      // Second row animation
      if (secondRowRef.current) {
        const children = secondRowRef.current.children
        Array.from(children).forEach((child, index) => {
          const element = child as HTMLElement
          element.style.opacity = '0'
          element.style.transform = 'translateX(50px)'
          element.style.transition = 'none'
          
          setTimeout(() => {
            element.style.transition = 'all 1200ms ease-out'
            element.style.opacity = '1'
            element.style.transform = 'translateX(0px)'
          }, index * 150)
        })
      }

      // Bottom text animation
      if (bottomTextRef.current) {
        bottomTextRef.current.style.transition = 'all 1200ms ease-out'
        bottomTextRef.current.style.opacity = '1'
        bottomTextRef.current.style.transform = 'translateY(0px)'
      }
    }, 100)
  }, [])

  useEffect(() => {
    const t1 = setInterval(() => {
      if (pauseFirst.current) return
      setActiveFirst((s) => (s + 1) % 3)
    }, 3500)

    const t2 = setInterval(() => {
      if (pauseSecond.current) return
      setActiveSecond((s) => (s + 1) % 2)
    }, 3800)

    return () => {
      clearInterval(t1)
      clearInterval(t2)
    }
  }, [])

  return (
    <section id="serve" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            {t('landing.whoWeServe.title', 'Who we serve')}
          </h2>
        </div>

        {/* First Row - 3 items */}
        <div 
          ref={firstRowRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto"
        >
          {departments.slice(0, 3).map((dept, index) => {
            const isActive = index === activeFirst
            return (
              <div
                key={index}
                className={`sliding-box-item group cursor-pointer transition-all duration-300 ${
                  isActive ? 'transform scale-105 z-20' : ''
                }`}
                style={{ opacity: 0, transform: 'translateX(50px)' }}
                onMouseEnter={() => (pauseFirst.current = true)}
                onMouseLeave={() => (pauseFirst.current = false)}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden rounded-t-lg h-64">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Content Section */}
                <div className={`p-8 rounded-b-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white shadow-2xl' 
                    : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                }`}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={dept.icon} 
                      alt={`${dept.title} icon`} 
                      className="w-8 h-8 mr-3" 
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dept.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Second Row - 2 items centered */}
        <div 
          ref={secondRowRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto"
        >
          {departments.slice(3, 5).map((dept, index) => {
            const isActive = index === activeSecond
            return (
              <div
                key={index}
                className={`sliding-box-item group cursor-pointer transition-all duration-300 ${
                  isActive ? 'transform scale-105 z-20' : ''
                }`}
                style={{ opacity: 0, transform: 'translateX(50px)' }}
                onMouseEnter={() => (pauseSecond.current = true)}
                onMouseLeave={() => (pauseSecond.current = false)}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden rounded-t-lg h-64">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Content Section */}
                <div className={`p-8 rounded-b-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white shadow-2xl' 
                    : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                }`}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={dept.icon} 
                      alt={`${dept.title} icon`} 
                      className="w-8 h-8 mr-3" 
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dept.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Text */}
        <div 
          ref={bottomTextRef}
          className="text-center"
          style={{ opacity: 0, transform: 'translateY(50px)' }}
        >
          <p className="text-xl font-semibold text-gray-900">
            {t('landing.whoWeServe.bottomText', 'Nutriflex – empowering coaches and trainees to reach their goals.')}
          </p>
        </div>
      </div>
    </section>
  )
}
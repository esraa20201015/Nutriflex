// @ts-nocheck

import { useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaDumbbell,
  FaAppleAlt,
  FaHeartbeat,
  FaUserFriends,
  FaClipboardList,
  FaChartLine,
  FaUsersCog,
  FaLeaf,
} from 'react-icons/fa'

export default function KeyObjectives() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()
  
  const objectives = useMemo(
    () => [
      {
        Icon: FaDumbbell,
        title: t(
          'landing.keyObjectives.goals',
          'Help trainees achieve their goals safely and consistently',
        ),
      },
      {
        Icon: FaUserFriends,
        title: t(
          'landing.keyObjectives.coaches',
          'Support coaches with clear dashboards and insights',
        ),
      },
      {
        Icon: FaAppleAlt,
        title: t(
          'landing.keyObjectives.habits',
          'Turn daily nutrition & workouts into lasting habits',
        ),
      },
      {
        Icon: FaClipboardList,
        title: t(
          'landing.keyObjectives.adherence',
          'Increase adherence to plans with simple tracking',
        ),
      },
      {
        Icon: FaHeartbeat,
        title: t(
          'landing.keyObjectives.visibility',
          'Give full visibility into progress and health metrics',
        ),
      },
      {
        Icon: FaChartLine,
        title: t(
          'landing.keyObjectives.progress',
          'Measure progress over time with intuitive analytics',
        ),
      },
      {
        Icon: FaUsersCog,
        title: t(
          'landing.keyObjectives.collaboration',
          'Improve collaboration between coaches, gyms, and clinics',
        ),
      },
      {
        Icon: FaLeaf,
        title: t(
          'landing.keyObjectives.growth',
          'Support long‑term healthy lifestyles and growth',
        ),
      },
    ],
    [t],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = Array.from(container.querySelectorAll('.feature-item')) as HTMLElement[]

    // initial state
    items.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px) scale(0.95)'
      el.style.transition = 'opacity 500ms cubic-bezier(.22,.98,.3,1), transform 500ms cubic-bezier(.22,.98,.3,1)'
    })

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger
            items.forEach((el, idx) => {
              setTimeout(() => {
                el.style.opacity = '1'
                el.style.transform = 'translateY(0px) scale(1)'
              }, idx * 200)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12 }
    )

    obs.observe(container)

    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="key"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{
        backgroundColor: '#121733',
        backgroundImage:
          `radial-gradient(circle at 10% 70%, rgba(255,255,255,0.02) 0, transparent 30%),
           radial-gradient(circle at 90% 30%, rgba(255,255,255,0.02) 0, transparent 30%),
           url('/img/demo-hosting-home-02.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">{t('landing.keyObjectives.title', 'Key Objectives')}</h2>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-6"
        >
          {objectives.map(({ Icon, title }, idx) => (
            <div key={idx} className="feature-item">
              <div className="group relative bg-transparent border border-white/10 rounded-xl p-8 min-h-[220px] flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/5 hover:shadow-lg">
                <div className="feature-box-icon mb-4 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-pink-400" />
                </div>
                <div className="feature-box-content text-center">
                  <span className="text-white text-sm font-medium leading-relaxed">
                    {title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

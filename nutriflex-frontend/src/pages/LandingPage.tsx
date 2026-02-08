import React, { useEffect } from 'react'
import Header from './components/header'
import Hero from './components/hero'
import About from './components/about'
import KeyObjectives from './components/key-objectives'
import Features from './components/features'
import WhoWeServe from './components/who-we-serve'
import Technologies from './components/technologies'
import Footer from './components/footer'
import ScrollProgress from './components/scroll-progress'
import { useLocaleStore } from '@/store/localeStore'
import i18n from '@/locales'

const LandingPage: React.FC = () => {
    const { currentLang } = useLocaleStore()
    
    // Ensure locale is initialized when landing page loads
    useEffect(() => {
        const lang = currentLang || localStorage.getItem('locale') || 'en'
        const dir = lang === 'ar' ? 'rtl' : 'ltr'
        
        // Set document direction
        document.documentElement.dir = dir
        document.body.dir = dir
        
        // Set i18n language
        i18n.changeLanguage(lang)
    }, [currentLang])
    
    return (
        <div className="relative">
            <Header />
            <Hero />
            <About />
            <KeyObjectives />
            <Features />
            <WhoWeServe />
            <Technologies />
            <Footer />
            
            {/* Scroll Progress Indicator */}
            <ScrollProgress />
        </div>
    )
}

export default LandingPage

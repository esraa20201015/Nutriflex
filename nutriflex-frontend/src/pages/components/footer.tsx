// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/pages/components/ui/input'
import { useTranslation } from 'react-i18next'
import {
    FaFacebookF as Facebook,
    FaTwitter as Twitter,
    FaInstagram as Instagram,
    FaLinkedinIn as Linkedin,
} from 'react-icons/fa'
import { FiMail as Mail } from 'react-icons/fi'

declare global {
    namespace JSX {
        // Allow standard HTML tags in this file's JSX without type errors
        interface IntrinsicElements {
            [elemName: string]: any
        }
    }
}

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()
  
  const footerLinks = useMemo(() => [
    { href: "#home", text: t('landing.nav.home', 'Home') },
    { href: "#about", text: t('landing.nav.about', 'About') },
    { href: "#key", text: t('landing.nav.keyObjectives', 'Key Objectives') },
    { href: "#features", text: t('landing.nav.features', 'Features') },
    { href: "#serve", text: t('landing.nav.whoWeServe', 'Who we serve') }
  ], [t])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('footer-section')
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
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const socialVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <footer
      id="footer-section"
      className="footer-dark text-white relative overflow-hidden"
      style={{ backgroundColor: '#0d1229' }}
    >
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-18c9.941 0 18 8.059 18 18s-8.059 18-18 18-18-8.059-18-18 8.059-18 18-18z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }}
      />

      <div className="container mx-auto px-4 py-16 relative">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Logo & Social */}
          <motion.div
            className="lg:col-span-3 order-1"
            variants={itemVariants}
          >
            <motion.a
              href="/"
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/img/logo/logo-light-full.png"
                alt="Nutriflex"
                className="h-10 w-auto"
              />
            </motion.a>
            <motion.p
              className="text-gray-300 mb-6 w-5/6 lg:w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              dir="ltr"
            >
              Nutriflex – smart nutrition & fitness coaching.
            </motion.p>

            {/* Animated Social Icons */}
            <motion.div
              className="flex gap-3"
              variants={containerVariants}
            >
              {[
                { href: "https://facebook.com", icon: Facebook, color: "hover:bg-blue-600" },
                { href: "https://twitter.com", icon: Twitter, color: "hover:bg-sky-500" },
                { href: "https://instagram.com", icon: Instagram, color: "hover:bg-pink-600" },
                { href: "https://linkedin.com", icon: Linkedin, color: "hover:bg-blue-700" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110`}
                  variants={socialVariants}
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            className="lg:col-span-2 order-3 lg:order-2"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('landing.footer.company', 'Company')}
            </motion.h3>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
            >
              {footerLinks.map((link, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="relative">
                      {link.text}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"
                        whileHover={{ width: "100%" }}
                      />
                    </span>
                  </motion.a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="lg:col-span-3 order-5 lg:order-4"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t('landing.footer.sayHello', 'Say hello')}
            </motion.h3>
            <motion.div
              className="space-y-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <p className="text-gray-300 text-sm mb-1">{t('landing.footer.needSupport', 'Need support?')}</p>
                <motion.a
                  href="mailto:info@nutriflex.com"
                  className="text-white hover:text-pink-500 transition-colors duration-300 border-b border-white/20 hover:border-pink-500 inline-block"
                  whileHover={{ scale: 1.02 }}
                >
                  info@nutriflex.com
                </motion.a>
              </motion.div>

            </motion.div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="lg:col-span-4 order-2 lg:order-5"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {t('landing.footer.newsletter.title', 'Subscribe our newsletter')}
            </motion.h3>
            <motion.p
              className="text-gray-300 text-sm mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {t('landing.footer.newsletter.description', 'Subscribe our newsletter to get the latest news and updates!')}
            </motion.p>
            <motion.form
              className="flex gap-2 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Input
                type="email"
                placeholder={t('landing.footer.newsletter.placeholder', 'Enter your email')}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 transition-all duration-300"
              />
              <motion.button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center min-w-[44px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-4 h-4" />
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>

        {/* Animated Bottom Border */}
        <motion.div
          className="border-t border-white/10 pt-8 pb-8 text-center relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Animated border line */}
          <motion.div
            className="absolute top-0 left-1/2 w-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"
            animate={{
              width: ["0%", "100%"],
              x: "-50%"
            }}
            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          />

            <motion.p
            className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {t('landing.footer.copyright', 'This site is powered by Nutriflex')}{" "}
            <motion.a
              href="#"
              className="text-white hover:text-pink-500 border-b border-white/20 hover:border-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
            >
              {t('landing.footer.privacyPolicy', 'privacy policy')}
            </motion.a>{" "}
            {t('landing.footer.and', 'and')}{" "}
            <motion.a
              href="#"
              className="text-white hover:text-pink-500 border-b border-white/20 hover:border-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
            >
              {t('landing.footer.termsOfService', 'terms of service')}
            </motion.a>{" "}
            {t('landing.footer.copyrightEnd', 'apply. You must not use this website if you disagree with any of these website standard terms and conditions.')}
          </motion.p>
        </motion.div>
      </div>

    </footer>
  )
}

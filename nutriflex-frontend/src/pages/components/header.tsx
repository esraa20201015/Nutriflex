// @ts-nocheck

'use client'

import { useState, useEffect } from 'react'
import { FiMenu as Menu, FiX as X, FiLogIn as LogIn } from 'react-icons/fi'
import { MdDashboard as LayoutDashboard } from 'react-icons/md'
import { useNavigate } from 'react-router'
import cookiesStorage from '@/utils/cookiesStorage'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { useTranslation } from 'react-i18next'

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate()
    const { t } = useTranslation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const token = cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE)
        setIsAuthenticated(!!token)
    }, [])

    // Navigation handler
    const handleNavigation = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.preventDefault()

        // Handle Contact page navigation
        if (href === '/contact') {
            navigate('/contact')
            setIsOpen(false)
            return
        }

        // Handle Home navigation (scroll to top of page)
        if (href === '/') {
            // If we're on contact page, navigate to landing page first
            if (window.location.pathname === '/contact') {
                navigate('/')
                // Wait for navigation to complete, then scroll to top
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    })
                }, 100)
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                })
            }
            setIsOpen(false)
            return
        }

        // Handle section navigation (scroll to specific sections)
        if (href.startsWith('#')) {
            const targetId = href.substring(1)

            // If we're on contact page, navigate to landing page first
            if (window.location.pathname === '/contact') {
                navigate('/')
                // Wait for navigation to complete, then scroll to section
                setTimeout(() => {
                    const targetElement = document.getElementById(targetId)
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        })
                    }
                }, 100)
            } else {
                // We're already on landing page, just scroll to section
                const targetElement = document.getElementById(targetId)
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }
            }
        }

        // Close mobile menu if open
        setIsOpen(false)
    }

    const navLinks = [
        { href: '/', label: t('landing.nav.home', 'Home') },
        { href: '#about', label: t('landing.nav.about', 'About') },
        {
            href: '#key',
            label: t('landing.nav.keyObjectives', 'Key Objectives'),
        },
        { href: '#features', label: t('landing.nav.features', 'Features') },
        { href: '#serve', label: t('landing.nav.whoWeServe', 'Who we serve') },
        { href: '/contact', label: t('landing.nav.contact', 'Contact') },
    ]

    return (
        <header
            id="home"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isOpen || isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
            }`}
        >
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center">
                        <img
                            src={
                                isOpen || isScrolled
                                    ? '/img/logo/logo-light-full.png'
                                    : '/img/logo/logo-dark-full.png'
                            }
                            alt="Nutriflex logo"
                            className="h-8"
                        />
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavigation(e, link.href)}
                                className={`text-sm font-medium transition-colors hover:text-pink-600 ${
                                    isScrolled ? 'text-gray-900' : 'text-white'
                                }`}
                                style={{ fontWeight: '600' }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Phone Number + Sign In / Dashboard Button */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/home')}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isScrolled
                                        ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                        : 'bg-white hover:bg-gray-100 text-gray-900'
                                }`}
                                style={{ fontWeight: '600' }}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                {t('landing.goToDashboard', 'Go to Dashboard')}
                            </button>
                        ) : (
                            <a
                                href="/sign-in"
                                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-white/10 hover:bg-white/20 ${
                                    isScrolled
                                        ? 'text-gray-900 bg-white/0 hover:bg-gray-100'
                                        : 'text-white'
                                }`}
                                style={{ fontWeight: '600' }}
                            >
                                <LogIn
                                    className={
                                        isScrolled
                                            ? 'text-gray-900 w-4 h-4'
                                            : 'text-white w-4 h-4'
                                    }
                                />
                                {t('auth.signIn', 'Sign In')}
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <X className="text-gray-900" />
                        ) : (
                            <Menu
                                className={
                                    isScrolled ? 'text-gray-900' : 'text-white'
                                }
                            />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 ">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavigation(e, link.href)}
                                className="block py-2 text-sm font-medium text-gray-900 hover:text-pink-600"
                            >
                                {link.label}
                            </a>
                        ))}
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    navigate('/home')
                                    setIsOpen(false)
                                }}
                                className="block mt-2 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 text-left"
                            >
                                {t('landing.goToDashboard', 'Go to Dashboard')}
                            </button>
                        ) : (
                            <a
                                href="/sign-in"
                                className="block mt-2 py-2 text-sm font-medium text-gray-900 hover:text-pink-600"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('auth.signIn', 'Sign In')}
                            </a>
                        )}
                    </div>
                )}
            </nav>
        </header>
    )
}

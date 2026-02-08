/**
 * Utility functions to test backend connection
 * Use these in browser console or in development
 */

import ApiService from '@/services/ApiService'
import endpointConfig from '@/configs/endpoint.config'

/**
 * Test backend health endpoint
 */
export const testHealthCheck = async () => {
    try {
        const response = await fetch('/api/health')
        const data = await response.json()
        console.log('✅ Backend Health Check:', data)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Health Check Failed:', error)
        return { success: false, error }
    }
}

/**
 * Test sign-in endpoint with sample credentials
 */
export const testSignIn = async (email: string, password: string) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: endpointConfig.signIn,
            method: 'post',
            data: { email, password },
        })
        console.log('✅ Sign In Test:', response)
        return { success: true, data: response }
    } catch (error: any) {
        console.error('❌ Sign In Test Failed:', error)
        const errorMessage =
            error?.response?.data?.messageEn ||
            error?.response?.data?.message ||
            error?.message ||
            'Unknown error'
        return { success: false, error: errorMessage }
    }
}

/**
 * Test sign-up endpoint with sample data
 */
export const testSignUp = async () => {
    const testData = {
        fullName: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test1234',
        confirmPassword: 'Test1234',
        role: 'TRAINEE' as const,
        traineeProfile: {
            age: 25,
            gender: 'male' as const,
            height: 175,
            weight: 70,
            fitnessGoals: 'Get fit and healthy',
        },
    }

    try {
        const response = await ApiService.fetchDataWithAxios({
            url: endpointConfig.signUp,
            method: 'post',
            data: testData,
        })
        console.log('✅ Sign Up Test:', response)
        return { success: true, data: response }
    } catch (error: any) {
        console.error('❌ Sign Up Test Failed:', error)
        const errorMessage =
            error?.response?.data?.messageEn ||
            error?.response?.data?.message ||
            error?.message ||
            'Unknown error'
        return { success: false, error: errorMessage }
    }
}

/**
 * Test if token is stored correctly
 */
export const testTokenStorage = () => {
    const storage = localStorage.getItem('token') || sessionStorage.getItem('token')
    const cookies = document.cookie
    console.log('📦 Token Storage Check:')
    console.log('  - localStorage:', localStorage.getItem('token') ? '✅ Found' : '❌ Not found')
    console.log('  - sessionStorage:', sessionStorage.getItem('token') ? '✅ Found' : '❌ Not found')
    console.log('  - Cookies:', cookies.includes('token') ? '✅ Found' : '❌ Not found')
    return { storage, cookies }
}

/**
 * Run all connection tests
 */
export const runAllTests = async () => {
    console.log('🧪 Running Backend Connection Tests...\n')
    
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...')
    await testHealthCheck()
    console.log('')
    
    // Test 2: Token Storage
    console.log('2️⃣ Checking Token Storage...')
    testTokenStorage()
    console.log('')
    
    // Test 3: Sign Up (optional - uncomment to test)
    // console.log('3️⃣ Testing Sign Up...')
    // await testSignUp()
    // console.log('')
    
    console.log('✅ Tests completed! Check results above.')
}

// Make functions available globally in development
if (import.meta.env.DEV) {
    // @ts-ignore
    window.testBackend = {
        health: testHealthCheck,
        signIn: testSignIn,
        signUp: testSignUp,
        tokenStorage: testTokenStorage,
        all: runAllTests,
    }
    console.log('💡 Backend test functions available: window.testBackend')
}

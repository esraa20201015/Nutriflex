import { useEffect } from 'react'
import { useNavigate } from 'react-router'

/**
 * Progress is now integrated into the Trainee Dashboard.
 * This component redirects /trainee/progress to the dashboard (and optionally to the progress section).
 */
const Progress = () => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/trainee/dashboard#progress-section', { replace: true })
    }, [navigate])

    return null
}

export default Progress

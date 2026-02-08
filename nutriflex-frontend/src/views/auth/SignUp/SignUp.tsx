import { useSearchParams, Link } from 'react-router'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import SignUpForm from './components/SignUpForm'
import RoleSelection from './components/RoleSelection'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import { HiHome } from 'react-icons/hi2'

type SignUpProps = {
    disableSubmit?: boolean
    signInUrl?: string
}

export const SignUpBase = ({
    signInUrl = '/sign-in',
    disableSubmit,
}: SignUpProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const [searchParams] = useSearchParams()
    const mode = useThemeStore((state) => state.mode)

    const role = searchParams.get('role') as 'COACH' | 'TRAINEE' | null
    const isFormStep = role === 'COACH' || role === 'TRAINEE'

    return (
        <>
            <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    imgClass="mx-auto"
                    logoWidth={60}
                />
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {!isFormStep ? (
                <RoleSelection signInUrl={signInUrl} />
            ) : (
                <>
                    <div className="mb-8 flex flex-col gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 className="mb-1">Complete Your Registration</h3>
                                <p className="font-semibold heading-text">
                                    {role === 'COACH'
                                        ? 'Fill in your coach information'
                                        : 'Fill in your trainee information'}
                                </p>
                            </div>
                            <Button
                                asElement={Link}
                                to="/"
                                variant="solid"
                                size="md"
                                icon={<HiHome className="w-5 h-5" />}
                                iconAlignment="start"
                                className="shrink-0"
                            >
                                Home
                            </Button>
                        </div>
                    </div>
                    <SignUpForm
                        disableSubmit={disableSubmit}
                        setMessage={setMessage}
                        preselectedRole={role}
                    />
                </>
            )}
        </>
    )
}

const SignUp = () => {
    return <SignUpBase />
}

export default SignUp

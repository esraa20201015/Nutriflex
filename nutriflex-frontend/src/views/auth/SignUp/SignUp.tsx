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
            <div className="mb-8 flex justify-center">
                <Logo
                    type="full"
                    mode={mode}
                    imgClass="mx-auto max-h-20 w-full"
                    logoWidth={180}
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
                    <div className="mb-8 flex flex-nowrap items-center justify-between gap-4">
                        <h3 className="mb-0 min-w-0 flex-1">Complete Your Registration</h3>
                        <Button
                            asElement={Link}
                            to="/sign-up"
                            variant="solid"
                            size="md"
                            icon={<HiHome className="w-5 h-5" />}
                            iconAlignment="start"
                            className="shrink-0"
                        >
                            Home
                        </Button>
                    </div>
                    <p className="font-semibold heading-text mb-6">
                        {role === 'COACH'
                            ? 'Fill in your coach information'
                            : 'Fill in your trainee information'}
                    </p>
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

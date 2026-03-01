import { cloneElement } from 'react'
import { useLocation } from 'react-router'
import Container from '@/components/shared/Container'
import { Card } from '@/components/ui'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    const { pathname } = useLocation()
    const isSignIn = pathname === '/sign-in'
    const isSignUp = pathname === '/sign-up'

    const contentWrapperClass = isSignUp
        ? 'max-w-8xl xl:max-w-4xl'
        : 'max-w-8xl xl:max-w-4xl'

    return (
        <div
            className={`flex h-full bg-white dark:bg-gray-800 ${
                isSignUp ? 'px-2 sm:px-4 py-6' : 'p-6'
            }`}
        >
            <div className="flex flex-col justify-center items-center flex-1 min-w-0">
                <Container className="flex flex-col flex-auto items-center justify-center min-w-0 h-full w-full">
                    <div className={`w-full min-w-[320px] ${contentWrapperClass}`}>
                        {isSignUp ? (
                            <Card className="bg-white dark:bg-gray-800 px-6 rounded-lg shadow-lg">
                                {children
                                    ? cloneElement(children as React.ReactElement, {
                                          ...rest,
                                      })
                                    : null}
                            </Card>
                        ) : (
                            <div className="w-full px-8">
                                {children
                                    ? cloneElement(children as React.ReactElement, {
                                          ...rest,
                                      })
                                    : null}
                            </div>
                        )}
                    </div>
                </Container>
            </div>
            {isSignIn && (
                <div className="py-6 px-10 lg:flex flex-col flex-1 justify-center hidden rounded-3xl items-center bg-white dark:bg-gray-800 xl:max-w-[520px] 2xl:max-w-[720px]">
                    <img
                        src="/img/others/Gemini_Generated_Image.png-removebg-preview.png"
                        alt="Nutriflex fitness and health tracking"
                        className="max-h-full max-w-full object-contain rounded-3xl"
                    />
                </div>
            )}
        </div>
    )
}

export default Side

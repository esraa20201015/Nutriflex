import { cloneElement } from 'react'
import Container from '@/components/shared/Container'
import { Card } from '@/components/ui'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

/** 'signup' = wide card (320px–1200px); 'narrow' = sign-in style (max 400px) */
export type SimpleLayoutVariant = 'signup' | 'narrow'

interface SimpleProps extends CommonProps {
    content?: ReactNode
    /** Layout variant: signup (wide card) or narrow (sign-in style). Default: signup */
    variant?: SimpleLayoutVariant
    /** First step: use height 82% + marginTop; other steps: leave undefined for content-driven height */
    cardHeight?: 'firstStep' | 'content'
}

const Simple = ({
    children,
    content,
    variant = 'signup',
    cardHeight = 'content',
    ...rest
}: SimpleProps) => {
    const isNarrow = variant === 'narrow'
    const isFirstStep = cardHeight === 'firstStep'

    return (
        <div className="h-full bg-white dark:bg-gray-800" style={{ height: '100vh' }}>
            <Container className="flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                <div
                    className={
                        isNarrow
                            ? 'min-w-[320px] md:min-w-[400px] max-w-[400px]'
                            : 'w-full min-w-[320px] max-w-full md:min-w-[400px] md:max-w-[1200px]'
                    }
                >
                    {isNarrow ? (
                        <>
                            {content}
                            {children
                                ? cloneElement(children as ReactElement, {
                                      ...rest,
                                  })
                                : null}
                        </>
                    ) : (
                        <Card
                            className="bg-white dark:bg-gray-800 px-8"
                            style={
                                isFirstStep
                                    ? { height: '82%', marginTop: '6rem' }
                                    : { marginTop: '2rem', marginBottom: '2rem' }
                            }
                        >
                            {content}
                            {children
                                ? cloneElement(children as ReactElement, {
                                      ...rest,
                                  })
                                : null}
                        </Card>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default Simple

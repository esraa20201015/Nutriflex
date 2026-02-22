import { cloneElement } from 'react'
import { useLocation } from 'react-router'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    const { pathname } = useLocation()
    const isSignIn = pathname === '/sign-in'

    return (
        <div className="flex h-full p-6 bg-white dark:bg-gray-800">
            <div className=" flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[480px] px-8 max-w-[420px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
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

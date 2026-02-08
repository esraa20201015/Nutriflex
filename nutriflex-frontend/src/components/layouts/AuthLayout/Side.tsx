import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full p-6 bg-white dark:bg-gray-800">
            <div className=" flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-center hidden rounded-3xl items-center bg-gray-50 dark:bg-gray-900 xl:max-w-[520px] 2xl:max-w-[720px]">
                <img
                    src="/img/others/fitness.png"
                    alt="Nutriflex fitness illustration"
                    className="max-h-full max-w-full object-contain rounded-3xl"
                />
            </div>
        </div>
    )
}

export default Side

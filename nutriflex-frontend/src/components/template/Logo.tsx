import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

const LOGO_SRC = '/img/others/Gemini_Generated_Image_7.png.png'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                width: logoWidth,
            }}
        >
            <img
                src={LOGO_SRC}
                alt={`${APP_NAME} logo`}
                className={classNames('object-contain h-auto w-full', imgClass)}
            />
        </div>
    )
}

export default Logo

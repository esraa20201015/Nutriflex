import type { Mode } from '@/@types/theme'

const LIGHT_COLOR = '#1d293d' // dark blue "Nutriflex" text in light mode
const DARK_COLOR = '#fb64b6' // pink "Nutriflex" text in dark mode
const WEIGHT_COLOR = '#fb64b6' // pink dumbbell weights (both modes)
const WEIGHT_OUTLINE = '#e91e8c' // slightly darker pink outline
const BAR_COLOR = '#1d293d' // dark blue bar and check (both modes)

interface NutriflexLogoProps {
    mode: Mode
    type?: 'full' | 'streamline'
    className?: string
    style?: React.CSSProperties
}

/**
 * Nutriflex logo: stylized barbell with checkmark + "Nutriflex" text.
 * Light mode = dark blue text. Dark mode = pink text.
 */
const NutriflexLogo = ({
    mode,
    type = 'full',
    className = '',
    style = {},
}: NutriflexLogoProps) => {
    const textColor = mode === 'dark' ? DARK_COLOR : LIGHT_COLOR
    const viewBox = type === 'streamline' ? '0 0 48 48' : '0 0 180 52'

    return (
        <svg
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ width: '100%', height: 'auto', ...style }}
            aria-label="Nutriflex"
        >
            {type === 'streamline' ? (
                /* Icon only: barbell + check in 48x48 */
                <g transform="translate(2, 8)">
                    <ellipse cx="10" cy="16" rx="7" ry="10" fill={WEIGHT_COLOR} stroke={WEIGHT_OUTLINE} strokeWidth="1.5" />
                    <rect x="18" y="12" width="12" height="8" rx="2" fill={BAR_COLOR} />
                    <path d="M22 8 L24 12 L30 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M22 8 L24 12 L30 6" stroke={BAR_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <ellipse cx="38" cy="16" rx="7" ry="10" fill={WEIGHT_COLOR} stroke={WEIGHT_OUTLINE} strokeWidth="1.5" />
                </g>
            ) : (
                <>
                    {/* Full: barbell + check + "Nutriflex" text (blue in light, pink in dark) */}
                    <ellipse cx="28" cy="26" rx="16" ry="11" fill={WEIGHT_COLOR} stroke={WEIGHT_OUTLINE} strokeWidth="2" />
                    <rect x="46" y="21" width="88" height="10" rx="2" fill={BAR_COLOR} />
                    <path d="M88 12 L96 24 L110 8" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M88 12 L96 24 L110 8" stroke={BAR_COLOR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <ellipse cx="152" cy="26" rx="16" ry="11" fill={WEIGHT_COLOR} stroke={WEIGHT_OUTLINE} strokeWidth="2" />
                    <text
                        x="99"
                        y="48"
                        textAnchor="middle"
                        fill={textColor}
                        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        fontSize="18"
                        fontWeight="700"
                        letterSpacing="0.02em"
                    >
                        Nutriflex
                    </text>
                </>
            )}
        </svg>
    )
}

export default NutriflexLogo

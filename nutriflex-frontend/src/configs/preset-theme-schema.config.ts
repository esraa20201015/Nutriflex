export type Variables =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'neutral'

export type ThemeVariables = Record<'light' | 'dark', Record<Variables, string>>

const defaultTheme: ThemeVariables = {
    light: {
        // Nutriflex landing blue
        primary: '#1d293d',
        primaryDeep: '#020617',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#1d293d',
        primaryDeep: '#020617',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
}

const darkTheme: ThemeVariables = {
    light: {
        primary: '#18181b',
        primaryDeep: '#09090b',
        primaryMild: '#27272a',
        primarySubtle: '#18181b0d',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#ffffff',
        primaryDeep: '#09090b',
        primaryMild: '#e5e7eb',
        primarySubtle: '#ffffff1a',
        neutral: '#111827',
    },
}

const greenTheme: ThemeVariables = {
    light: {
        primary: '#0CAF60',
        primaryDeep: '#088d50',
        primaryMild: '#34c779',
        primarySubtle: '#0CAF601a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#0CAF60',
        primaryDeep: '#088d50',
        primaryMild: '#34c779',
        primarySubtle: '#0CAF601a',
        neutral: '#ffffff',
    },
}

const purpleTheme: ThemeVariables = {
    light: {
        primary: '#8C62FF',
        primaryDeep: '#704acc',
        primaryMild: '#a784ff',
        primarySubtle: '#8C62FF1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#8C62FF',
        primaryDeep: '#704acc',
        primaryMild: '#a784ff',
        primarySubtle: '#8C62FF1a',
        neutral: '#ffffff',
    },
}

// Nutriflex does not use an orange theme anymore; keep the key for compatibility
// but map it to the same blue-based palette as the default theme so users
// don't see inconsistent orange headers when "orange" is selected.
const orangeTheme: ThemeVariables = {
    light: {
        primary: '#1d293d',
        primaryDeep: '#020617',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
    dark: {
        // In dark mode we still keep primary as the deep blue;
        // pink is applied via component-level classes where needed.
        primary: '#1d293d',
        primaryDeep: '#020617',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
}

const presetThemeSchemaConfig: Record<string, ThemeVariables> = {
    default: defaultTheme,
    dark: darkTheme,
    green: greenTheme,
    purple: purpleTheme,
    orange: orangeTheme,
}

export default presetThemeSchemaConfig

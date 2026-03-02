export type Variables =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'neutral'

export type ThemeVariables = Record<'light' | 'dark', Record<Variables, string>>

/** Light mode = blue primary (#1d293d). Dark mode = pink primary (#fb64b6). useThemeSchema applies these when themeSchema is set; otherwise CSS .dark in index.css controls primary. */
const defaultTheme: ThemeVariables = {
    light: {
        primary: '#1d293d',
        primaryDeep: '#111827',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#fb64b6',
        primaryDeep: '#e91e8c',
        primaryMild: '#fd8ec9',
        primarySubtle: '#fb64b61a',
        neutral: '#ffffff',
    },
}

const darkTheme: ThemeVariables = {
    light: {
        primary: '#1d293d',
        primaryDeep: '#111827',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#fb64b6',
        primaryDeep: '#e91e8c',
        primaryMild: '#fd8ec9',
        primarySubtle: '#fb64b61a',
        neutral: '#0f172a',
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

const orangeTheme: ThemeVariables = {
    light: {
        primary: '#1d293d',
        primaryDeep: '#111827',
        primaryMild: '#334155',
        primarySubtle: '#1d293d1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#fb64b6',
        primaryDeep: '#e91e8c',
        primaryMild: '#fd8ec9',
        primarySubtle: '#fb64b61a',
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

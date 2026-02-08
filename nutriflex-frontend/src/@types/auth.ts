export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    status: number
    messageEn: string
    messageAr: string
    data: {
        access_token: string
        user: {
            id: string
            fullName: string
            email: string
            role: string
        }
    }
}

export type SignUpResponse = {
    status: number
    messageEn: string
    messageAr: string
    data: {
        id: string
        fullName: string
        email: string
        role: string
        isEmailVerified: boolean
    }
}

export type CoachProfile = {
    age: number
    gender: 'male' | 'female'
    qualificationFilePath: string
    certifications?: string
    experience?: string
    specialization?: string
    profilePicture?: string
    bio?: string
}

export type TraineeProfile = {
    age: number
    gender: 'male' | 'female'
    height: number
    weight: number
    fitnessGoals: string
    medicalConditions?: string
    dietaryPreferences?: string
}

export type SignUpCredential = {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    role: 'COACH' | 'TRAINEE'
    firstName?: string
    lastName?: string
    coachProfile?: CoachProfile
    traineeProfile?: TraineeProfile
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    id?: string | null
    avatar?: string | null
    fullName?: string | null
    userName?: string | null
    email?: string | null
    role?: string | null
    authority?: string[]
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}

export type VerifyEmailResponse = {
    status: number
    messageEn: string
    messageAr: string
    data: {
        email: string
    }
}

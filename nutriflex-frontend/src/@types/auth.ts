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
    fullName: string // Required when role is COACH
    age: number
    gender: 'male' | 'female'
    qualificationFilePath?: string
    certifications?: string
    experience?: string
    specialization?: string
    profilePicture?: string
    bio?: string
    /** Base64 or data URL for profile image (sign-up / coach profile). */
    profileImageBase64?: string
    /** Base64 or data URL for certification document (sign-up / coach profile). */
    certificationDocumentBase64?: string
}

export type TraineeProfile = {
    gender: 'male' | 'female'
    dateOfBirth: string
    fullName?: string
    /**
     * Snapshot fields stored on the profile in the backend.
     * These are populated from the dedicated bodyMeasurements step
     * during sign-up and from the Body Measurements section on Profile.
     */
    heightCm?: number | null
    weightKg?: number | null
    fitnessGoal?: string | null
    activityLevel?: string | null
    medicalNotes?: string | null
    dietaryPreference?: string | null
    /** Base64 or data URL for avatar (sign-up). */
    avatarBase64?: string
}

export type BodyMeasurementsPayload = {
    heightCm: number
    weightKg: number
    waistCm?: number | null
    chestCm?: number | null
    hipsCm?: number | null
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
    /**
     * Dedicated body measurements collected in the third step
     * for trainees during sign-up.
     */
    bodyMeasurements?: BodyMeasurementsPayload
    /**
     * Optional initial body measurement history row that will be
     * persisted on the backend when a trainee signs up.
     */
    initialBodyMeasurement?: {
        waistCm?: number | null
        chestCm?: number | null
        hipsCm?: number | null
    }
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

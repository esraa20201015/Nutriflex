/**
 * User Management API Types
 * These types match the backend Users API endpoints
 */

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type UserRole = 'ADMIN' | 'COACH' | 'TRAINEE'

export interface User {
    id: string
    fullName: string
    email: string
    role: UserRole
    status: UserStatus
    isEmailVerified: boolean
    createdAt: string
    updatedAt: string
    firstName?: string
    lastName?: string
    avatar?: string
}

export interface CoachProfile {
    id: string
    userId: string
    age: number
    gender: 'male' | 'female'
    qualificationFilePath: string
    certifications?: string
    experience?: string
    specialization?: string
    profilePicture?: string
    bio?: string
}

export interface TraineeProfile {
    id: string
    userId: string
    age: number
    gender: 'male' | 'female'
    height: number
    weight: number
    fitnessGoals: string
    medicalConditions?: string
    dietaryPreferences?: string
}

export interface UserWithProfile extends User {
    coachProfile?: CoachProfile
    traineeProfile?: TraineeProfile
}

/**
 * Create User Request (Admin only)
 */
export interface CreateUserRequest {
    fullName: string
    email: string
    password: string
    role: UserRole
    firstName?: string
    lastName?: string
    coachProfile?: Omit<CoachProfile, 'id' | 'userId'>
    traineeProfile?: Omit<TraineeProfile, 'id' | 'userId'>
}

/**
 * Update User Request (Admin only)
 */
export interface UpdateUserRequest {
    fullName?: string
    email?: string
    firstName?: string
    lastName?: string
    role?: UserRole
    status?: UserStatus
    coachProfile?: Partial<Omit<CoachProfile, 'id' | 'userId'>>
    traineeProfile?: Partial<Omit<TraineeProfile, 'id' | 'userId'>>
}

/**
 * Toggle User Status Request (Admin only)
 */
export interface ToggleUserStatusRequest {
    status: 'ACTIVE' | 'INACTIVE'
}

/**
 * User Response from API
 */
export interface UserResponse {
    status: number
    messageEn: string
    messageAr: string
    data: UserWithProfile
}

/**
 * Users List Response from API
 */
export interface UsersListResponse {
    status: number
    messageEn: string
    messageAr: string
    data: {
        users: UserWithProfile[]
        total: number
        skip: number
        take: number
    }
}

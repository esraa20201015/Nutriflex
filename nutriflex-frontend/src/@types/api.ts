// API Response Types

export type ApiResponse<T> = {
    status: number
    messageEn: string
    messageAr: string
    data: T
}

// Dashboard Types
export type UsersGrowthData = {
    date: string
    count: number
}

export type AdminDashboardData = {
    usersCount?: number
    plansCount?: number
    coachesCount?: number
    traineesCount?: number
    activeUsers?: number
    inactiveUsers?: number
    blockedUsers?: number
    pendingUsers?: number
    newUsersThisMonth?: number
    newUsersToday?: number
    usersGrowth?: UsersGrowthData[]
    recentUsers?: User[]
    [key: string]: unknown
}

export type AdminAccountsStatusData = {
    pendingCoaches: number
    pendingTrainees: number
    blockedUsers: number
    recentlyApproved: Array<{
        userId: string
        email: string
        role: string
        approvedAt: string
    }>
}

export type AdminActivityData = {
    activePlans: number
    completedPlans: number
    inactivePlans: number
    avgCompletionRate: number
    traineesWithNoActivity7Days: number
    traineesWithNoActivity30Days: number
}

export type AdminAlertsData = {
    alerts: Array<{
        type: string
        count: number
    }>
}

export type TraineeProgressOverview = {
    traineeId: string
    traineeName: string
    traineeEmail?: string
    activePlan?: string
    completionPercentage?: number
    lastActivity?: string
    status?: string
    [key: string]: unknown
}

export type CoachDashboardData = {
    assignedTrainees: number
    activeTrainees: number
    inactiveTrainees: number
    plansCreated: number
    completedPlans: number
    alerts: Array<{
        traineeId: string
        reason: string
    }>
}

export type CoachOverviewData = {
    assignedTrainees: number
    activeTrainees: number
    inactiveTrainees: number
    plansCreated: number
    activePlans: number
    completedPlans: number
}

export type CoachTraineeProgressItem = {
    traineeId: string
    name: string
    currentWeight: number | null
    weightChange30Days: number | null
    completionRate: number
    lastActivity: string | null
}

export type CoachTraineesProgressData = {
    trainees: CoachTraineeProgressItem[]
}

export type CoachAlertItem = {
    traineeId: string
    reason: string
}

export type CoachAlertsData = {
    alerts: CoachAlertItem[]
}

export type CoachRecentActivityItem = {
    type: 'WEIGHT_UPDATE' | 'PLAN_COMPLETED' | string
    trainee: string
    value?: string
    date: string
}

export type CoachRecentActivityData = {
    activities: CoachRecentActivityItem[]
}

export type WeightProgressData = {
    date: string
    weight: number
}

export type HealthSummary = {
    bmi?: number
    bodyFat?: number
    muscleMass?: number
    hydration?: number
    [key: string]: unknown
}

// Trainee Dashboard Types (New API Structure)
export type TraineeDashboardMainData = {
    currentWeight: number | null
    weightChange30Days: number | null
    activePlan: string | null
    completionPercentage: number | null
    lastMeasurementDate: string | null
}

export type TraineeOverviewData = {
    currentWeight: number | null
    weightChange7Days: number | null
    weightChange30Days: number | null
    activePlanName: string | null
    planCompletion: number
    daysActiveThisWeek: number
}

export type WeightHistoryItem = {
    date: string
    value: number
}

export type BodyMeasurementItem = {
    date: string
    waist: number | null
    chest: number | null
}

export type TraineeProgressData = {
    weightHistory: WeightHistoryItem[]
    bodyMeasurements: BodyMeasurementItem[]
}

export type TraineeTodayData = {
    todayWorkout: string | null
    todayMeals: number
    completedMeals: number
    completedWorkout: boolean
}

export type TraineeStatusData = {
    streakDays: number
    lastCheckIn: string | null
    coachName: string
}

// Legacy type for backward compatibility
export type TraineeDashboardData = {
    currentWeight?: number
    weightChange30Days?: number
    targetWeight?: number
    weightProgress?: WeightProgressData[]
    activePlan?: {
        id: string
        name: string
        startDate?: string
        endDate?: string
        [key: string]: unknown
    } | null
    completionPercentage?: number
    lastMeasurementDate?: string
    healthSummary?: HealthSummary
    [key: string]: unknown
}

// User Types
export type User = {
    id: string
    fullName: string
    email: string
    role: string
    status?: string
    isEmailVerified?: boolean
    createdAt?: string
    [key: string]: unknown
}

export type UsersListResponse = {
    users: User[]
    total?: number
    skip?: number
    take?: number
}

// Role Types
export type Role = {
    id: string
    name: string
    description?: string
    status?: string
    createdAt?: string
    [key: string]: unknown
}

export type RolesListResponse = {
    roles: Role[]
    total?: number
}

// Coach-Trainee Types
export type CoachTrainee = {
    id: string
    coachId: string
    traineeId: string
    status?: string
    trainee?: {
        id: string
        fullName: string
        email: string
        [key: string]: unknown
    }
    [key: string]: unknown
}

export type CoachTraineesListResponse = {
    coachTrainees: CoachTrainee[]
    total?: number
    skip?: number
    take?: number
}

// Plan Types
// Legacy type for backward compatibility
export type NutritionPlan = {
    id: string
    name: string
    description?: string
    coachId?: string
    traineeId?: string
    status?: string
    createdAt?: string
    [key: string]: unknown
}

// Coach Nutrition Plan (New API Structure)
export type CoachNutritionPlan = {
    id: string
    coach_id: string
    trainee_id: string
    title: string
    description: string | null
    daily_calories: number | null
    start_date: string
    end_date: string | null
    status: 'draft' | 'active' | 'archived'
    coach: {
        id: string
        fullName: string
        email: string
    }
    trainee: {
        id: string
        fullName: string
        email: string
    }
    created_date: string
    updated_date: string
}

export type PlansListResponse = {
    plans: CoachNutritionPlan[]
    total?: number
    skip?: number
    take?: number
    meta?: {
        total: number
        count: number
        skip: number
        take: number
    }
}

// Meal Types (Coach API Structure)
export type CoachMeal = {
    id: string
    nutrition_plan_id: string
    name: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories: number | null
    protein: number | null
    carbs: number | null
    fats: number | null
    instructions: string | null
    order_index: number
    created_date: string
    updated_date: string
}

export type MealsListResponse = {
    meals?: CoachMeal[]
    data?: CoachMeal[]
    total?: number
    count?: number
    skip?: number
    take?: number
    meta?: {
        total: number
        count: number
        skip: number
        take: number
    }
}

// DTOs for creating/updating
export type CreatePlanDto = {
    coach_id: string
    trainee_id: string
    title: string
    description?: string | null
    daily_calories?: number | null
    start_date: string
    end_date?: string | null
    status?: 'draft' | 'active' | 'archived'
}

export type UpdatePlanDto = {
    title?: string
    description?: string | null
    daily_calories?: number | null
    start_date?: string
    end_date?: string | null
    status?: 'draft' | 'active' | 'archived'
}

export type CreateMealDto = {
    nutrition_plan_id: string
    name: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fats?: number | null
    instructions?: string | null
    order_index?: number
}

// Coach Plan Wizard DTOs (create with details)
export type NutritionPlanStatus = 'draft' | 'active' | 'archived'

export type ExerciseType = 'cardio' | 'strength' | 'calisthenics' | 'flexibility'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface PlanExerciseDto {
    exercise_id?: string
    name: string
    exercise_type: ExerciseType
    day_index?: number
    sets?: number | null
    reps?: number | null
    duration_minutes?: number | null
    notes?: string | null
    order_index?: number
}

export interface MealIngredientInputDto {
    name: string
    quantity?: number | null
    unit?: string | null
    calories?: number | null
    notes?: string | null
    order_index?: number
}

export interface PlanMealDto {
    meal_type: MealType
    name: string
    calories?: number | null
    instructions?: string | null
    order_index?: number
    ingredients?: MealIngredientInputDto[]
}

export interface CreatePlanWithDetailsDto {
    coach_id: string
    trainee_id: string
    title: string
    description?: string | null
    daily_calories?: number | null
    start_date: string
    end_date?: string | null
    status?: NutritionPlanStatus
    exercises?: PlanExerciseDto[]
    meals?: PlanMealDto[]
}

export type UpdateMealDto = {
    name?: string
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fats?: number | null
    instructions?: string | null
    order_index?: number
}

// Trainee Plans API Types (New Structure)
export type TraineeNutritionPlan = {
    id: string
    title: string
    description: string | null
    daily_calories: number | null
    start_date: string
    end_date: string | null
    status: 'draft' | 'active' | 'archived'
    coach: {
        id: string
        fullName: string
        email: string
    }
    completionStatus: {
        completion_percentage: number
        status: 'not_started' | 'in_progress' | 'completed'
        last_updated: string | null
    }
    created_date: string
    updated_date: string
}

export type TraineePlansListResponse = {
    data: TraineeNutritionPlan[]
    meta: {
        total: number
        count: number
        skip: number
        take: number
    }
}

export type Meal = {
    id: string
    name: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories: number | null
    protein: number | null
    carbs: number | null
    fats: number | null
    instructions: string | null
    order_index: number
}

export type TraineePlanDetails = TraineeNutritionPlan & {
    meals: Meal[]
}

export type PlanMealsResponse = {
    planId: string
    planTitle: string
    meals: Meal[]
    groupedByType: {
        breakfast: Meal[]
        lunch: Meal[]
        dinner: Meal[]
        snack: Meal[]
    }
}

export type PlanStatusData = {
    planId: string
    planTitle: string
    completion_percentage: number
    status: 'not_started' | 'in_progress' | 'completed'
    last_updated: string | null
    daysRemaining: number
    daysElapsed: number
    totalDays: number
}

// Trainee Plan Status Types
export type TraineePlanStatus = {
    id: string
    traineeId: string
    planId: string
    status?: string
    completionPercentage?: number
    startDate?: string
    endDate?: string
    [key: string]: unknown
}

export type TraineePlanStatusListResponse = {
    statuses: TraineePlanStatus[]
    total?: number
}

// Health Metric Types
export type HealthMetric = {
    id: string
    traineeId: string
    metricType: 'weight' | 'steps' | 'heart_rate' | 'bp'
    value: number
    recordedAt: string
    [key: string]: unknown
}

export type HealthMetricsListResponse = {
    metrics: HealthMetric[]
    total?: number
}

// Body Measurement Types
export type BodyMeasurement = {
    id: string
    traineeId: string
    measurements: {
        chest?: number
        waist?: number
        hips?: number
        arms?: number
        thighs?: number
        [key: string]: unknown
    }
    recordedAt: string
    [key: string]: unknown
}

export type BodyMeasurementsListResponse = {
    measurements: BodyMeasurement[]
    total?: number
}

// Trainee Progress Types
export type TraineeProgress = {
    traineeId: string
    periodType?: string
    weightChange?: number
    bodyFatChange?: number
    muscleMassChange?: number
    [key: string]: unknown
}

export type TraineeProgressResponse = {
    progress: TraineeProgress[]
    total?: number
}

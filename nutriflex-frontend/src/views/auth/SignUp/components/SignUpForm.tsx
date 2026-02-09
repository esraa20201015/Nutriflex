import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import Radio from '@/components/ui/Radio'
import Steps from '@/components/ui/Steps'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { SignUpCredential } from '@/@types/auth'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
    preselectedRole?: 'COACH' | 'TRAINEE'
}

// Base validation schema - updated to make firstName and lastName required
const baseSchema = z.object({
    firstName: z
        .string({ required_error: 'First name is required' })
        .min(1, { message: 'First name is required' })
        .max(255, { message: 'First name must be less than 255 characters' }),
    lastName: z
        .string({ required_error: 'Last name is required' })
        .min(1, { message: 'Last name is required' })
        .max(255, { message: 'Last name must be less than 255 characters' }),
    email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'Invalid email format' })
        .max(255, { message: 'Email must be less than 255 characters' }),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[A-Z]/, {
            message: 'Password must contain at least one uppercase letter',
        })
        .regex(/[a-z]/, {
            message: 'Password must contain at least one lowercase letter',
        })
        .regex(/[0-9]/, {
            message: 'Password must contain at least one number',
        }),
    confirmPassword: z.string({
        required_error: 'Please confirm your password',
    }),
    role: z.enum(['COACH', 'TRAINEE'], {
        required_error: 'Please select a role',
    }),
    fullName: z.string().optional(), // Will be generated from firstName + lastName
})

// Coach profile schema
const coachProfileSchema = z.object({
    age: z
        .number({ required_error: 'Age is required' })
        .min(1, { message: 'Age must be at least 1' })
        .max(120, { message: 'Age must be at most 120' }),
    gender: z.enum(['male', 'female'], {
        required_error: 'Gender is required',
    }),
    qualificationFilePath: z.string().max(500).optional(),
    certifications: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().max(255).optional(),
    profilePicture: z.string().max(500).optional(),
    bio: z.string().optional(),
    profileImageBase64: z.string().optional(),
    certificationDocumentBase64: z.string().optional(),
})

// Trainee profile schema
const traineeProfileSchema = z.object({
    age: z
        .number({ required_error: 'Age is required' })
        .min(1, { message: 'Age must be at least 1' })
        .max(120, { message: 'Age must be at most 120' }),
    gender: z.enum(['male', 'female'], {
        required_error: 'Gender is required',
    }),
    height: z
        .number({ required_error: 'Height is required' })
        .min(0, { message: 'Height must be at least 0' })
        .max(300, { message: 'Height must be at most 300 cm' }),
    weight: z
        .number({ required_error: 'Weight is required' })
        .min(0, { message: 'Weight must be at least 0' })
        .max(500, { message: 'Weight must be at most 500 kg' }),
    fitnessGoals: z
        .string({ required_error: 'Fitness goals are required' })
        .min(1, { message: 'Fitness goals are required' }),
    medicalConditions: z.string().optional(),
    dietaryPreferences: z.string().optional(),
    avatarBase64: z.string().optional(),
})

// Combined schema with conditional validation
const validationSchema: ZodType<SignUpCredential> = baseSchema
    .extend({
        coachProfile: coachProfileSchema.optional(),
        traineeProfile: traineeProfileSchema.optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
    })
    .refine(
        (data) => {
            if (data.role === 'COACH') {
                return !!data.coachProfile
            }
            return true
        },
        {
            message: 'Coach profile is required for COACH sign-up',
            path: ['coachProfile'],
        },
    )
    .refine(
        (data) => {
            if (data.role === 'TRAINEE') {
                return !!data.traineeProfile
            }
            return true
        },
        {
            message: 'Trainee profile is required for TRAINEE sign-up',
            path: ['traineeProfile'],
        },
    )

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage, preselectedRole } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [step, setStep] = useState(0)
    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        trigger,
    } = useForm<SignUpCredential>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            role: preselectedRole,
        },
        mode: 'onChange',
    })

    const selectedRole = watch('role') || preselectedRole
    const firstName = watch('firstName')
    const lastName = watch('lastName')

    // Generate fullName from firstName and lastName
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : ''

    /** Read a file as base64 data URL for API upload. */
    const readFileAsDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
        })

    const onNext = async () => {
        // Validate step 1 fields before proceeding
        const isValid = await trigger([
            'firstName',
            'lastName',
            'email',
            'password',
            'confirmPassword',
        ])
        if (isValid) {
            setStep(1)
        }
    }

    const onPrevious = () => {
        setStep(0)
    }

    const onSignUp = async (values: SignUpCredential) => {
        if (!disableSubmit) {
            setSubmitting(true)

            // Clean up the data based on role
            const submitData: SignUpCredential = {
                fullName: fullName || values.fullName || `${values.firstName} ${values.lastName}`,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                role: values.role || preselectedRole!,
            }

            // Add role-specific profile
            if (values.role === 'COACH' && values.coachProfile) {
                submitData.coachProfile = values.coachProfile
            } else if (values.role === 'TRAINEE' && values.traineeProfile) {
                submitData.traineeProfile = values.traineeProfile
            }

            const result = await signUp(submitData)

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            } else if (result?.status === 'success') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    const stepTitles =
        selectedRole === 'COACH'
            ? ['Account Information', 'Coach Profile']
            : ['Account Information', 'Trainee Profile']

    return (
        <div className={`${className ?? ''} [&_.form-label]:whitespace-nowrap`}>
            <Steps current={step} className="mb-5">
                <Steps.Item title={stepTitles[0]} />
                <Steps.Item title={stepTitles[1]} />
            </Steps>

            <Form onSubmit={handleSubmit(onSignUp)}>
                {/* Step 1: Account Information - vertical layout, labels above, single Next button */}
                {step === 0 && (
                    <div className="flex flex-col">
                        <FormItem
                            className="mb-2"
                            label="First Name"
                            invalid={Boolean(errors.firstName)}
                            errorMessage={errors.firstName?.message}
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="First Name"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            className="mb-2"
                            label="Last Name"
                            invalid={Boolean(errors.lastName)}
                            errorMessage={errors.lastName?.message}
                        >
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="Last Name"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            className="mb-2"
                            label="Email"
                            invalid={Boolean(errors.email)}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <div className="mb-4 flex gap-4">
                            <FormItem
                                className="mb-0 flex-1"
                                label="Password"
                                invalid={Boolean(errors.password)}
                                errorMessage={errors.password?.message}
                            >
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordInput
                                            type="text"
                                            placeholder="Password"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                className="mb-0 flex-1"
                                label="Confirm Password"
                                invalid={Boolean(errors.confirmPassword)}
                                errorMessage={errors.confirmPassword?.message}
                            >
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordInput
                                            type="text"
                                            placeholder="Confirm Password"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        {/* Hidden role field */}
                        {preselectedRole && (
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <input type="hidden" {...field} value={preselectedRole} />
                                )}
                            />
                        )}

                        <div className="mt-2 flex justify-end">
                            <Button
                                variant="solid"
                                type="button"
                                onClick={onNext}
                                size="md"
                                className="min-w-[120px]"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Profile Information - same vertical formatting */}
                {step === 1 && (
                    <div className="flex flex-col">
                        {/* Coach Profile Fields */}
                        {selectedRole === 'COACH' && (
                            <>
                                <div className="mb-2">
                                    <h4 className="text-lg font-semibold">Coach Profile</h4>
                                </div>

                                <FormItem
                                    className="mb-2"
                                    label="Age"
                                    invalid={Boolean(errors.coachProfile?.age)}
                                    errorMessage={errors.coachProfile?.age?.message}
                                >
                                    <Controller
                                        name="coachProfile.age"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="Age"
                                                autoComplete="off"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            ? parseInt(e.target.value, 10)
                                                            : undefined,
                                                    )
                                                }
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Gender"
                                    layout="horizontal"
                                    invalid={Boolean(errors.coachProfile?.gender)}
                                    errorMessage={errors.coachProfile?.gender?.message}
                                >
                                    <Controller
                                        name="coachProfile.gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Radio.Group
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                            >
                                                <Radio value="male">Male</Radio>
                                                <Radio value="female">Female</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Qualification file path"
                                    invalid={Boolean(
                                        errors.coachProfile?.qualificationFilePath,
                                    )}
                                    errorMessage={
                                        errors.coachProfile?.qualificationFilePath?.message
                                    }
                                >
                                    <Controller
                                        name="coachProfile.qualificationFilePath"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="/uploads/qualifications/cv.pdf"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Certifications"
                                    invalid={Boolean(errors.coachProfile?.certifications)}
                                    errorMessage={
                                        errors.coachProfile?.certifications?.message
                                    }
                                >
                                    <Controller
                                        name="coachProfile.certifications"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="CPR, NASM, etc."
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Experience"
                                    invalid={Boolean(errors.coachProfile?.experience)}
                                    errorMessage={errors.coachProfile?.experience?.message}
                                >
                                    <Controller
                                        name="coachProfile.experience"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="5 years"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Specialization"
                                    invalid={Boolean(
                                        errors.coachProfile?.specialization,
                                    )}
                                    errorMessage={
                                        errors.coachProfile?.specialization?.message
                                    }
                                >
                                    <Controller
                                        name="coachProfile.specialization"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="Strength training"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Profile image"
                                    invalid={Boolean(
                                        errors.coachProfile?.profileImageBase64,
                                    )}
                                    errorMessage={
                                        errors.coachProfile?.profileImageBase64?.message
                                    }
                                >
                                    <Controller
                                        name="coachProfile.profileImageBase64"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-white file:hover:bg-primary-mild"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            const dataUrl = await readFileAsDataUrl(file)
                                                            field.onChange(dataUrl)
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                />
                                                {field.value && (
                                                    <img
                                                        src={field.value}
                                                        alt="Profile preview"
                                                        className="h-20 w-20 rounded object-cover border border-gray-200"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    className="mb-2"
                                    label="Certification document"
                                    invalid={Boolean(
                                        errors.coachProfile?.certificationDocumentBase64,
                                    )}
                                    errorMessage={
                                        errors.coachProfile?.certificationDocumentBase64?.message
                                    }
                                >
                                    <Controller
                                        name="coachProfile.certificationDocumentBase64"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-white file:hover:bg-primary-mild"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            const dataUrl = await readFileAsDataUrl(file)
                                                            field.onChange(dataUrl)
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                />
                                                {field.value && (
                                                    field.value.startsWith('data:image/') ? (
                                                        <img
                                                            src={field.value}
                                                            alt="Certification preview"
                                                            className="max-h-24 rounded border border-gray-200 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Document selected</span>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Bio"
                                    invalid={Boolean(errors.coachProfile?.bio)}
                                    errorMessage={errors.coachProfile?.bio?.message}
                                >
                                    <Controller
                                        name="coachProfile.bio"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="Experienced fitness coach"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </>
                        )}

                        {/* Trainee Profile Fields */}
                        {selectedRole === 'TRAINEE' && (
                            <>
                                <div className="mb-2">
                                    <h4 className="text-lg font-semibold">Trainee Profile</h4>
                                </div>

                                <FormItem
                                    className="mb-2 min-w-0"
                                    label="Profile avatar"
                                    invalid={Boolean(
                                        errors.traineeProfile?.avatarBase64,
                                    )}
                                    errorMessage={
                                        errors.traineeProfile?.avatarBase64?.message
                                    }
                                >
                                    <Controller
                                        name="traineeProfile.avatarBase64"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="min-w-0 w-full overflow-hidden space-y-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="block w-full min-w-0 max-w-full text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-white file:hover:bg-primary-mild"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            const dataUrl = await readFileAsDataUrl(file)
                                                            field.onChange(dataUrl)
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                />
                                                {field.value && (
                                                    <img
                                                        src={field.value}
                                                        alt="Avatar preview"
                                                        className="h-14 w-14 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Age"
                                    invalid={Boolean(errors.traineeProfile?.age)}
                                    errorMessage={errors.traineeProfile?.age?.message}
                                >
                                    <Controller
                                        name="traineeProfile.age"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="Age"
                                                autoComplete="off"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            ? parseInt(e.target.value, 10)
                                                            : undefined,
                                                    )
                                                }
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Gender"
                                    layout="horizontal"
                                    invalid={Boolean(errors.traineeProfile?.gender)}
                                    errorMessage={
                                        errors.traineeProfile?.gender?.message
                                    }
                                >
                                    <Controller
                                        name="traineeProfile.gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Radio.Group
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                            >
                                                <Radio value="male">Male</Radio>
                                                <Radio value="female">Female</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </FormItem>

                                <div className="grid gap-4 md:grid-cols-2 mb-1">
                                    <FormItem
                                        className="mb-0"
                                        label="Height (cm)"
                                        invalid={Boolean(errors.traineeProfile?.height)}
                                        errorMessage={errors.traineeProfile?.height?.message}
                                    >
                                        <Controller
                                            name="traineeProfile.height"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="165.5"
                                                    autoComplete="off"
                                                    step="0.1"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : undefined,
                                                        )
                                                    }
                                                    value={field.value || ''}
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        className="mb-0"
                                        label="Weight (kg)"
                                        invalid={Boolean(errors.traineeProfile?.weight)}
                                        errorMessage={errors.traineeProfile?.weight?.message}
                                    >
                                        <Controller
                                            name="traineeProfile.weight"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="60.5"
                                                    autoComplete="off"
                                                    step="0.1"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : undefined,
                                                        )
                                                    }
                                                    value={field.value || ''}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>

                                <FormItem
                                    className="mb-2"
                                    label="Fitness Goals"
                                    layout="horizontal"
                                    invalid={Boolean(
                                        errors.traineeProfile?.fitnessGoals,
                                    )}
                                    errorMessage={
                                        errors.traineeProfile?.fitnessGoals?.message
                                    }
                                >
                                    <Controller
                                        name="traineeProfile.fitnessGoals"
                                        control={control}
                                        render={({ field }) => (
                                            <Radio.Group
                                                value={field.value || ''}
                                                onChange={(value) => field.onChange(value)}
                                            >
                                                <Radio value="Build Muscles">Build Muscles</Radio>
                                                <Radio value="Lose weight">Lose weight</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-2"
                                    label="Medical Conditions"
                                    invalid={Boolean(
                                        errors.traineeProfile?.medicalConditions,
                                    )}
                                    errorMessage={
                                        errors.traineeProfile?.medicalConditions?.message
                                    }
                                >
                                    <Controller
                                        name="traineeProfile.medicalConditions"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="None"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    className="mb-3 flex flex-nowrap items-center gap-x-2"
                                    label="Dietary Preferences"
                                    layout="inline"
                                    invalid={Boolean(
                                        errors.traineeProfile?.dietaryPreferences,
                                    )}
                                    errorMessage={
                                        errors.traineeProfile?.dietaryPreferences
                                            ?.message
                                    }
                                >
                                    <Controller
                                        name="traineeProfile.dietaryPreferences"
                                        control={control}
                                        render={({ field }) => (
                                            <Radio.Group
                                                value={field.value || ''}
                                                onChange={(value) => field.onChange(value)}
                                                className="inline-flex flex-nowrap items-center gap-2"
                                            >
                                                <Radio value="normal">Normal</Radio>
                                                <Radio value="vegetarian">Vegetarian</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </FormItem>
                            </>
                        )}

                        <div className="mt-2 flex justify-between items-center gap-4">
                            <Button
                                variant="default"
                                type="button"
                                onClick={onPrevious}
                                size="md"
                                className="min-w-[120px] !bg-primary-mild !text-white border-0 hover:!bg-primary"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmitting}
                                disabled={!selectedRole}
                                size="md"
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </div>
    )
}

export default SignUpForm

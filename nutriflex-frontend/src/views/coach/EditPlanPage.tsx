import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetPlan, apiUpdatePlan } from '@/services/CoachService'
import type { NutritionPlan } from '@/@types/api'
import { GroupBase, SingleValue } from 'react-select'
const statusOptions = ['draft', 'active', 'archived'] as const

const EditPlanPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<typeof statusOptions[number]>('draft')
  const [dailyCalories, setDailyCalories] = useState<number | ''>('')

  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true)
        const response = await apiGetPlan(id!)
        const data = response.data
        setPlan(data)
        setTitle(data.title as string)
        setDescription(data.description || '')
        setStatus(data.status as typeof statusOptions[number])
        setDailyCalories(data.daily_calories as unknown as number | '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan')
      } finally {
        setLoading(false)
      }
    }
    loadPlan()
  }, [id])

  // Save updates
  const handleSave = async () => {
    if (!plan) return
    try {
      setSaving(true)
      await apiUpdatePlan(plan.id, {
        title,
        description,
        status,
        daily_calories: typeof dailyCalories === 'number' ? dailyCalories : 0,
      })
      toast.push(
        <Notification type="success" title="Success">
          Plan updated successfully
        </Notification>
      )
      navigate('/coach/plans')
    } catch (err) {
      toast.push(
        <Notification type="danger" title="Error">
          {err instanceof Error ? err.message : 'Failed to update plan'}
        </Notification>
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CustomIndicator />

  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!plan) return <div className="text-center">Plan not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Plan</h2>
        <Button variant="solid" onClick={() => navigate('/coach/plans')}>
          Back to Plans
        </Button>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          {/* Title */}
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setTitle(e.target.value)
            }
          />

          {/* Description */}
          <Input
            textArea
            rows={4}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
          />

          {/* Status */}
          <Select
            value={status}
            onChange={(newValue: SingleValue<typeof statusOptions[number]>) => setStatus(newValue as typeof statusOptions[number])}
            options={statusOptions.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })) as unknown as GroupBase<typeof statusOptions[number]>[] as GroupBase<typeof statusOptions[number]>[]}
          />

          {/* Daily Calories */}
          <Input
            type="number"
            value={dailyCalories}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDailyCalories(e.target.value === '' ? '' : Number(e.target.value))
            }
          />

          <div className="flex gap-2 mt-4">
            <Button variant="solid" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="plain" onClick={() => navigate('/coach/plans')}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EditPlanPage

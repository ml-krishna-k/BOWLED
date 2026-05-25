import { useRef, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useAdmin } from '@/context/AdminContext'
import type { Meal, MealSlot } from '@/types'
import { cn } from '@/lib/cn'
import { uploadImage } from '@/lib/upload'
import { ApiError } from '@/lib/api'

const SLOTS: { id: MealSlot; label: string; time: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', time: '7 – 9 AM', icon: '🌅' },
  { id: 'lunch',     label: 'Lunch',     time: '12:30 – 2 PM', icon: '🍛' },
  { id: 'dinner',    label: 'Dinner',    time: '7:30 – 9 PM', icon: '🌙' },
]

export function AdminMenuEditor() {
  const { menu, todayIdx, saveMenuMeal } = useAdmin()
  const [dayIdx, setDayIdx] = useState(todayIdx)
  const [editing, setEditing] = useState<{ slot: MealSlot; meal: Meal } | null>(null)

  const day = menu[dayIdx]

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Menu editor"
        title="Weekly rotating menu"
        description="Edit any meal for any day. Changes go live immediately for tomorrow's deliveries."
      />

      {/* Day picker */}
      <div className="mt-6 overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 rounded-2xl bg-paper border border-cream-200 p-2">
          {menu.map((d, i) => {
            const isToday = i === todayIdx
            const active = i === dayIdx
            return (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                className={cn(
                  'flex-1 min-w-[72px] rounded-xl px-3 py-2.5 text-center transition-colors',
                  active ? 'bg-ink-900 text-cream-50' : 'text-ink-700 hover:bg-cream-100',
                )}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-70">{d.short}</p>
                <p className="font-display text-sm sm:text-base">{d.day.slice(0, 3)}</p>
                {isToday && !active && (
                  <p className="mt-0.5 text-[10px] font-semibold text-saffron-700">Today</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Slot cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {SLOTS.map((s) => {
          const meal = day.meals[s.id]
          return (
            <Card key={s.id} className="p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-eyebrow text-ink-500">{s.icon} {s.label}</p>
                <span className="text-xs text-ink-500">{s.time}</span>
              </div>

              {meal.imageUrl ? (
                <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-cream-100">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-4 aspect-[16/9] rounded-2xl border border-dashed border-cream-300 bg-cream-50 grid place-items-center text-xs text-ink-400">
                  No image yet
                </div>
              )}

              <h3 className="mt-3 font-display text-xl text-ink-900">{meal.name}</h3>
              <p className="mt-1 text-sm text-ink-500 line-clamp-3">{meal.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge tone={meal.isVeg ? 'leaf' : 'saffron'}>{meal.isVeg ? 'Veg' : 'Non-veg'}</Badge>
                <Badge tone="cream">{meal.calories} kcal</Badge>
                <Badge tone="paper">★ {meal.rating}</Badge>
                {meal.loved && <Badge tone="saffron">❤ Loved</Badge>}
              </div>

              {meal.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {meal.tags.map((t) => (
                    <span key={t} className="text-[11px] text-ink-500">#{t}</span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditing({ slot: s.id, meal })}
                >
                  Edit meal
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {editing && (
        <MealEditor
          dayLabel={day.day}
          slot={editing.slot}
          meal={editing.meal}
          onCancel={() => setEditing(null)}
          onSave={async (m) => {
            await saveMenuMeal(dayIdx, editing.slot, m)
            setEditing(null)
          }}
        />
      )}
    </AppContainer>
  )
}

function MealEditor({
  dayLabel,
  slot,
  meal,
  onCancel,
  onSave,
}: {
  dayLabel: string
  slot: MealSlot
  meal: Meal
  onCancel: () => void
  onSave: (m: Meal) => void | Promise<void>
}) {
  const [draft, setDraft] = useState<Meal>(meal)
  const [tagsInput, setTagsInput] = useState(meal.tags.join(', '))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function update<K extends keyof Meal>(k: K, v: Meal[K]) {
    setDraft((prev) => ({ ...prev, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      await onSave({
        ...draft,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setSaveError('Could not save — image upload service is not configured on the server.')
      } else {
        setSaveError(err instanceof Error ? err.message : 'Could not save')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl bg-paper p-6 shadow-card max-h-[90vh] overflow-y-auto"
      >
        <p className="text-eyebrow">{dayLabel} · {slot}</p>
        <h2 className="mt-1 text-display text-2xl text-ink-900">Edit meal</h2>

        <div className="mt-5 space-y-4">
          <ImageUploadField
            value={draft.imageUrl}
            onChange={(url) => update('imageUrl', url)}
          />

          <Input
            label="Meal name"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-cream-300 bg-paper px-4 py-3 text-sm text-ink-900 focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories (kcal)"
              type="number"
              value={String(draft.calories)}
              onChange={(e) => update('calories', Number(e.target.value) || 0)}
            />
            <Input
              label="Rating (0 – 5)"
              type="number"
              step="0.1"
              max="5"
              min="0"
              value={String(draft.rating)}
              onChange={(e) => update('rating', Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            hint="e.g. home-style, comfort, light"
          />

          <div className="grid grid-cols-2 gap-3">
            <ToggleField
              label="Vegetarian"
              checked={draft.isVeg}
              onChange={(v) => update('isVeg', v)}
            />
            <ToggleField
              label="Most loved"
              checked={!!draft.loved}
              onChange={(v) => update('loved', v)}
            />
          </div>
        </div>

        {saveError && (
          <p className="mt-4 rounded-xl bg-spice-50 px-3 py-2 text-sm text-spice-700">{saveError}</p>
        )}

        <div className="mt-7 flex gap-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-[2]" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function ImageUploadField({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (url: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setErr(null)
    setUploading(true)
    try {
      const res = await uploadImage(file, 'menu')
      onChange(res.url)
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 503) {
        setErr('Image uploads are not configured on the server (Cloudinary keys missing).')
      } else {
        setErr(e2 instanceof Error ? e2.message : 'Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink-700">Meal photo</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-cream-200">
          <img src={value} alt="Meal preview" className="aspect-[16/9] w-full object-cover" />
          <div className="flex items-center justify-end gap-2 border-t border-cream-200 bg-paper p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
              disabled={uploading}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 py-8 text-sm transition-colors',
            'hover:border-saffron-300 hover:bg-saffron-50',
            uploading && 'opacity-60',
          )}
        >
          <span className="text-2xl">📸</span>
          <span className="font-medium text-ink-700">
            {uploading ? 'Uploading to Cloudinary…' : 'Upload meal photo'}
          </span>
          <span className="text-xs text-ink-500">JPG, PNG or WebP · up to 6 MB</span>
        </button>
      )}
      {err && <p className="mt-2 text-xs text-spice-700">{err}</p>}
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors',
        checked
          ? 'border-saffron-400 bg-saffron-50 text-saffron-700'
          : 'border-cream-300 bg-paper text-ink-700',
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-saffron-500' : 'bg-cream-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

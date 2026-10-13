<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useT } from '../../composables/useLang'

/** The active prompts, in order: drag to reorder, ✕ to remove, and a blank row that opens the library. */
const props = defineProps<{
  title: string
  intro: string
  /** Active prompts, in order. */
  prompts: string[]
  /** The skeleton row's label and the library page it opens. */
  addLabel: string
  libraryHref: string
}>()
const emit = defineEmits<{ change: [prompts: string[]] }>()
const t = useT()

const list = ref<HTMLOListElement | null>(null)

const reorder = (from: number, to: number) => {
  if (from === to) return
  const next = [...props.prompts]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  emit('change', next)
}
const remove = (p: string) => {
  if (props.prompts.length > 1) emit('change', props.prompts.filter((q) => q !== p))
}

// Dragging by the grip: the row follows the finger and the others make room. Pointer events, so
// it works the same with touch, pen and mouse.
type Drag = { from: number; to: number; dy: number; startY: number; mids: number[]; step: number }
const drag = ref<Drag | null>(null)

const rows = () => [...(list.value?.querySelectorAll<HTMLElement>(':scope > li.prompt-row') ?? [])]

const onGripDown = (i: number, e: PointerEvent) => {
  if (e.button !== 0 || props.prompts.length < 2) return
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const rects = rows().map((r) => r.getBoundingClientRect())
  // the dragged row's height plus the gap between rows: how far the others move to make room
  const gap = rects.length > 1 ? rects[1].top - rects[0].bottom : 0
  const step = rects[i].height + gap
  drag.value = { from: i, to: i, dy: 0, startY: e.clientY, mids: rects.map((r) => r.top + r.height / 2), step }
}
const onGripMove = (e: PointerEvent) => {
  const d = drag.value
  if (!d) return
  const dy = e.clientY - d.startY
  const centre = d.mids[d.from] + dy
  let to = 0
  d.mids.forEach((mid, j) => {
    if (j !== d.from && centre > mid) to++
  })
  drag.value = { ...d, dy, to }
}
const onGripUp = () => {
  const d = drag.value
  drag.value = null
  if (d) reorder(d.from, d.to)
}

const rowStyle = (i: number) => {
  const d = drag.value
  if (!d) return undefined
  if (i === d.from) return { transform: `translateY(${d.dy}px)`, transition: 'none', zIndex: 2 }
  if (d.from < i && i <= d.to) return { transform: `translateY(${-d.step}px)` }
  if (d.to <= i && i < d.from) return { transform: `translateY(${d.step}px)` }
  return { transform: 'none' }
}

// Arrow keys on the grip move a prompt one place, keeping focus on its grip.
const onGripKey = async (i: number, e: KeyboardEvent) => {
  const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
  const to = i + delta
  if (!delta || to < 0 || to >= props.prompts.length) return
  e.preventDefault()
  reorder(i, to)
  await nextTick()
  rows()[to]?.querySelector<HTMLElement>('.grip')?.focus()
}

const dragging = computed(() => drag.value !== null)
</script>

<template>
  <div class="card mb-4 rounded-sm border border-base-300 bg-base-100">
    <div class="card-body gap-2 p-4">
      <h2 class="card-title text-xl font-normal italic">{{ title }}</h2>
      <p class="text-sm text-base-content/70">{{ intro }}</p>
      <ol ref="list" :class="['active-list mt-2 grid gap-2', { dragging }]">
        <li
          v-for="(p, i) in prompts"
          :key="p"
          :class="['prompt-row relative flex items-center gap-1 rounded-sm bg-base-200 py-2 pl-1 pr-1', { lifted: drag?.from === i }]"
          :style="rowStyle(i)"
        >
          <button
            type="button"
            class="grip btn btn-ghost btn-square btn-sm"
            :aria-label="t.dragPrompt(p)"
            :title="t.dragPrompt(p)"
            @pointerdown="onGripDown(i, $event)"
            @pointermove="onGripMove"
            @pointerup="onGripUp"
            @pointercancel="onGripUp"
            @keydown="onGripKey(i, $event)"
          >
            <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
              <g fill="currentColor">
                <circle cx="2.5" cy="3" r="1.4" /><circle cx="7.5" cy="3" r="1.4" />
                <circle cx="2.5" cy="8" r="1.4" /><circle cx="7.5" cy="8" r="1.4" />
                <circle cx="2.5" cy="13" r="1.4" /><circle cx="7.5" cy="13" r="1.4" />
              </g>
            </svg>
          </button>
          <span class="mr-2 grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-normal text-primary-content">
            {{ i + 1 }}
          </span>
          <span class="grow">{{ p }}</span>
          <button class="btn btn-ghost btn-square btn-sm" :disabled="prompts.length === 1" :aria-label="t.removePrompt(p)" @click="remove(p)">
            ✕
          </button>
        </li>
        <li>
          <!-- a blank row in the list's own shape, for adding: it opens the prompt library -->
          <a
            class="skeleton-row flex items-center gap-1 rounded-sm border border-dashed border-base-300 py-2 pl-1 pr-3 text-base-content/60"
            :href="libraryHref"
          >
            <span class="grid size-8 flex-none place-items-center" aria-hidden="true"></span>
            <span class="mr-2 grid size-7 flex-none place-items-center rounded-full border border-dashed border-base-content/40" aria-hidden="true">+</span>
            <span class="grow italic">{{ addLabel }}</span>
            <span class="text-xl" aria-hidden="true">›</span>
          </a>
        </li>
      </ol>
    </div>
  </div>
</template>

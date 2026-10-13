<script setup lang="ts">
import { ref } from 'vue'
import LibraryRow from './LibraryRow.vue'
import { useT } from './useLang'
import type { PromptGroup } from './prompts'

const props = defineProps<{
  title: string
  intro: string
  libraryTitle: string
  /** Active prompts, in order. */
  prompts: string[]
  /** User-written prompts, shown in the library under "Your own". */
  custom: string[]
  library: PromptGroup[]
  defaults: string[]
}>()
const emit = defineEmits<{ change: [patch: { prompts?: string[]; custom?: string[] }] }>()
const t = useT()
const draft = ref('')

const toggle = (text: string) => {
  const { prompts } = props
  if (prompts.includes(text)) {
    if (prompts.length > 1) emit('change', { prompts: prompts.filter((p) => p !== text) })
  } else {
    emit('change', { prompts: [...prompts, text] })
  }
}
const move = (i: number, delta: number) => {
  const next = [...props.prompts]
  ;[next[i], next[i + delta]] = [next[i + delta], next[i]]
  emit('change', { prompts: next })
}
const add = () => {
  const text = draft.value.trim()
  if (!text) return
  const { prompts, custom } = props
  emit('change', {
    custom: custom.includes(text) ? custom : [...custom, text],
    prompts: prompts.includes(text) ? prompts : [...prompts, text],
  })
  draft.value = ''
}
const remove = (text: string) => {
  const nextPrompts = props.prompts.filter((p) => p !== text)
  emit('change', { custom: props.custom.filter((p) => p !== text), prompts: nextPrompts.length ? nextPrompts : props.defaults })
}
</script>

<template>
  <div class="card mb-4 rounded-sm border border-base-300 bg-base-100">
    <div class="card-body gap-2 p-4">
      <h2 class="card-title text-xl font-normal italic">{{ title }}</h2>
      <p class="text-sm text-base-content/70">{{ intro }}</p>
      <ol class="active-list mt-2 grid gap-2">
        <li v-for="(p, i) in prompts" :key="p" class="flex items-center gap-1 rounded-sm bg-base-200 py-2 pl-3 pr-1">
          <span class="mr-2 grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-normal text-primary-content">
            {{ i + 1 }}
          </span>
          <span class="grow">{{ p }}</span>
          <button class="btn btn-ghost btn-square btn-sm" :disabled="i === 0" :aria-label="t.moveUp(p)" @click="move(i, -1)">↑</button>
          <button class="btn btn-ghost btn-square btn-sm" :disabled="i === prompts.length - 1" :aria-label="t.moveDown(p)" @click="move(i, 1)">
            ↓
          </button>
          <button class="btn btn-ghost btn-square btn-sm" :disabled="prompts.length === 1" :aria-label="t.removePrompt(p)" @click="toggle(p)">
            ✕
          </button>
        </li>
      </ol>
    </div>
  </div>

  <div class="card mb-4 rounded-sm border border-base-300 bg-base-100">
    <div class="card-body gap-2 p-4">
      <h2 class="card-title text-xl font-normal italic">{{ libraryTitle }}</h2>
      <p class="text-sm text-base-content/70">{{ t.libraryIntro }}</p>
      <div class="library -mx-1 mt-1 max-h-96 overflow-y-auto overscroll-contain px-1" role="list">
        <div v-for="group in library" :key="group.title" role="presentation">
          <h3 class="sticky top-0 z-10 bg-base-100 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">
            {{ group.title }}
          </h3>
          <LibraryRow
            v-for="lp in group.prompts"
            :key="lp.text"
            :text="lp.text"
            :why="lp.why"
            :on="prompts.includes(lp.text)"
            @toggle="toggle(lp.text)"
          />
        </div>
        <div v-if="custom.length > 0" role="presentation">
          <h3 class="sticky top-0 z-10 bg-base-100 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">
            {{ t.yourOwn }}
          </h3>
          <LibraryRow
            v-for="text in custom"
            :key="text"
            :text="text"
            :on="prompts.includes(text)"
            deletable
            @toggle="toggle(text)"
            @delete="remove(text)"
          />
        </div>
      </div>
      <form class="add-row mt-2 flex gap-2" @submit.prevent="add">
        <input
          v-model="draft"
          type="text"
          class="input input-primary grow"
          maxlength="140"
          :placeholder="t.writeYourOwn"
          :aria-label="`${t.writeYourOwn}: ${title}`"
        />
        <button type="submit" class="btn btn-secondary" :disabled="!draft.trim()">{{ t.add }}</button>
      </form>
    </div>
  </div>
</template>

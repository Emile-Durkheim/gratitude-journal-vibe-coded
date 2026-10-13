<script setup lang="ts">
import Flower from '../flower/Flower.vue'
import LibraryRow from '../settings/LibraryRow.vue'
import { todayKey } from '../../lib/dates'
import { useT } from '../../composables/useLang'
import type { PromptGroup } from '../../content/prompts'

/** Picking prompts during the introduction, with a flower that grows a petal for each one. */
const props = defineProps<{ prompts: string[]; library: PromptGroup[] }>()
const emit = defineEmits<{ change: [prompts: string[]] }>()
const t = useT()
const today = todayKey()

const toggle = (text: string) => {
  const { prompts } = props
  if (!prompts.includes(text)) emit('change', [...prompts, text])
  else if (prompts.length > 1) emit('change', prompts.filter((p) => p !== text))
}
</script>

<template>
  <div>
    <div class="my-3 flex items-center justify-center gap-3" aria-live="polite">
      <span class="sway small" aria-hidden="true">
        <Flower :size="56" :petals="prompts.length" :filled="prompts.length" :day="today" />
      </span>
      <span class="text-sm italic opacity-70">{{ t.obPetals(prompts.length) }}</span>
    </div>
    <div v-for="group in library" :key="group.title" role="list" :aria-label="group.title">
      <h3 class="pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">{{ group.title }}</h3>
      <LibraryRow
        v-for="lp in group.prompts"
        :key="lp.text"
        :text="lp.text"
        :why="lp.why"
        :on="prompts.includes(lp.text)"
        @toggle="toggle(lp.text)"
      />
    </div>
    <p class="mt-3 text-sm italic opacity-70">{{ t.obOwnLater }}</p>
  </div>
</template>

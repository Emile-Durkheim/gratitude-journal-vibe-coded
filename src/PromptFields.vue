<script setup lang="ts">
import RuledField from './RuledField.vue'
import type { Item } from './storage'

/** Prompts in italic serif, answers handwritten on ruled lines. Shared by the day and week views. */
defineProps<{ items: Item[]; rows: number }>()
defineEmits<{ answer: [index: number, answer: string] }>()
</script>

<template>
  <div class="grid gap-6">
    <label v-for="(item, i) in items" :key="i" class="prompt block">
      <span class="prompt-label flex items-baseline gap-2 text-lg italic leading-snug">
        <span class="flex-none text-sm not-italic text-rose" aria-hidden="true">✿ {{ i + 1 }}</span>
        <span>{{ item.prompt }}</span>
      </span>
      <RuledField :value="item.answer" :rows="rows" @change="(v) => $emit('answer', i, v)" />
    </label>
  </div>
</template>

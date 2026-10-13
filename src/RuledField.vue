<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useT } from './useLang'

const props = defineProps<{ value: string; rows: number; locked?: boolean }>()
defineEmits<{ change: [value: string] }>()
const t = useT()

const el = ref<HTMLTextAreaElement | null>(null)
// Grow with the writing so the page reads like paper, not a scroll box.
const grow = () => {
  if (!el.value) return
  el.value.style.height = 'auto'
  el.value.style.height = `${el.value.scrollHeight}px`
}
onMounted(grow)
watch(() => props.value, grow, { flush: 'post' })
</script>

<template>
  <textarea
    ref="el"
    class="ruled mt-1"
    :style="{ minHeight: `calc(2.25rem * ${rows})` }"
    :value="value"
    :rows="rows"
    :readonly="locked"
    :placeholder="locked ? undefined : t.writeHere"
    @input="$emit('change', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

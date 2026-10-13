<script setup lang="ts">
import { useT } from '../../composables/useLang'

defineProps<{ text: string; why?: string; on: boolean; deletable?: boolean }>()
defineEmits<{ toggle: []; delete: [] }>()
const t = useT()
</script>

<template>
  <div class="mb-2 flex items-center gap-1" role="listitem">
    <button
      :class="[
        'library-item flex flex-1 items-start gap-3 rounded-sm border p-3 text-left transition-colors',
        on ? 'on border-rose/60 bg-rose/8' : 'border-base-300 bg-base-100 hover:bg-base-200',
      ]"
      :aria-pressed="on"
      @click="$emit('toggle')"
    >
      <span
        :class="[
          'mt-0.5 grid size-6 flex-none place-items-center rounded-full text-sm font-bold',
          on ? 'bg-rose text-white' : 'border border-base-300 text-base-content/50',
        ]"
        aria-hidden="true"
      >{{ on ? '✓' : '+' }}</span>
      <span class="grow">
        {{ text }}
        <span v-if="why" class="mt-0.5 block text-xs text-base-content/60">{{ why }}</span>
      </span>
    </button>
    <button v-if="deletable" class="btn btn-ghost btn-square btn-sm" :aria-label="t.deletePrompt(text)" @click="$emit('delete')">🗑</button>
  </div>
</template>

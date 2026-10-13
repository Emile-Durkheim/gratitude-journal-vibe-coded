<script setup lang="ts">
import { computed } from 'vue'
import { dateLocale } from '../../lib/dates'
import { useReminder } from '../../lib/reminderClient'
import { useT } from '../../composables/useLang'

/** The daily reminder: off until someone turns it on, which is the only time it asks for permission. */
const { reminder, support, permission, background, setEnabled, setTime } = useReminder()
const t = useT()

const on = computed(() => !!reminder.value?.enabled && permission.value === 'granted')
const time = computed(() => {
  // read t so the time is formatted again when the language changes
  void t.value
  return reminder.value
    ? new Date(`2000-01-01T${reminder.value.time}`).toLocaleTimeString(dateLocale(), { hour: 'numeric', minute: '2-digit' })
    : ''
})

const toggle = async (e: Event) => {
  const box = e.target as HTMLInputElement
  await setEnabled(box.checked)
  // If permission was refused the switch goes back off, even though the state never changed.
  box.checked = on.value
}
const changeTime = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  if (value) setTime(value)
}
</script>

<template>
  <div v-if="reminder" class="card mb-4 rounded-sm border border-base-300 bg-base-100">
    <div class="card-body gap-3 p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="card-title text-xl font-normal italic">{{ t.reminderTitle }}</h2>
        <input
          type="checkbox"
          class="toggle toggle-primary"
          :aria-label="t.reminderToggle"
          :checked="on"
          :disabled="support !== 'ok' || permission === 'denied'"
          @change="toggle"
        />
      </div>
      <p class="text-sm text-base-content/70">{{ t.reminderBody }}</p>
      <label v-if="on" class="flex items-center justify-between gap-3 text-sm">
        <span>{{ t.remindMeAt }}</span>
        <input
          type="time"
          class="input input-sm w-32 font-serif"
          :value="reminder.time"
          @input="changeTime"
        />
      </label>
      <p v-if="support === 'ios-install-first'" class="text-xs text-base-content/60">{{ t.reminderIos }}</p>
      <p v-if="support === 'unsupported'" class="text-xs text-base-content/60">{{ t.reminderUnsupported }}</p>
      <p v-if="permission === 'denied'" class="text-xs text-base-content/60">{{ t.reminderDenied }}</p>
      <p v-if="on && background === true" class="text-xs text-base-content/60">{{ t.reminderBackground(time) }}</p>
      <p v-if="on && background !== true" class="text-xs text-base-content/60">{{ t.reminderForeground(time) }}</p>
    </div>
  </div>
</template>

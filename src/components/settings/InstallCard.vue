<script setup lang="ts">
import { computed } from 'vue'
import { useInstall } from '../../lib/install'
import { useT } from '../../composables/useLang'
import type { PersistState } from '../../lib/storage'

/**
 * Explains, per browser, how to put the journal on the home screen as its own app. Until it is
 * installed or the browser has promised to keep its storage, it warns that entries can be lost.
 */
const props = defineProps<{ persist: PersistState | null }>()
const state = useInstall()
const t = useT()
const atRisk = computed(() => state.value.kind !== 'installed' && props.persist !== 'persisted')
</script>

<template>
  <div v-if="state.kind !== 'installed'" :class="['install-card card mb-4 rounded-sm', atRisk ? 'at-risk' : 'border border-rose/40 bg-base-100']">
    <div class="card-body gap-2 p-4">
      <template v-if="atRisk">
        <h2 class="card-title text-xl font-normal italic text-rose">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class="flex-none">
            <path d="M12 3 L22 20 H2 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M12 9.5 v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <circle cx="12" cy="17.3" r="1.1" fill="currentColor" />
          </svg>
          {{ t.riskTitle }}
        </h2>
        <p class="text-[0.95rem] leading-snug">{{ t.riskBody }}</p>
        <h3 v-if="state.kind !== 'prompt'" class="mt-1 text-xs font-semibold uppercase tracking-widest opacity-70">{{ t.riskHow }}</h3>
      </template>
      <template v-else>
        <h2 class="card-title text-xl font-normal italic">{{ t.installTitle }}</h2>
        <p class="text-sm opacity-80">{{ t.installBody }}</p>
      </template>
      <button
        v-if="state.kind === 'prompt'"
        :class="['btn', atRisk ? 'btn-secondary btn-lg mt-1 w-full' : 'btn-primary self-start']"
        @click="state.install"
      >
        {{ t.installButton }}
      </button>
      <ol v-if="state.kind === 'ios'" class="list-decimal pl-5 text-sm">
        <li>{{ t.iosStep1 }}</li>
        <li>{{ t.iosStep2 }} <span aria-hidden="true">(□↑)</span>.</li>
        <li>{{ t.iosStep3 }}</li>
      </ol>
      <p v-if="state.kind === 'manual'" class="text-sm">{{ t.manualInstall }}</p>
    </div>
  </div>
</template>

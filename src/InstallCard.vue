<script setup lang="ts">
import { useInstall } from './install'
import { useT } from './useLang'

/** Explains, per browser, how to put the journal on the home screen as its own app. */
const state = useInstall()
const t = useT()
</script>

<template>
  <div v-if="state.kind !== 'installed'" class="install-card card mb-4 rounded-sm border border-rose/40 bg-base-100">
    <div class="card-body gap-2 p-4">
      <h2 class="card-title text-xl font-normal italic">{{ t.installTitle }}</h2>
      <p class="text-sm opacity-80">{{ t.installBody }}</p>
      <button v-if="state.kind === 'prompt'" class="btn btn-primary self-start" @click="state.install">{{ t.installButton }}</button>
      <ol v-if="state.kind === 'ios'" class="list-decimal pl-5 text-sm">
        <li>{{ t.iosStep1 }}</li>
        <li>{{ t.iosStep2 }} <span aria-hidden="true">(□↑)</span>.</li>
        <li>{{ t.iosStep3 }}</li>
      </ol>
      <p v-if="state.kind === 'manual'" class="text-sm">{{ t.manualInstall }}</p>
    </div>
  </div>
</template>

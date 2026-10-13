<script setup lang="ts">
import Flower from './Flower.vue'
import { LANGS } from './i18n'
import { todayKey } from './dates'
import { useLang } from './useLang'

/** Step 0 of the introduction: what gratitude journaling is, and what the research says helps. */
defineEmits<{ begin: []; skip: [] }>()
const langState = useLang()
const today = todayKey()
</script>

<template>
  <article class="welcome pb-4">
    <div class="flex justify-end gap-1 pt-1 text-sm" role="group" :aria-label="langState.t.language">
      <button
        v-for="l in LANGS"
        :key="l"
        type="button"
        :class="['btn btn-ghost btn-xs uppercase tracking-widest', langState.lang === l ? 'text-rose underline underline-offset-4' : 'opacity-60']"
        :aria-pressed="langState.lang === l"
        :lang="l"
        @click="langState.setChoice(l)"
      >
        {{ l }}
      </button>
    </div>

    <header class="mt-2 text-center">
      <span class="sway small welcome-flower" aria-hidden="true">
        <Flower :size="78" :petals="5" :filled="5" :day="today" stem />
      </span>
      <p class="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.25em] opacity-70">{{ langState.t.welcomeKicker }}</p>
      <h1 class="mt-1 text-[2.4rem] italic leading-tight">{{ langState.t.welcomeTitle }}</h1>
      <div class="welcome-rule mx-auto mt-3" aria-hidden="true"><span>✿</span></div>
    </header>

    <p class="welcome-lead mt-5 text-[1.12rem] leading-relaxed">{{ langState.t.welcomeLead }}</p>

    <h2 class="mt-7 text-[0.8rem] font-semibold uppercase tracking-[0.22em]">{{ langState.t.welcomeHowTitle }}</h2>
    <ol class="mt-3 grid gap-4">
      <li v-for="(h, i) in langState.t.welcomeHow" :key="h.title" class="flex gap-3">
        <span class="flex-none pt-0.5 text-sm text-rose" aria-hidden="true">✿ {{ i + 1 }}</span>
        <span class="leading-snug">
          <strong class="font-semibold italic">{{ h.title }}</strong> {{ h.body }}
          <span class="mt-0.5 block text-xs uppercase tracking-wider opacity-55">{{ h.source }}</span>
        </span>
      </li>
    </ol>

    <h2 class="mt-7 text-[0.8rem] font-semibold uppercase tracking-[0.22em]">{{ langState.t.welcomeEasyTitle }}</h2>
    <p class="mt-2 leading-relaxed">{{ langState.t.welcomeEasy }}</p>

    <!-- written into the journal by hand, as the user's own answers will be -->
    <p class="welcome-note ruled mt-6 min-h-0">{{ langState.t.welcomePress }}</p>

    <p class="mt-4 text-center text-sm italic opacity-70">{{ langState.t.welcomePrivate }}</p>

    <div class="mt-6 grid gap-2">
      <button type="button" class="btn btn-primary btn-lg w-full" @click="$emit('begin')">{{ langState.t.welcomeBegin }}</button>
      <button type="button" class="btn btn-ghost btn-sm self-center italic opacity-70" @click="$emit('skip')">{{ langState.t.welcomeSkip }}</button>
    </div>
  </article>
</template>

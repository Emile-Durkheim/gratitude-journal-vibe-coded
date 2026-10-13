<script setup lang="ts">
/** Page header: small-caps title over a ruled line, with optional actions either side. */
defineProps<{ title: string }>()
</script>

<template>
  <header class="mb-3 flex min-h-12 items-center gap-2 border-b-[1.5px] border-ink pb-1">
    <slot name="start" />
    <h1 class="flex-1 text-[0.8rem] font-semibold uppercase tracking-[0.22em]">{{ title }}</h1>
    <slot name="end" />
  </header>
</template>

<script setup lang="ts">
defineProps<{ href: string; label: string }>()
</script>

<template>
  <a class="btn btn-ghost btn-sm btn-square" :href="href" :aria-label="label" :title="label">
    <slot />
  </a>
</template>

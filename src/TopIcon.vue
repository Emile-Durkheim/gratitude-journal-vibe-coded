<script setup lang="ts">
defineProps<{ name: 'gear' | 'calendar' | 'wreath' }>()
</script>

<template>
  <svg v-if="name === 'gear'" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
      transform="translate(-1 0)"
    />
  </svg>
  <svg v-else-if="name === 'calendar'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
  <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="4" r="2" fill="currentColor" fill-opacity=".25" />
    <circle cx="19" cy="14.5" r="2" fill="currentColor" fill-opacity=".25" />
    <circle cx="5" cy="14.5" r="2" fill="currentColor" fill-opacity=".25" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ href: string; label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <a class="btn btn-ghost btn-sm btn-square text-2xl" :href="href" :aria-label="label" @click="$emit('click')">‹</a>
</template>

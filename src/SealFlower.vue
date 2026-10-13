<template>
  <g class="seal-flower">
    <path v-for="i in 5" :key="i" d="M0 -2 C-7 -5 -6 -18 0 -19 C6 -18 7 -5 0 -2Z" :transform="`rotate(${(i - 1) * 72})`" />
    <circle :r="3.5" />
  </g>
</template>

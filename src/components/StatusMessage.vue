<template>
  <p v-if="store.message" class="message" :class="{ error: store.hasError }">{{ store.message }}</p>
</template>

<script setup lang="ts">
import { usePosChangeStore } from '../stores/posChangeStore'

const store = usePosChangeStore()
</script>

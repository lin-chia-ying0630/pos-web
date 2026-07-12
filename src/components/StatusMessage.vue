<template>
  <p v-if="workflow.message" class="message" :class="{ error: workflow.hasError }">{{ workflow.message }}</p>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../stores/workflowStore'

const workflow = useWorkflowStore()
</script>

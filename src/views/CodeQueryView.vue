<template>
  <section class="panel query-record-table code-query">
    <div class="panel-title">
      <FileText :size="18" />
      <h2>Code 代碼資料</h2>
    </div>
    <div class="query-record-head">
      <strong>代碼群組</strong><strong>欄位</strong><strong>代碼</strong><strong>代碼後</strong
      ><strong>中文說明</strong>
    </div>
    <div v-for="code in codes" :key="`${code.codeGroup}-${code.codeField}-${code.codeBefore}`" class="query-record-row">
      <span>{{ code.codeGroup }}</span
      ><span>{{ code.codeField }}</span
      ><span>{{ code.codeBefore }}</span
      ><span>{{ code.codeAfter || '-' }}</span
      ><span>{{ code.codeDescription }}</span>
    </div>
    <p v-if="loaded && !codes.length" class="empty-text">查無 Code 資料</p>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FileText } from '@lucide/vue'
import { findAllCodes, type CodeDescription } from '../api/posChange'
const codes = ref<CodeDescription[]>([])
const loaded = ref(false)
onMounted(async () => {
  codes.value = await findAllCodes()
  loaded.value = true
})
</script>

<template>
  <div class="pa-4">
    <h1>Reusable Vertical Table</h1>
    <LMTable :headers="headers" :load-data="loadData" item-value="name">
      <template #item.createdAt="{ item }">
        <input type="date" v-model="item.createdAt" readonly>
      </template>
      <template #item.available="{ item }">
        <input type="checkbox" v-model="item.available" disabled>
      </template>
    </LMTable>
  </div>
</template>

<script setup lang="ts">
import { headers } from '~/data/foodData'
import { loadData } from '~/utils/tableUtils'

definePageMeta({
  layout: 'default',
})

// Data is imported from data/foodData.ts and utils/tableUtils.ts
</script>
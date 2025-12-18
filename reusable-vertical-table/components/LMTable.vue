<template>
    <v-text-field v-model="search" label="Search" class="ma-4" density="compact"></v-text-field>
    <div v-if="loading" class="text-center ma-4">Loading data...</div>
    <v-table v-else>
        <tbody>
            <tr 
                v-for="header in headers" 
                :key="header.key"
            >
                <th scope="row" class="font-weight-bold">{{ header.title }}</th>
                <td 
                    v-for="item in serverItems" 
                    :key="item[itemValue ?? 'id']"
                >
                    <v-menu 
                        v-if="header.display === 'datepicker'"
                    >
                        <template #activator="{ props }">
                            <span 
                                v-bind="props" 
                                style="cursor: pointer;"
                            >
                                {{ new Date(item[header.key]).toLocaleDateString() }}
                            </span>
                        </template>
                        <v-date-picker 
                            v-model="item[header.key]" 
                            :disabled="true"
                        ></v-date-picker>
                    </v-menu>
                    <v-checkbox 
                        v-else-if="header.display === 'checkbox'" 
                        v-model="item[header.key]"
                        readonly
                    ></v-checkbox>
                    <span v-else>{{ item[header.key] }}</span>
                </td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Header, LoadDataParams, LoadDataResult } from '~/types'

const props = defineProps<{
  headers: Header[]
  loadData: (params: LoadDataParams) => Promise<LoadDataResult>
  initialItemsPerPage?: number
  initialSearch?: string
  itemValue?: string
}>()

const itemsPerPage = ref(props.initialItemsPerPage ?? 5)
const search = ref(props.initialSearch ?? '')
const serverItems = ref<any[]>([])
const loading = ref(true)
const totalItems = ref(0)
const debounceTimeout = ref<number | null>(null)

function loadItems({ page, itemsPerPage, sortBy, search }: LoadDataParams) {
  loading.value = true
  props.loadData({ page, itemsPerPage, sortBy, search }).then(({ items, total }: LoadDataResult) => {
    serverItems.value = items
    totalItems.value = total
    loading.value = false
  })
}

watch(search, () => {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
  debounceTimeout.value = setTimeout(() => {
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: search.value })
  }, 500)
})

onMounted(() => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: '' })
})
</script>
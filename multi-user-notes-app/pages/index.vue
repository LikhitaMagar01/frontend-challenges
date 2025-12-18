<template>
    <div>
        <h1>Multi User Notes App</h1>
        {{ store.notes }}
    </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
definePageMeta({
    layout: 'default',
})
const store = useNotesStore()
</script>
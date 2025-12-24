<template>
  <div>
    <!-- This page redirects automatically -->
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  const userStr = localStorage.getItem('user')
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.user_type === 'admin') {
        navigateTo('/admin')
      } else {
        navigateTo('/user/' + user._id)
      }
    } catch (error) {
      navigateTo('/login')
    }
  } else {
    navigateTo('/login')
  }
})
</script>

<style scoped>
</style>

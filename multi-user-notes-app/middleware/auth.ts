export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const user = localStorage.getItem('user')
    if (!user) {
      return navigateTo('/login')
    }
  } else {
    return navigateTo('/login')
  }
})

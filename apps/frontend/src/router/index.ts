import { useAuth, useUser } from '@clerk/vue'
import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '../views/SignUpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // Mark this route as requiring authentication
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: SignInView,
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: SignUpView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { isLoaded } = useAuth()
  const { isSignedIn } = useUser()

  let res: () => void = () => {}
  const promise = new Promise<void>((resolve) => {
    res = resolve
  })
  if (isLoaded.value) res()
  else {
    watch(isLoaded, (loaded) => {
      if (loaded) res()
    })
  }
  await promise

  if (to.meta.requiresAuth && !isSignedIn.value) {
    next({ name: 'signIn' }) // Redirect to sign-in page if not authenticated
  } else {
    next() // Proceed to the route
  }
})

export default router

<script setup lang="ts">
import { UserButton, useUser } from '@clerk/vue'
import { RouterLink, RouterView } from 'vue-router'

const { isSignedIn } = useUser()
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <template v-if="!isSignedIn">
        <RouterLink to="/sign-in">Sign In</RouterLink>
        <RouterLink to="/sign-up">Sign Up</RouterLink>
      </template>
      <template v-else>
        <UserButton />
      </template>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>

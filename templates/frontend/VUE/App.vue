<script setup>
import { ref, onMounted } from 'vue'
import vueLogo from './assets/vue.svg'
import backendLogo from './assets/backend.svg'
import dbLogo from './assets/database.svg'
import viteLogo from '/vite.svg'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(() => {
  fetch('http://localhost:5000/autostack')
    .then(res => res.json())
    .then(responseData => {
      data.value = responseData
      loading.value = false
    })
    .catch(err => {
      error.value = err.message
      loading.value = false
    })
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-8">
    <div class="max-w-4xl w-full">

      <div class="flex justify-center items-center gap-8 mb-12">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" 
           class="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#646cffaa]">
          <img :src="viteLogo" class="h-24 w-24" alt="Vite logo" />
        </a>
        <span class="text-4xl text-gray-500">+</span>
        <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer"
           class="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#42b883aa]">
          <img :src="vueLogo" class="h-24 w-24" alt="Vue logo" />
        </a>
        <span class="text-4xl text-gray-500">+</span>
        <a href="#" class="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#10b981aa]">
          <img :src="backendLogo" class="h-24 w-24" alt="Backend logo" />
        </a>
        <span class="text-4xl text-gray-500">+</span>
        <a href="#" class="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#3b82f6aa]">
          <img :src="dbLogo" class="h-24 w-24" alt="Database logo" />
        </a>
      </div>

      <h1 class="text-5xl font-bold text-center mb-8 text-white bg-clip-text text-transparent">
        Vite + Vue + {{ data?.backend || '...' }} + {{ data?.database || '...' }}
      </h1>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700 shadow-2xl">
        <div v-if="loading" class="flex items-center justify-center gap-3">
          <div class="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-400">Connecting to backend...</p>
        </div>
        
        <div v-if="error" class="text-center">
          <p class="text-red-400 mb-2">⚠️ Connection Failed</p>
          <p class="text-sm text-gray-500">{{ error }}</p>
          <p class="text-xs text-gray-600 mt-3">Make sure your backend server is running on port 5000</p>
        </div>
        
        <div v-if="!loading && !error && data" class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-green-400 text-sm font-medium">Connected</span>
          </div>
          <p class="text-2xl text-gray-300 mb-2">{{ data?.message }}</p>
          <p class="text-sm text-gray-500">Your full-stack app is up and running! ✨</p>
        </div>
      </div>

      <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-semibold mb-4 text-gray-300 text-center">Quick Start</h2>
        <div class="space-y-3 text-sm text-gray-400">
          <div class="flex justify-center items-center gap-3">
            <p>Edit <code class="px-2 py-1 bg-gray-700 rounded text-blue-300">src/App.vue</code> to start building your frontend</p>
          </div>
          <div class="flex justify-center items-center gap-3">
            <p>Modify <code class="px-2 py-1 bg-gray-700 rounded text-blue-300">{{ data?.filepath }}</code> to add your API routes</p>
          </div>
          <div class="flex justify-center items-center gap-3">
            <p>Check the console for any errors or messages</p>
          </div>
        </div>
      </div>

      <p class="text-center text-gray-500 text-sm mt-8">
        Created with ❤️ using AutoStack
      </p>
    </div>
  </div>
</template>
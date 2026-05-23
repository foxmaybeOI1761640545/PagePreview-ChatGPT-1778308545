<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ThemePreviewPage from './pages/ThemePreviewPage.vue';
import FishHunterPage from './pages/FishHunterPage.vue';

const hash = ref(window.location.hash || '#/');
const current = computed(() => (hash.value === '#/fish-hunter' ? 'fish' : 'home'));
const sync = () => { hash.value = window.location.hash || '#/'; };
const go = (next: '#/' | '#/fish-hunter') => { window.location.hash = next; };
onMounted(() => window.addEventListener('hashchange', sync));
onUnmounted(() => window.removeEventListener('hashchange', sync));
</script>

<template>
  <div>
    <header style="display:flex;gap:12px;justify-content:center;padding:16px;background:#0b1620;position:sticky;top:0;z-index:10">
      <button type="button" @click="go('#/')">主题预览</button>
      <button type="button" @click="go('#/fish-hunter')">捕鱼达人路由</button>
    </header>
    <ThemePreviewPage v-if="current === 'home'" />
    <FishHunterPage v-else />
  </div>
</template>

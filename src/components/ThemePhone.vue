<script setup lang="ts">
import { computed } from 'vue';
import type { LauncherTheme, ToolGroup } from '../data/themes';

const props = defineProps<{
  theme: LauncherTheme;
  groups: ToolGroup[];
  active?: boolean;
}>();

const styleVars = computed(() => props.theme.cssVars);
</script>

<template>
  <article class="phone-shell" :class="{ 'phone-shell--active': active }" :style="styleVars">
    <div class="phone-screen">
      <div class="status-bar" aria-label="手机状态栏">
        <span>9:41</span>
        <span class="status-icons">▮▮▮  Wi‑Fi  ▰</span>
      </div>

      <header class="launcher-header">
        <p class="eyebrow">{{ theme.label }} / {{ theme.id }}</p>
        <h2>Launcher</h2>
      </header>

      <section v-for="group in groups" :key="group.title" class="tool-card">
        <h3><span>{{ group.icon }}</span>{{ group.title }}</h3>
        <div v-if="group.items" class="tool-grid">
          <button v-for="item in group.items" :key="`${group.title}-${item.label}`" type="button" class="tool-button">
            <span class="tool-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
        <p v-else class="recent-text">{{ group.description }}</p>
      </section>

      <nav class="bottom-nav" aria-label="底部导航">
        <button type="button"><span>☷</span>工具</button>
        <button type="button"><span>▦</span>应用</button>
        <button type="button" class="bottom-nav__active"><span>⚙</span>设置</button>
      </nav>
    </div>
  </article>
</template>

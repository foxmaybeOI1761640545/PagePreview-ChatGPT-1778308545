<script setup lang="ts">
import type { LauncherTheme } from '../data/themes';

defineProps<{
  theme: LauncherTheme;
  align?: 'left' | 'right';
}>();
</script>

<template>
  <aside class="palette-panel" :class="`palette-panel--${align ?? 'left'}`">
    <p class="panel-kicker">{{ theme.label }}方案</p>
    <h2>{{ theme.name }}</h2>
    <p class="panel-description">{{ theme.description }}</p>

    <ul class="palette-list" aria-label="主题色板">
      <li v-for="token in theme.palette" :key="token.label">
        <span class="swatch" :style="{ backgroundColor: token.value }"></span>
        <strong>{{ token.label }}</strong>
        <code>{{ token.value }}</code>
      </li>
    </ul>

    <div class="mode-callout">
      <span class="callout-icon">{{ theme.id === 'dark' ? '☾' : '💡' }}</span>
      <div>
        <strong>{{ theme.modeTag }}</strong>
        <p>{{ theme.modeNote }}</p>
      </div>
    </div>
  </aside>
</template>

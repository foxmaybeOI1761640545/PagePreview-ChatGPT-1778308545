<script setup lang="ts">
import { computed, ref } from 'vue';
import PalettePanel from '../components/PalettePanel.vue';
import ThemePhone from '../components/ThemePhone.vue';
import { themes, toolGroups } from '../data/themes';

const selectedThemeId = ref(themes[0].id);
const selectedTheme = computed(() => themes.find((theme) => theme.id === selectedThemeId.value) ?? themes[0]);
</script>

<template>
  <main class="preview-page">
    <section class="hero-card">
      <div class="intro-copy">
        <p class="project-label">Launcher</p>
        <h1>主题方案对比</h1>
        <span class="title-rule"></span>
        <p>
          基于现有功能结构，提供两套配色方案：浅色与深色。统一的组件体系，
          更舒适的视觉层次与可读性。
        </p>
      </div>

      <div class="theme-manager" aria-label="主题管理器">
        <div class="manager-header">
          <span>主题管理器</span>
          <strong>{{ selectedTheme.name }}</strong>
        </div>
        <div class="theme-tabs" role="tablist" aria-label="选择主题预览">
          <button
            v-for="theme in themes"
            :key="theme.id"
            type="button"
            :class="{ 'is-active': theme.id === selectedThemeId }"
            @click="selectedThemeId = theme.id"
          >
            {{ theme.label }}预览
          </button>
        </div>
      </div>

      <div class="comparison-layout">
        <PalettePanel :theme="themes[0]" align="left" />
        <ThemePhone :theme="themes[0]" :groups="toolGroups" :active="selectedThemeId === themes[0].id" />
        <ThemePhone :theme="themes[1]" :groups="toolGroups" :active="selectedThemeId === themes[1].id" />
        <PalettePanel :theme="themes[1]" align="right" />
      </div>
    </section>
  </main>
</template>

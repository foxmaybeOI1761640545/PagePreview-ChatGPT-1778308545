<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

type Species = 'clownfish' | 'turtle' | 'shark';
type GameStatus = 'idle' | 'running' | 'over' | 'cleared';

interface MarineCreature {
  id: number;
  species: Species;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  dir: number;
}
interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  targetX: number;
  targetY: number;
  age: number;
  hit: boolean;
}

const W = 900;
const H = 520;
const cannon = { x: W / 2, y: H - 35 };
const levelConfigs = [
  { level: 1, duration: 25, spawnEvery: 1.2, targetScore: 120 },
  { level: 2, duration: 30, spawnEvery: 0.95, targetScore: 280 },
  { level: 3, duration: 35, spawnEvery: 0.72, targetScore: 520 }
];
const speciesCfg = {
  clownfish: { hp: 40, speed: 70, reward: 10, damage: 50, color: '#ff9f43' },
  turtle: { hp: 110, speed: 45, reward: 25, damage: 35, color: '#1dd1a1' },
  shark: { hp: 180, speed: 35, reward: 45, damage: 20, color: '#54a0ff' }
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
const nickname = ref('');
const userName = ref(localStorage.getItem('fish-hunter:nickname') ?? '');
const gameState = reactive({
  status: 'idle' as GameStatus,
  score: 0,
  levelIndex: 0,
  levelRemaining: levelConfigs[0].duration,
  bullets: [] as Bullet[],
  creatures: [] as MarineCreature[],
  lastTs: 0,
  spawnCd: 0,
  bid: 0,
  cid: 0
});

const leaderboard = ref<{ name: string; score: number; time: string }[]>([]);
const submitState = ref<'idle' | 'submitting' | 'ok' | 'fail'>('idle');
const submitError = ref('');
const githubRepo = ref('');
const githubToken = ref('');

const levelInfo = computed(() => levelConfigs[gameState.levelIndex]);
const summary = computed(() => Object.entries(speciesCfg).map(([k, v]) => `${k}: HP${v.hp} / 伤害${v.damage}`).join(' ｜ '));
const canStart = computed(() => !!userName.value && gameState.status !== 'running');

function resetForNewGame() {
  gameState.score = 0;
  gameState.levelIndex = 0;
  gameState.levelRemaining = levelConfigs[0].duration;
  gameState.bullets = [];
  gameState.creatures = [];
  gameState.lastTs = 0;
  gameState.spawnCd = 0;
}

function startGame() {
  if (!userName.value) return;
  resetForNewGame();
  gameState.status = 'running';
}

function saveNickname() {
  if (!nickname.value.trim()) return;
  userName.value = nickname.value.trim();
  localStorage.setItem('fish-hunter:nickname', userName.value);
}

function spawnCreature() {
  const keys = Object.keys(speciesCfg) as Species[];
  const species = keys[Math.floor(Math.random() * keys.length)];
  const cfg = speciesCfg[species];
  const left = Math.random() > 0.5;
  gameState.creatures.push({
    id: ++gameState.cid,
    species,
    x: left ? -30 : W + 30,
    y: 80 + Math.random() * 300,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed + gameState.levelIndex * 8,
    dir: left ? 1 : -1
  });
}

function fire(targetX: number, targetY: number) {
  if (gameState.status !== 'running') return;
  const dx = targetX - cannon.x;
  const dy = targetY - cannon.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / d;
  const uy = dy / d;
  gameState.bullets.push({ id: ++gameState.bid, x: cannon.x, y: cannon.y, vx: ux * 20, vy: uy * 20, ax: ux * 190, ay: uy * 190, targetX, targetY, age: 0, hit: false });
}

function endGame(status: GameStatus) {
  gameState.status = status;
  const row = { name: userName.value, score: gameState.score, time: new Date().toISOString() };
  leaderboard.value = [row, ...leaderboard.value].sort((a, b) => b.score - a.score).slice(0, 10);
}

function tick(ts: number) {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;

  const dt = Math.min((ts - (gameState.lastTs || ts)) / 1000, 0.033);
  gameState.lastTs = ts;

  if (gameState.status === 'running') {
    gameState.levelRemaining -= dt;
    gameState.spawnCd -= dt;
    if (gameState.spawnCd <= 0) {
      spawnCreature();
      gameState.spawnCd = levelInfo.value.spawnEvery;
    }

    if (gameState.levelRemaining <= 0) {
      if (gameState.score >= levelInfo.value.targetScore) {
        if (gameState.levelIndex === levelConfigs.length - 1) {
          endGame('cleared');
        } else {
          gameState.levelIndex += 1;
          gameState.levelRemaining = levelConfigs[gameState.levelIndex].duration;
          gameState.spawnCd = 0.3;
        }
      } else {
        endGame('over');
      }
    }
  }

  gameState.creatures.forEach((c) => (c.x += c.speed * c.dir * dt));
  gameState.creatures = gameState.creatures.filter((c) => c.x > -60 && c.x < W + 60 && c.hp > 0);

  gameState.bullets.forEach((b) => {
    b.vx += b.ax * dt;
    b.vy += b.ay * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.age += dt;
  });

  for (const b of gameState.bullets) {
    const dist = Math.hypot(b.targetX - b.x, b.targetY - b.y);
    if (dist < 20 && !b.hit) {
      b.hit = true;
      for (const c of gameState.creatures) {
        if (Math.hypot(c.x - b.x, c.y - b.y) < 45) {
          const damage = speciesCfg[c.species].damage;
          c.hp -= damage;
          if (c.hp <= 0) gameState.score += speciesCfg[c.species].reward;
        }
      }
    }
  }

  gameState.bullets = gameState.bullets.filter((b) => b.age < 4 && b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50 && !b.hit);

  ctx.fillStyle = '#021424';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0d2f4d';
  for (let i = 0; i < 6; i += 1) ctx.fillRect(0, i * 90 + ((ts / 30) % 90), W, 1);

  for (const c of gameState.creatures) {
    ctx.fillStyle = speciesCfg[c.species].color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(c.x - 20, c.y - 27, 40, 4);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(c.x - 20, c.y - 27, 40 * (c.hp / c.maxHp), 4);
  }

  ctx.fillStyle = '#feca57';
  ctx.beginPath();
  ctx.arc(cannon.x, cannon.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#48dbfb';
  for (const b of gameState.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  animationId.value = requestAnimationFrame(tick);
}

function onClick(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;
  fire(e.clientX - rect.left, e.clientY - rect.top);
}

async function uploadScoreToGithub() {
  submitState.value = 'submitting';
  submitError.value = '';
  try {
    const [owner, repo] = githubRepo.value.split('/');
    if (!owner || !repo || !githubToken.value) throw new Error('请填写 owner/repo 和 GitHub Token。');

    const safeName = userName.value.replace(/[^\p{L}\p{N}_-]+/gu, '_');
    const branch = `scores/${safeName}`;
    const filePath = `scores/${safeName}/latest-score.json`;
    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = { Authorization: `Bearer ${githubToken.value}`, Accept: 'application/vnd.github+json' };

    const mainRes = await fetch(`${apiBase}/git/ref/heads/main`, { headers });
    if (!mainRes.ok) throw new Error('读取 main 分支失败');
    const mainData = await mainRes.json();
    const baseSha = mainData.object.sha;

    const refRes = await fetch(`${apiBase}/git/refs`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha })
    });
    if (!refRes.ok && refRes.status !== 422) throw new Error('创建分支失败');

    const payload = {
      nickname: userName.value,
      score: gameState.score,
      level: levelInfo.value.level,
      status: gameState.status,
      uploadedAt: new Date().toISOString()
    };

    const putRes = await fetch(`${apiBase}/contents/${filePath}`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `feat(score): upload ${userName.value} fish score`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))),
        branch
      })
    });
    if (!putRes.ok) throw new Error('上传积分文件失败');
    submitState.value = 'ok';
  } catch (error) {
    submitState.value = 'fail';
    submitError.value = error instanceof Error ? error.message : '未知错误';
  }
}

onMounted(() => {
  canvasRef.value?.addEventListener('click', onClick);
  animationId.value = requestAnimationFrame(tick);
  nickname.value = userName.value;
});

onUnmounted(() => {
  canvasRef.value?.removeEventListener('click', onClick);
  if (animationId.value) cancelAnimationFrame(animationId.value);
});
</script>

<template>
  <main class="preview-page">
    <section class="hero-card">
      <div class="intro-copy">
        <p class="project-label">Game Route</p>
        <h1>捕鱼达人规划 Demo</h1>
        <p>{{ summary }}</p>
      </div>

      <div style="display:grid;gap:12px;margin-bottom:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
        <label>昵称（支持中文）<input v-model="nickname" type="text" placeholder="请输入昵称" /></label>
        <button type="button" @click="saveNickname">保存昵称</button>
        <button type="button" :disabled="!canStart" @click="startGame">开始游戏</button>
        <div>当前用户：{{ userName || '未设置' }}</div>
        <div>关卡：{{ levelInfo.level }} / {{ levelConfigs.length }}</div>
        <div>剩余时间：{{ Math.max(0, gameState.levelRemaining).toFixed(1) }}s</div>
        <div>目标分：{{ levelInfo.targetScore }}</div>
        <div>当前分：{{ gameState.score }}</div>
        <div>状态：{{ gameState.status }}</div>
      </div>

      <canvas ref="canvasRef" :width="W" :height="H" style="width:100%;border-radius:16px;border:1px solid #35536b" />

      <div style="display:grid;gap:12px;margin-top:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
        <section>
          <h3>积分排行榜（本地）</h3>
          <ol>
            <li v-for="item in leaderboard" :key="`${item.name}-${item.time}`">{{ item.name }} - {{ item.score }}</li>
          </ol>
        </section>
        <section>
          <h3>上传积分到 GitHub 新分支/新路径/新文件</h3>
          <input v-model="githubRepo" type="text" placeholder="owner/repo" />
          <input v-model="githubToken" type="password" placeholder="GitHub Token（repo 内容写入权限）" />
          <button type="button" :disabled="submitState==='submitting' || !userName" @click="uploadScoreToGithub">上传当前积分</button>
          <p v-if="submitState==='ok'">上传成功：分支 `scores/{{ userName }}`，文件 `scores/{{ userName }}/latest-score.json`。</p>
          <p v-if="submitState==='fail'">上传失败：{{ submitError }}</p>
        </section>
      </div>
    </section>
  </main>
</template>

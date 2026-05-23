<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

type Species = 'clownfish' | 'turtle' | 'shark';
interface MarineCreature { id:number; species:Species; x:number; y:number; hp:number; maxHp:number; speed:number; dir:number; }
interface Bullet { id:number; x:number; y:number; vx:number; vy:number; ax:number; ay:number; targetX:number; targetY:number; age:number; hit:boolean; }
interface ScoreRecord { name:string; score:number; level:number; createdAt:string; }

const W = 900; const H = 420;
const cannon = { x: W / 2, y: H - 42 };
const speciesCfg = {
  clownfish: { hp: 40, speed: 70, reward: 10, damage: 50, color: '#ff9f43' },
  turtle: { hp: 110, speed: 45, reward: 25, damage: 35, color: '#1dd1a1' },
  shark: { hp: 180, speed: 35, reward: 45, damage: 20, color: '#54a0ff' }
};
const canvasRef = ref<HTMLCanvasElement | null>(null);
const playerName = ref(localStorage.getItem('fish_player_name') || '');
const needName = ref(!playerName.value);
const nicknameInput = ref('');
const gameState = ref<'ready'|'running'|'over'>('ready');
const level = ref(1);
const life = ref(3);
const levelTarget = computed(() => 100 + (level.value - 1) * 120);
const leaderboard = ref<ScoreRecord[]>(JSON.parse(localStorage.getItem('fish_leaderboard') || '[]'));
const uploadForm = reactive({ owner:'', repo:'', branch:'fish-scoreboard', pathPrefix:'scores' as string, token:'', uploading:false, message:'' });

const state = reactive({ score:0, bullets: [] as Bullet[], creatures: [] as MarineCreature[], lastTs:0, spawnCd:0, bid:0, cid:0, rafId:0 });
const summary = computed(() => Object.entries(speciesCfg).map(([k,v])=>`${k}: HP${v.hp} / 伤害${v.damage}`).join(' ｜ '));
const top10 = computed(() => [...leaderboard.value].sort((a,b)=> b.score - a.score).slice(0,10));

watch(playerName, (val) => { if (val) localStorage.setItem('fish_player_name', val); });
watch(leaderboard, (val) => localStorage.setItem('fish_leaderboard', JSON.stringify(val)), { deep: true });

function spawnCreature() {
  const keys = Object.keys(speciesCfg) as Species[];
  const species = keys[Math.floor(Math.random() * keys.length)];
  const cfg = speciesCfg[species];
  const speedScale = 1 + (level.value - 1) * 0.15;
  const left = Math.random() > 0.5;
  state.creatures.push({ id: ++state.cid, species, x: left ? -30 : W + 30, y: 80 + Math.random() * 300, hp: Math.round(cfg.hp * speedScale), maxHp: Math.round(cfg.hp * speedScale), speed: cfg.speed * speedScale, dir: left ? 1 : -1 });
}

function fire(targetX: number, targetY: number) {
  if (gameState.value !== 'running') return;
  const dx = targetX - cannon.x; const dy = targetY - cannon.y; const d = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / d; const uy = dy / d;
  state.bullets.push({ id: ++state.bid, x: cannon.x, y: cannon.y, vx: ux * 20, vy: uy * 20, ax: ux * 180, ay: uy * 180, targetX, targetY, age:0, hit:false });
}

function resetRound() {
  state.bullets = []; state.creatures = []; state.spawnCd = 0; state.lastTs = 0;
}

function startGame() {
  if (!playerName.value) { needName.value = true; return; }
  state.score = 0; level.value = 1; life.value = 3; resetRound(); gameState.value = 'running';
}

function endGame() {
  gameState.value = 'over';
  leaderboard.value.push({ name: playerName.value, score: state.score, level: level.value, createdAt: new Date().toISOString() });
}

function tick(ts:number){
  const ctx = canvasRef.value?.getContext('2d'); if (!ctx) return;
  const dt = Math.min((ts - (state.lastTs || ts)) / 1000, 0.033); state.lastTs = ts;

  if (gameState.value === 'running') {
    state.spawnCd -= dt;
    if (state.spawnCd <= 0) { spawnCreature(); state.spawnCd = Math.max(0.35, 1.1 - level.value * 0.08); }

    state.creatures.forEach(c => c.x += c.speed * c.dir * dt);
    const escaped = state.creatures.filter(c => c.x <= -60 || c.x >= W + 60).length;
    if (escaped > 0) life.value -= escaped;
    state.creatures = state.creatures.filter(c => c.x > -60 && c.x < W + 60 && c.hp > 0);

    state.bullets.forEach(b => { b.vx += b.ax * dt; b.vy += b.ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.age += dt; });
    for (const b of state.bullets) {
      const dist = Math.hypot(b.targetX - b.x, b.targetY - b.y);
      if (dist < 20 && !b.hit) {
        b.hit = true;
        for (const c of state.creatures) {
          if (Math.hypot(c.x - b.x, c.y - b.y) < 45) {
            const damage = speciesCfg[c.species].damage;
            c.hp -= damage;
            if (c.hp <= 0) state.score += speciesCfg[c.species].reward;
          }
        }
      }
    }
    state.bullets = state.bullets.filter(b => b.age < 4 && b.x > -50 && b.x < W+50 && b.y > -50 && b.y < H+50 && !b.hit);

    if (state.score >= levelTarget.value) { level.value += 1; }
    if (life.value <= 0) endGame();
  }

  ctx.fillStyle = '#021424'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#0d2f4d'; for (let i=0;i<6;i++) ctx.fillRect(0, i*90 + ((ts/30)%90), W, 1);
  ctx.fillStyle = '#f5f6fa';
  ctx.fillText(`玩家: ${playerName.value || '未命名'}  Score: ${state.score}  Level: ${level.value}  Life: ${life.value}`, 20, 30);

  for (const c of state.creatures){
    ctx.fillStyle = speciesCfg[c.species].color; ctx.beginPath(); ctx.arc(c.x,c.y,18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(c.x-20,c.y-27,40,4); ctx.fillStyle='#e74c3c'; ctx.fillRect(c.x-20,c.y-27,40*(c.hp/c.maxHp),4);
  }
  ctx.fillStyle = '#feca57'; ctx.beginPath(); ctx.arc(cannon.x,cannon.y,16,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#48dbfb'; for (const b of state.bullets){ctx.beginPath(); ctx.arc(b.x,b.y,7,0,Math.PI*2); ctx.fill();}
  state.rafId = requestAnimationFrame(tick);
}

async function uploadLatestScore() {
  if (!playerName.value || !uploadForm.owner || !uploadForm.repo || !uploadForm.token) {
    uploadForm.message = '请填写 owner/repo/token，并确保已有昵称。'; return;
  }
  const latest = [...leaderboard.value].reverse().find((r) => r.name === playerName.value);
  if (!latest) { uploadForm.message = '暂无可上传成绩。'; return; }
  uploadForm.uploading = true; uploadForm.message = '上传中...';
  try {
    const safeName = encodeURIComponent(playerName.value);
    const date = latest.createdAt.slice(0,10);
    const path = `${uploadForm.pathPrefix}/${safeName}/${date}-${Date.now()}.json`;
    const url = `https://api.github.com/repos/${uploadForm.owner}/${uploadForm.repo}/contents/${path}`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(latest, null, 2))));
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${uploadForm.token}`, Accept: 'application/vnd.github+json' },
      body: JSON.stringify({ message: `feat(score): upload ${playerName.value} score`, content, branch: uploadForm.branch })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    uploadForm.message = `上传成功：${uploadForm.branch}/${path}`;
  } catch (error) {
    uploadForm.message = `上传失败：${String(error)}`;
  } finally { uploadForm.uploading = false; }
}

function onClick(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  const scaleY = canvas.height / r.height;
  const x = (e.clientX - r.left) * scaleX;
  const y = (e.clientY - r.top) * scaleY;
  fire(x, y);
}
function saveNickname(){ const name = nicknameInput.value.trim(); if(!name) return; playerName.value = name; needName.value = false; }

onMounted(()=>{ canvasRef.value?.addEventListener('click',onClick); state.rafId = requestAnimationFrame(tick); });
onUnmounted(()=> { canvasRef.value?.removeEventListener('click',onClick); cancelAnimationFrame(state.rafId); });
</script>

<template>
  <main class="preview-page fish-page">
    <section class="hero-card">
      <div class="intro-copy">
        <p class="project-label">Game Route</p>
        <h1>捕鱼达人规划 Demo</h1>
        <p>{{ summary }}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0">
          <button type="button" @click="startGame">开始游戏</button>
          <button type="button" @click="gameState = 'ready'; resetRound()">重置画面</button>
          <strong>当前关卡：{{ level }}（目标分 {{ levelTarget }}）</strong>
        </div>
      </div>
      <canvas ref="canvasRef" :width="W" :height="H" class="fish-canvas" />

      <div class="fish-panels">
      <section class="fish-bottom-panel">
        <h3>积分排行榜（本地 Top10）</h3>
        <ol>
          <li v-for="(it,idx) in top10" :key="`${it.name}-${it.createdAt}-${idx}`">{{ it.name }} - {{ it.score }} 分（关卡 {{ it.level }}）</li>
        </ol>
      </section>

      <section class="fish-bottom-panel">
        <h3>上传成绩到 GitHub 新分支/新路径/新文件</h3>
        <p>说明：每次上传会在 <code>{{ uploadForm.branch }}</code> 分支创建新 JSON 文件，路径按“昵称”分目录。</p>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:8px">
          <input v-model="uploadForm.owner" placeholder="owner，如 octocat" />
          <input v-model="uploadForm.repo" placeholder="repo，如 fish-game" />
          <input v-model="uploadForm.branch" placeholder="branch，如 fish-scoreboard" />
          <input v-model="uploadForm.pathPrefix" placeholder="path prefix，如 scores" />
          <input v-model="uploadForm.token" placeholder="GitHub Token (repo contents:write)" type="password" style="grid-column:1 / -1" />
        </div>
        <button type="button" style="margin-top:8px" :disabled="uploadForm.uploading" @click="uploadLatestScore">上传我的最新成绩</button>
        <p>{{ uploadForm.message }}</p>
      </section>
      </div>
    </section>

    <div v-if="needName" style="position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:20">
      <div style="background:#fff;padding:20px;border-radius:12px;min-width:320px">
        <h3>请输入昵称（支持中文）</h3>
        <input v-model="nicknameInput" placeholder="例如：海王小明" style="width:100%;margin:8px 0" @keydown.enter="saveNickname" />
        <button type="button" @click="saveNickname">确认</button>
      </div>
    </div>
  </main>
</template>


<style scoped>
.fish-page {
  height: calc(100vh - 68px);
  min-height: calc(100vh - 68px);
  overflow: hidden;
}

.fish-page .hero-card {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 0.8rem;
  overflow: hidden;
}

.fish-canvas {
  width: 100%;
  height: min(46vh, 420px);
  border-radius: 16px;
  border: 1px solid #35536b;
}

.fish-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
  min-height: 0;
}

.fish-bottom-panel {
  margin-top: 0;
  min-height: 0;
  overflow: auto;
}

.fish-bottom-panel h3 { margin: 0 0 .4rem; }
.fish-bottom-panel p,
.fish-bottom-panel ol { margin: 0; }

@media (max-width: 980px) {
  .fish-panels { grid-template-columns: 1fr; }
}
</style>

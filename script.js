// IRON WALL: FINAL ASSAULT - Game Engine with Sprite System
// ============================================
// CUSTOM SPRITE SYSTEM - Add your image URLs here
// ============================================
const SPRITE_URLS = {
  player: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
  boss: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
  enemies: {
    basic: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
    armored: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
    rapid: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
    missile: 'https://i.postimg.cc/XqfVjZPL/Gemini-Generated-Image-r826tar826tar826-removebg-preview.png',
  }
};

// Sprite image objects cache
const SPRITES = {
  player: null,
  boss: null,
  enemies: {
    basic: null,
    armored: null,
    rapid: null,
    missile: null,
  },
  loaded: false,
  loading: false,
};

// Preload all sprites
function preloadSprites() {
  if (SPRITES.loading) return;
  
  SPRITES.loading = true;
  const promises = [];
  
  if (SPRITE_URLS.player) {
    promises.push(loadImage(SPRITE_URLS.player, 'player'));
  }
  
  if (SPRITE_URLS.boss) {
    promises.push(loadImage(SPRITE_URLS.boss, 'boss'));
  }
  
  Object.keys(SPRITE_URLS.enemies).forEach(type => {
    if (SPRITE_URLS.enemies[type]) {
      promises.push(loadImage(SPRITE_URLS.enemies[type], `enemy_${type}`));
    }
  });
  
  if (promises.length === 0) {
    SPRITES.loaded = true;
    SPRITES.loading = false;
    console.log('No custom sprites to load, using default drawings');
    return Promise.resolve();
  }
  
  return Promise.all(promises).then(() => {
    SPRITES.loaded = true;
    SPRITES.loading = false;
    console.log('All sprites loaded successfully!');
  }).catch(err => {
    console.warn('Some sprites failed to load:', err);
    SPRITES.loaded = true;
    SPRITES.loading = false;
  });
}

function loadImage(url, key) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`Sprite loaded: ${key}`);
      
      if (key === 'player') {
        SPRITES.player = img;
      } else if (key === 'boss') {
        SPRITES.boss = img;
      } else if (key.startsWith('enemy_')) {
        const enemyType = key.replace('enemy_', '');
        SPRITES.enemies[enemyType] = img;
      }
      
      resolve(img);
    };
    
    img.onerror = (err) => {
      console.warn(`Failed to load sprite: ${key} from ${url}`);
      resolve(null);
    };
    
    img.src = url;
  });
}

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  canvasWidth: 520,
  canvasHeight: 520,
  tileSize: 40,
  gridCols: 13,
  gridRows: 13,
  playerSpeed: 2,
  bulletSpeed: 5,
  enemySpeedBase: 1.5,
  fps: 60,
  invincibilityTime: 3000,
  powerUpDuration: 15000,
  freezeDuration: 10000,
  
  difficulties: {
    1: {
      name: 'RECRUIT',
      totalEnemies: 5,
      maxActiveEnemies: 2,
      enemyFireRate: 1500,
      homingChance: 0.5,
      enemyTypes: ['basic'],
      spawnInterval: 3000,
    },
    2: {
      name: 'VETERAN',
      totalEnemies: 8,
      maxActiveEnemies: 3,
      enemyFireRate: 1000,
      homingChance: 0.7,
      enemyTypes: ['basic', 'armored'],
      spawnInterval: 2500,
    },
    3: {
      name: 'ELITE',
      totalEnemies: 12,
      maxActiveEnemies: 4,
      enemyFireRate: 700,
      homingChance: 0.9,
      enemyTypes: ['basic', 'armored', 'rapid', 'missile'],
      spawnInterval: 2000,
    },
  },
  
  boss: {
    width: 120,
    height: 120,
    speed: 2,
    totalHP: 4,
    phaseThresholds: [0.75, 0.5, 0.25],
  },
};

// ============================================
// GAME STATE
// ============================================
const STATE = {
  current: 'menu',
  difficulty: 1,
  score: 0,
  playerLives: 3,
  playerPowerUp: null,
  powerUpTimer: null,
  enemiesRemaining: 0,
  activeEnemies: [],
  bossActive: false,
  bossHP: 4,
  bossPhase: 0,
  bossPhaseData: null,
  freezeActive: false,
  freezeTimer: null,
  levelComplete: false,
  currentLevel: 1,
};

// ============================================
// MAP DATA
// ============================================
const MAP_TEMPLATES = {
  1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
    [0,0,0,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,1,1,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
  ],
  2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,1,0,1,0,0,1,0,0],
    [0,3,3,0,1,0,0,0,1,0,3,3,0],
    [0,3,3,0,1,0,0,0,1,0,3,3,0],
    [0,0,0,0,0,1,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,0,1,1,0,1,1,0,0,0,0],
    [0,3,3,0,1,0,0,0,1,0,3,3,0],
    [0,3,3,0,0,0,1,0,0,0,3,3,0],
    [0,0,1,0,0,1,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
  ],
  3: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,2,0,0,2,0,2,0,0,2,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,0,5,5,0,0,0,5,5,0,0,0],
    [0,0,1,5,5,1,0,1,5,5,1,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,2,0,0,0,1,0,0,0,2,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,1,5,5,1,0,1,5,5,1,0,0],
    [0,0,0,5,5,0,0,0,5,5,0,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,0,2,0,0,2,0,2,0,0,2,0,0],
    [0,0,2,2,0,0,0,0,0,2,2,0,0],
  ],
};

// ============================================
// GAME OBJECTS
// ============================================
let canvas, ctx;
let mapData = [];
let player = null;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerUps = [];
let particles = [];
let keys = {};
let gameLoop = null;
let spawnTimer = null;
let firePressed = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
  console.log('Game initializing...');
  canvas = document.getElementById('gameCanvas');
  
  if (!canvas) {
    console.error('Canvas element not found! Please check HTML.');
    return;
  }
  
  ctx = canvas.getContext('2d');
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;
  
  preloadSprites().then(() => {
    console.log('Sprite preloading complete');
  });
  
  setupEventListeners();
  showMenu();
  console.log('Game initialized successfully!');
}

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'KeyW': 
      case 'ArrowUp': 
        keys['up'] = true; 
        break;
      case 'KeyA': 
      case 'ArrowLeft': 
        keys['left'] = true; 
        break;
      case 'KeyS': 
      case 'ArrowDown': 
        keys['down'] = true; 
        break;
      case 'KeyD': 
      case 'ArrowRight': 
        keys['right'] = true; 
        break;
    }
    
    if (e.code === 'Space' && !e.repeat) {
      firePressed = true;
      if (STATE.current === 'playing' && player && player.canFire) {
        const now = Date.now();
        if (now - player.lastFireTime >= player.fireDelay) {
          fireBullet(player, false);
          player.lastFireTime = now;
        }
      }
      e.preventDefault();
    }
    
    if (e.code === 'Escape') {
      if (STATE.current === 'playing') {
        pauseGame();
      } else if (STATE.current === 'paused') {
        resumeGame();
      }
      e.preventDefault();
    }
    
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 
         'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape']
         .includes(e.code)) {
      e.preventDefault();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW': 
      case 'ArrowUp': 
        keys['up'] = false; 
        break;
      case 'KeyA': 
      case 'ArrowLeft': 
        keys['left'] = false; 
        break;
      case 'KeyS': 
      case 'ArrowDown': 
        keys['down'] = false; 
        break;
      case 'KeyD': 
      case 'ArrowRight': 
        keys['right'] = false; 
        break;
      case 'Space': 
        firePressed = false; 
        break;
    }
  });
  
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.onclick = (e) => {
      e.preventDefault();
      console.log('Start button clicked');
      startGame();
    };
  }
  
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.onclick = (e) => {
      e.preventDefault();
      startGame();
    };
  }
  
  const victoryRestartBtn = document.getElementById('victory-restart-btn');
  if (victoryRestartBtn) {
    victoryRestartBtn.onclick = (e) => {
      e.preventDefault();
      startGame();
    };
  }
  
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.onclick = (e) => {
      e.preventDefault();
      showMenu();
    };
  }
  
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.difficulty = parseInt(btn.dataset.diff);
      console.log('Difficulty set to:', STATE.difficulty);
    };
  });
}

// ============================================
// GAME FLOW
// ============================================
function showMenu() {
  STATE.current = 'menu';
  stopGameLoop();
  clearTimeout(spawnTimer);
  
  document.getElementById('menu-screen').classList.remove('hidden');
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('victory-screen').classList.add('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('boss-warning').classList.add('hidden');
  document.getElementById('boss-health-container').classList.add('hidden');
  document.getElementById('pause-overlay').classList.add('hidden');
}

function startGame() {
  console.log('Starting game with difficulty:', STATE.difficulty);
  
  STATE.current = 'playing';
  STATE.score = 0;
  STATE.playerLives = 3;
  STATE.playerPowerUp = null;
  STATE.enemiesRemaining = CONFIG.difficulties[STATE.difficulty].totalEnemies;
  STATE.activeEnemies = [];
  STATE.bossActive = false;
  STATE.bossHP = CONFIG.boss.totalHP;
  STATE.bossPhase = 0;
  STATE.freezeActive = false;
  STATE.levelComplete = false;
  STATE.currentLevel = 1;
  
  mapData = JSON.parse(JSON.stringify(MAP_TEMPLATES[STATE.difficulty]));
  player = createPlayer();
  bullets = [];
  enemyBullets = [];
  enemies = [];
  powerUps = [];
  particles = [];
  keys = {};
  firePressed = false;
  
  document.getElementById('menu-screen').classList.add('hidden');
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('victory-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('pause-overlay').classList.add('hidden');
  document.getElementById('boss-warning').classList.add('hidden');
  document.getElementById('boss-health-container').classList.add('hidden');
  
  startEnemySpawning();
  
  stopGameLoop();
  gameLoop = setInterval(update, 1000 / CONFIG.fps);
  
  updateHUD();
}

function gameOver() {
  STATE.current = 'gameover';
  stopGameLoop();
  clearTimeout(spawnTimer);
  
  document.getElementById('final-score').textContent = STATE.score;
  document.getElementById('gameover-screen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
}

function victory() {
  STATE.current = 'victory';
  stopGameLoop();
  clearTimeout(spawnTimer);
  
  document.getElementById('victory-final-score').textContent = STATE.score;
  document.getElementById('victory-screen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('boss-health-container').classList.add('hidden');
}

function nextLevel() {
  STATE.currentLevel++;
  console.log('Next level:', STATE.currentLevel);
  
  if (STATE.currentLevel > 3) {
    victory();
    return;
  }
  
  STATE.difficulty = STATE.currentLevel;
  STATE.playerLives = Math.min(5, STATE.playerLives + 1);
  STATE.enemiesRemaining = CONFIG.difficulties[STATE.difficulty].totalEnemies;
  STATE.bossActive = false;
  STATE.bossHP = CONFIG.boss.totalHP;
  STATE.bossPhase = 0;
  STATE.freezeActive = false;
  STATE.levelComplete = false;
  
  mapData = JSON.parse(JSON.stringify(MAP_TEMPLATES[STATE.difficulty]));
  bullets = [];
  enemyBullets = [];
  enemies = [];
  powerUps = [];
  particles = [];
  
  if (player) {
    player.x = 6 * CONFIG.tileSize + 8;
    player.y = 12 * CONFIG.tileSize + 8;
    player.direction = 'up';
    player.invincible = true;
    player.invincibleTimer = CONFIG.invincibilityTime;
  }
  
  document.getElementById('boss-health-container').classList.add('hidden');
  
  startEnemySpawning();
  updateHUD();
}

function pauseGame() {
  STATE.current = 'paused';
  document.getElementById('pause-overlay').classList.remove('hidden');
}

function resumeGame() {
  STATE.current = 'playing';
  document.getElementById('pause-overlay').classList.add('hidden');
}

function stopGameLoop() {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
}

// ============================================
// PLAYER FUNCTIONS
// ============================================
function createPlayer() {
  return {
    x: 6 * CONFIG.tileSize + 8,
    y: 12 * CONFIG.tileSize + 8,
    width: CONFIG.tileSize - 1,
    height: CONFIG.tileSize - 1,
    imgWidth: 48,      // Custom image display size
    imgHeight: 48,     // Custom image display size
    direction: 'up',
    speed: CONFIG.playerSpeed,
    isMoving: false,
    invincible: true,
    invincibleTimer: CONFIG.invincibilityTime,
    gunLevel: 1,
    canFire: true,
    lastFireTime: 0,
    fireDelay: 400,
  };
}

function updatePlayer() {
  if (!player) return;
  
  if (player.invincible) {
    player.invincibleTimer -= 1000 / CONFIG.fps;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }
  
  let dx = 0, dy = 0;
  let newDirection = player.direction;
  
  if (keys['up']) {
    dy = -player.speed;
    newDirection = 'up';
  }
  if (keys['down']) {
    dy = player.speed;
    newDirection = 'down';
  }
  if (keys['left']) {
    dx = -player.speed;
    newDirection = 'left';
  }
  if (keys['right']) {
    dx = player.speed;
    newDirection = 'right';
  }
  
  if (dx !== 0 || dy !== 0) {
    player.direction = newDirection;
    player.isMoving = true;
  } else {
    player.isMoving = false;
  }
  
  if (dx !== 0 && dy !== 0) {
    const factor = 1 / Math.sqrt(2);
    dx *= factor;
    dy *= factor;
  }
  
  if (dx !== 0) {
    player.x += dx;
    if (checkPlayerCollision()) {
      player.x -= dx;
    }
  }
  
  if (dy !== 0) {
    player.y += dy;
    if (checkPlayerCollision()) {
      player.y -= dy;
    }
  }
  
  player.x = Math.max(0, Math.min(player.x, CONFIG.canvasWidth - player.width));
  player.y = Math.max(0, Math.min(player.y, CONFIG.canvasHeight - player.height));
  
  if (firePressed && player.canFire) {
    const now = Date.now();
    if (now - player.lastFireTime >= player.fireDelay) {
      fireBullet(player, false);
      player.lastFireTime = now;
    }
  }
}

// ============================================
// ENEMY FUNCTIONS - UPDATED WITH SEPARATE IMAGE SIZE
// ============================================
function createEnemy(type, x, y) {
  // Enemy type configurations with SEPARATE image size and collision box
  const enemyTypes = {
    basic: { 
      hp: 1, 
      speed: 1.5, 
      color: '#ff4444', 
      points: 100,
      imgWidth: 48,      // Image display width (larger visual)
      imgHeight: 48,     // Image display height
      collisionWidth: 28, // Collision box width (smaller for fairness)
      collisionHeight: 28 // Collision box height
    },
    armored: { 
      hp: 2, 
      speed: 1.2, 
      color: '#ff8800', 
      points: 200,
      imgWidth: 52,      // Bigger visual for armored
      imgHeight: 52,
      collisionWidth: 32,
      collisionHeight: 32
    },
    rapid: { 
      hp: 1, 
      speed: 1.8, 
      color: '#ff00ff', 
      points: 300,
      imgWidth: 44,      // Slightly smaller, faster
      imgHeight: 44,
      collisionWidth: 26,
      collisionHeight: 26
    },
    missile: { 
      hp: 1, 
      speed: 1.5, 
      color: '#00ffff', 
      points: 400,
      imgWidth: 50,      // Large missile launcher
      imgHeight: 50,
      collisionWidth: 30,
      collisionHeight: 30
    },
  };
  
  const config = enemyTypes[type] || enemyTypes.basic;
  
  // Center the image based on its display size, collision box stays smaller
  const centerX = x * CONFIG.tileSize + (CONFIG.tileSize / 2);
  const centerY = y * CONFIG.tileSize + (CONFIG.tileSize / 2);
  
  return {
    // Position for collision box (centered)
    x: centerX - (config.collisionWidth / 2),
    y: centerY - (config.collisionHeight / 2),
    width: config.collisionWidth,
    height: config.collisionHeight,
    // Separate image display properties
    imgWidth: config.imgWidth,
    imgHeight: config.imgHeight,
    imgX: centerX - (config.imgWidth / 2),
    imgY: centerY - (config.imgHeight / 2),
    direction: 'down',
    speed: config.speed * CONFIG.enemySpeedBase,
    type: type,
    hp: config.hp,
    maxHp: config.hp,
    color: config.color,
    points: config.points,
    lastFireTime: Date.now() + Math.random() * 2000,
    moveTimer: 0,
    moveDelay: 500 + Math.random() * 1000,
  };
}

function startEnemySpawning() {
  const diffConfig = CONFIG.difficulties[STATE.difficulty];
  
  function spawnEnemy() {
    if (STATE.current !== 'playing') return;
    if (STATE.levelComplete) return;
    
    if (STATE.enemiesRemaining <= 0 && enemies.length === 0) {
      if (STATE.difficulty === 3 && !STATE.bossActive) {
        spawnBoss();
      } else if (STATE.difficulty < 3) {
        STATE.levelComplete = true;
        console.log('Level complete! Moving to next level...');
        setTimeout(() => nextLevel(), 2000);
      }
      return;
    }
    
    if (enemies.length < diffConfig.maxActiveEnemies && STATE.enemiesRemaining > 0) {
      let spawnCol, attempts = 0;
      do {
        spawnCol = Math.floor(Math.random() * CONFIG.gridCols);
        attempts++;
      } while (attempts < 10 && !isSpawnPositionFree(spawnCol, 0));
      
      const type = diffConfig.enemyTypes[Math.floor(Math.random() * diffConfig.enemyTypes.length)];
      const enemy = createEnemy(type, spawnCol, 0);
      
      if (isSpawnPositionFree(spawnCol, 0)) {
        enemies.push(enemy);
        STATE.enemiesRemaining--;
        updateHUD();
      }
    }
    
    if (STATE.current === 'playing' && !STATE.levelComplete) {
      spawnTimer = setTimeout(spawnEnemy, diffConfig.spawnInterval);
    }
  }
  
  spawnTimer = setTimeout(spawnEnemy, 1000);
}

function isSpawnPositionFree(col, row) {
  const x = col * CONFIG.tileSize;
  const y = row * CONFIG.tileSize;
  
  if (row >= 0 && row < CONFIG.gridRows && col >= 0 && col < CONFIG.gridCols) {
    if (mapData[row][col] !== 0) {
      return false;
    }
  }
  
  for (let enemy of enemies) {
    const enemyCol = Math.floor(enemy.x / CONFIG.tileSize);
    const enemyRow = Math.floor(enemy.y / CONFIG.tileSize);
    if (enemyCol === col && enemyRow === row) {
      return false;
    }
  }
  
  return true;
}

function updateEnemies() {
  if (STATE.freezeActive) return;
  
  const now = Date.now();
  const diffConfig = CONFIG.difficulties[STATE.difficulty];
  
  enemies.forEach(enemy => {
    // Update image position to follow collision box
    enemy.imgX = enemy.x + (enemy.width / 2) - (enemy.imgWidth / 2);
    enemy.imgY = enemy.y + (enemy.height / 2) - (enemy.imgHeight / 2);
    
    enemy.moveTimer += 1000 / CONFIG.fps;
    if (enemy.moveTimer >= enemy.moveDelay) {
      enemy.moveTimer = 0;
      enemy.moveDelay = 300 + Math.random() * 1000;
      
      if (player && Math.random() < diffConfig.homingChance) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          enemy.direction = dx > 0 ? 'right' : 'left';
        } else {
          enemy.direction = dy > 0 ? 'down' : 'up';
        }
      } else {
        const directions = ['up', 'down', 'left', 'right'];
        enemy.direction = directions[Math.floor(Math.random() * 4)];
      }
    }
    
    let dx = 0, dy = 0;
    switch (enemy.direction) {
      case 'up': dy = -enemy.speed; break;
      case 'down': dy = enemy.speed; break;
      case 'left': dx = -enemy.speed; break;
      case 'right': dx = enemy.speed; break;
    }
    
    if (dx !== 0) {
      enemy.x += dx;
      if (checkCollision(enemy) || checkEnemyCollision(enemy)) {
        enemy.x -= dx;
        enemy.direction = getRandomDirection();
      }
    }
    if (dy !== 0) {
      enemy.y += dy;
      if (checkCollision(enemy) || checkEnemyCollision(enemy)) {
        enemy.y -= dy;
        enemy.direction = getRandomDirection();
      }
    }
    
    enemy.x = Math.max(0, Math.min(enemy.x, CONFIG.canvasWidth - enemy.width));
    enemy.y = Math.max(0, Math.min(enemy.y, CONFIG.canvasHeight - enemy.height));
    
    if (player && now - enemy.lastFireTime >= diffConfig.enemyFireRate) {
      enemy.lastFireTime = now;
      
      const canSeePlayer = checkLineOfSight(enemy, player);
      
      if (canSeePlayer || Math.random() < 0.3) {
        fireBullet(enemy, true);
        
        if (enemy.type === 'rapid') {
          setTimeout(() => {
            if (enemy && enemies.includes(enemy) && player) {
              fireBullet(enemy, true);
            }
          }, 150);
        }
      }
    }
  });
}

function getRandomDirection() {
  const directions = ['up', 'down', 'left', 'right'];
  return directions[Math.floor(Math.random() * 4)];
}

function checkLineOfSight(enemy, player) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  
  switch (enemy.direction) {
    case 'up': if (dy > 0) return false; break;
    case 'down': if (dy < 0) return false; break;
    case 'left': if (dx > 0) return false; break;
    case 'right': if (dx < 0) return false; break;
  }
  
  return true;
}

// ============================================
// BOSS FUNCTIONS
// ============================================
function spawnBoss() {
  console.log('BOSS SPAWNING!');
  STATE.bossActive = true;
  STATE.bossHP = CONFIG.boss.totalHP;
  STATE.bossPhase = 1;
  
  STATE.bossPhaseData = {
    x: CONFIG.canvasWidth / 2 - CONFIG.boss.width / 2,
    y: 0,
    width: CONFIG.boss.width,
    height: CONFIG.boss.height,
    imgWidth: 140,     // Boss image larger than collision
    imgHeight: 140,
    direction: 'right',
    speed: CONFIG.boss.speed,
    lastFireTime: Date.now(),
    fireRate: 1500,
  };
  
  document.getElementById('boss-warning').classList.remove('hidden');
  document.getElementById('boss-health-container').classList.remove('hidden');
  updateBossHealthBar();
  
  setTimeout(() => {
    document.getElementById('boss-warning').classList.add('hidden');
  }, 2000);
}

function hitBoss() {
  STATE.bossHP--;
  STATE.score += 500;
  updateBossHealthBar();
  
  createExplosion(STATE.bossPhaseData.x + STATE.bossPhaseData.width / 2, 
                  STATE.bossPhaseData.y + STATE.bossPhaseData.height / 2);
  
  if (STATE.bossHP <= 0) {
    STATE.bossActive = false;
    STATE.score += 5000;
    createExplosion(CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2, 50);
    setTimeout(() => victory(), 2000);
  } else {
    const hpPercent = STATE.bossHP / CONFIG.boss.totalHP;
    if (hpPercent <= 0.25) STATE.bossPhase = 4;
    else if (hpPercent <= 0.5) STATE.bossPhase = 3;
    else if (hpPercent <= 0.75) STATE.bossPhase = 2;
    
    STATE.bossPhaseData.fireRate = Math.max(400, STATE.bossPhaseData.fireRate - 200);
  }
}

function updateBoss() {
  if (!STATE.bossActive || !STATE.bossPhaseData) return;
  
  const boss = STATE.bossPhaseData;
  
  boss.x += boss.direction === 'right' ? boss.speed : -boss.speed;
  
  if (boss.x <= 0) {
    boss.x = 0;
    boss.direction = 'right';
  } else if (boss.x + boss.width >= CONFIG.canvasWidth) {
    boss.x = CONFIG.canvasWidth - boss.width;
    boss.direction = 'left';
  }
  
  const now = Date.now();
  if (now - boss.lastFireTime >= boss.fireRate && player) {
    boss.lastFireTime = now;
    
    switch (STATE.bossPhase) {
      case 1:
        fireBulletFromPoint(boss.x + boss.width / 2, boss.y + boss.height, 'down');
        break;
      case 2:
        fireBulletFromPoint(boss.x + boss.width / 2 - 30, boss.y + boss.height, 'down');
        fireBulletFromPoint(boss.x + boss.width / 2 + 30, boss.y + boss.height, 'down');
        break;
      case 3:
        for (let i = -2; i <= 2; i++) {
          fireBulletFromPoint(boss.x + boss.width / 2 + i * 20, boss.y + boss.height, 'down');
        }
        break;
      case 4:
        for (let i = -3; i <= 3; i++) {
          fireBulletFromPoint(boss.x + boss.width / 2 + i * 15, boss.y + boss.height, 'down');
        }
        break;
    }
  }
}

function updateBossHealthBar() {
  const fill = document.getElementById('boss-health-fill');
  if (fill) {
    const percent = (STATE.bossHP / CONFIG.boss.totalHP) * 100;
    fill.style.width = percent + '%';
  }
}

// ============================================
// BULLET FUNCTIONS
// ============================================
function fireBullet(source, isEnemy) {
  let bx = source.x + source.width / 2 - 3;
  let by = source.y + source.height / 2 - 3;
  
  switch (source.direction) {
    case 'up':
      bx = source.x + source.width / 2 - 3;
      by = source.y - 8;
      break;
    case 'down':
      bx = source.x + source.width / 2 - 3;
      by = source.y + source.height;
      break;
    case 'left':
      bx = source.x - 8;
      by = source.y + source.height / 2 - 3;
      break;
    case 'right':
      bx = source.x + source.width;
      by = source.y + source.height / 2 - 3;
      break;
  }
  
  const speed = isEnemy && source.type === 'missile' ? CONFIG.bulletSpeed * 2 : CONFIG.bulletSpeed;
  const bullet = createBullet(bx, by, source.direction, speed, isEnemy);
  
  if (isEnemy) {
    enemyBullets.push(bullet);
  } else {
    bullets.push(bullet);
  }
}

function fireBulletFromPoint(x, y, direction) {
  const bullet = createBullet(x - 3, y - 3, direction, CONFIG.bulletSpeed, true);
  enemyBullets.push(bullet);
}

function createBullet(x, y, direction, speed, isEnemy = false) {
  return {
    x: x,
    y: y,
    width: 6,
    height: 6,
    direction: direction,
    speed: speed || CONFIG.bulletSpeed,
    isEnemy: isEnemy,
  };
}

function moveBullet(bullet) {
  switch (bullet.direction) {
    case 'up': bullet.y -= bullet.speed; break;
    case 'down': bullet.y += bullet.speed; break;
    case 'left': bullet.x -= bullet.speed; break;
    case 'right': bullet.x += bullet.speed; break;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    moveBullet(bullet);
    
    if (isOutOfBounds(bullet)) {
      bullets.splice(i, 1);
      continue;
    }
    
    const tile = getTileAt(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
    if (tile === 1) {
      destroyBrick(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
      bullets.splice(i, 1);
      continue;
    } else if (tile === 2) {
      bullets.splice(i, 1);
      continue;
    }
    
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (rectCollision(bullet, enemies[j])) {
        hitEnemy(enemies[j], j);
        bullets.splice(i, 1);
        hit = true;
        break;
      }
    }
    
    if (!hit && STATE.bossActive && STATE.bossPhaseData) {
      if (rectCollision(bullet, STATE.bossPhaseData)) {
        hitBoss();
        bullets.splice(i, 1);
      }
    }
  }
  
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    moveBullet(bullet);
    
    if (isOutOfBounds(bullet)) {
      enemyBullets.splice(i, 1);
      continue;
    }
    
    const tile = getTileAt(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
    if (tile === 1 || tile === 2) {
      if (tile === 1) destroyBrick(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
      enemyBullets.splice(i, 1);
      continue;
    }
    
    if (player && !player.invincible && rectCollision(bullet, player)) {
      hitPlayer();
      enemyBullets.splice(i, 1);
    }
  }
}

// ============================================
// COLLISION DETECTION
// ============================================
function checkPlayerCollision() {
  const margin = 2;
  
  const left = Math.floor((player.x + margin) / CONFIG.tileSize);
  const right = Math.floor((player.x + player.width - margin) / CONFIG.tileSize);
  const top = Math.floor((player.y + margin) / CONFIG.tileSize);
  const bottom = Math.floor((player.y + player.height - margin) / CONFIG.tileSize);
  
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (row >= 0 && row < CONFIG.gridRows && col >= 0 && col < CONFIG.gridCols) {
        const tile = mapData[row][col];
        if (tile === 1 || tile === 2 || tile === 3) {
          return true;
        }
      } else {
        return true;
      }
    }
  }
  
  return false;
}

function checkCollision(obj) {
  const left = Math.floor(obj.x / CONFIG.tileSize);
  const right = Math.floor((obj.x + obj.width - 1) / CONFIG.tileSize);
  const top = Math.floor(obj.y / CONFIG.tileSize);
  const bottom = Math.floor((obj.y + obj.height - 1) / CONFIG.tileSize);
  
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (row >= 0 && row < CONFIG.gridRows && col >= 0 && col < CONFIG.gridCols) {
        const tile = mapData[row][col];
        if (tile === 1 || tile === 2 || tile === 3) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function checkEnemyCollision(enemy) {
  for (let other of enemies) {
    if (other !== enemy && rectCollision(enemy, other)) {
      return true;
    }
  }
  
  if (player && rectCollision(enemy, player)) {
    return true;
  }
  
  return false;
}

function rectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function getTileAt(x, y) {
  const col = Math.floor(x / CONFIG.tileSize);
  const row = Math.floor(y / CONFIG.tileSize);
  if (row >= 0 && row < CONFIG.gridRows && col >= 0 && col < CONFIG.gridCols) {
    return mapData[row][col];
  }
  return -1;
}

function destroyBrick(x, y) {
  const col = Math.floor(x / CONFIG.tileSize);
  const row = Math.floor(y / CONFIG.tileSize);
  if (row >= 0 && row < CONFIG.gridRows && col >= 0 && col < CONFIG.gridCols) {
    if (mapData[row][col] === 1) {
      mapData[row][col] = 0;
      createExplosion(col * CONFIG.tileSize + CONFIG.tileSize/2, 
                     row * CONFIG.tileSize + CONFIG.tileSize/2, 5);
    }
  }
}

function isOutOfBounds(obj) {
  return obj.x < -20 || obj.x > CONFIG.canvasWidth + 20 ||
         obj.y < -20 || obj.y > CONFIG.canvasHeight + 20;
}

// ============================================
// COMBAT FUNCTIONS
// ============================================
function hitEnemy(enemy, index) {
  enemy.hp--;
  if (enemy.hp <= 0) {
    STATE.score += enemy.points;
    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
    
    if (Math.random() < 0.3) {
      spawnPowerUp(enemy.x, enemy.y);
    }
    
    enemies.splice(index, 1);
    updateHUD();
    
    if (STATE.enemiesRemaining <= 0 && enemies.length === 0) {
      if (STATE.difficulty === 3 && !STATE.bossActive) {
        setTimeout(() => spawnBoss(), 1000);
      } else if (STATE.difficulty < 3 && !STATE.levelComplete) {
        STATE.levelComplete = true;
        console.log('Level complete!');
        setTimeout(() => nextLevel(), 2000);
      }
    }
  } else {
    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 3);
  }
}

function hitPlayer() {
  if (player.invincible) return;
  
  STATE.playerLives--;
  createExplosion(player.x + player.width/2, player.y + player.height/2);
  
  if (STATE.playerLives <= 0) {
    player = null;
    setTimeout(() => gameOver(), 500);
  } else {
    player.x = 6 * CONFIG.tileSize + 8;
    player.y = 12 * CONFIG.tileSize + 8;
    player.direction = 'up';
    player.invincible = true;
    player.invincibleTimer = CONFIG.invincibilityTime;
    player.gunLevel = 1;
  }
  
  updateHUD();
}

// ============================================
// POWER-UP FUNCTIONS
// ============================================
function spawnPowerUp(x, y) {
  const types = ['star', 'bomb', 'timer', 'helmet', 'life'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  powerUps.push({
    x: x,
    y: y,
    width: 30,
    height: 30,
    type: type,
    timer: 10000,
  });
}

function updatePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const pu = powerUps[i];
    pu.timer -= 1000 / CONFIG.fps;
    
    if (pu.timer <= 0) {
      powerUps.splice(i, 1);
      continue;
    }
    
    if (player && rectCollision(player, pu)) {
      collectPowerUp(pu.type);
      powerUps.splice(i, 1);
    }
  }
}

function collectPowerUp(type) {
  switch (type) {
    case 'star':
      if (player.gunLevel < 3) player.gunLevel++;
      break;
    case 'bomb':
      enemies.forEach(enemy => {
        STATE.score += enemy.points;
        createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
      });
      enemies = [];
      break;
    case 'timer':
      STATE.freezeActive = true;
      clearTimeout(STATE.freezeTimer);
      STATE.freezeTimer = setTimeout(() => {
        STATE.freezeActive = false;
      }, CONFIG.freezeDuration);
      break;
    case 'helmet':
      player.invincible = true;
      player.invincibleTimer = 15000;
      break;
    case 'life':
      STATE.playerLives = Math.min(5, STATE.playerLives + 1);
      break;
  }
  
  STATE.playerPowerUp = type;
  updateHUD();
}

// ============================================
// PARTICLE EFFECTS
// ============================================
function createExplosion(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 30,
      maxLife: 30,
      color: Math.random() > 0.5 ? '#ff8800' : '#ffcc00',
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ============================================
// HUD UPDATE
// ============================================
function updateHUD() {
  const livesDisplay = document.getElementById('lives-display');
  if (livesDisplay) {
    livesDisplay.textContent = '◈'.repeat(Math.max(0, STATE.playerLives));
  }
  
  const powerupDisplay = document.getElementById('powerup-display');
  if (powerupDisplay) {
    powerupDisplay.textContent = STATE.playerPowerUp ? STATE.playerPowerUp.toUpperCase() : 'NONE';
  }
  
  const enemiesDisplay = document.getElementById('enemies-display');
  if (enemiesDisplay) {
    const totalRemaining = STATE.enemiesRemaining + enemies.length;
    enemiesDisplay.textContent = '◘'.repeat(Math.max(0, totalRemaining));
  }
  
  const scoreDisplay = document.getElementById('score-display');
  if (scoreDisplay) {
    scoreDisplay.textContent = STATE.score;
  }
  
  const levelDisplay = document.getElementById('level-display');
  if (levelDisplay) {
    levelDisplay.textContent = 'LEVEL: ' + STATE.currentLevel;
  }
}

// ============================================
// MAIN UPDATE LOOP
// ============================================
function update() {
  if (STATE.current !== 'playing') return;
  
  updatePlayer();
  updateEnemies();
  if (STATE.bossActive) updateBoss();
  updateBullets();
  updatePowerUps();
  updateParticles();
  updateHUD();
  
  draw();
}

// ============================================
// RENDERING - UPDATED WITH SEPARATE IMAGE SIZES
// ============================================
function draw() {
  ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  
  drawMap();
  
  powerUps.forEach(pu => drawPowerUp(pu));
  
  if (player) drawEntity(player, 'player');
  
  enemies.forEach(enemy => drawEntity(enemy, 'enemy'));
  
  if (STATE.bossActive && STATE.bossPhaseData) {
    drawEntity(STATE.bossPhaseData, 'boss');
  }
  
  bullets.forEach(bullet => {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
  
  enemyBullets.forEach(bullet => {
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
  
  particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    ctx.globalAlpha = 1;
  });
  
  if (STATE.levelComplete) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', CONFIG.canvasWidth/2, CONFIG.canvasHeight/2);
  }
}

// UPDATED drawEntity with SEPARATE image and collision sizes
function drawEntity(entity, type) {
  let sprite = null;
  
  if (type === 'player') {
    sprite = SPRITES.player;
  } else if (type === 'boss') {
    sprite = SPRITES.boss;
  } else if (type === 'enemy') {
    sprite = SPRITES.enemies[entity.type];
  }
  
  // Use custom image position and size if available
  const drawX = entity.imgX !== undefined ? entity.imgX : entity.x;
  const drawY = entity.imgY !== undefined ? entity.imgY : entity.y;
  const drawWidth = entity.imgWidth || entity.width;
  const drawHeight = entity.imgHeight || entity.height;
  
  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    ctx.save();
    
    if (entity.direction) {
      const cx = drawX + drawWidth / 2;
      const cy = drawY + drawHeight / 2;
      
      ctx.translate(cx, cy);
      
      switch(entity.direction) {
        case 'up': ctx.rotate(0); break;
        case 'down': ctx.rotate(Math.PI); break;
        case 'left': ctx.rotate(-Math.PI / 2); break;
        case 'right': ctx.rotate(Math.PI / 2); break;
      }
      
      ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else {
      ctx.drawImage(sprite, drawX, drawY, drawWidth, drawHeight);
    }
    
    ctx.restore();
  } else {
    // Fallback to default drawing
    if (type === 'boss') {
      drawBossDefault(entity);
    } else {
      const color = type === 'player' ? '#00ff00' : entity.color;
      const invincible = type === 'player' ? player.invincible : false;
      drawTankDefault(entity, color, invincible, drawX, drawY, drawWidth, drawHeight);
    }
  }
  
  // Optional: Draw collision box for debugging (uncomment to see)
  /*
  if (type === 'enemy') {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
  }
  */
}

function drawTankDefault(tank, color, isInvincible, drawX, drawY, drawWidth, drawHeight) {
  ctx.save();
  
  if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  ctx.fillStyle = color;
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
  
  ctx.fillStyle = '#000000';
  const cx = drawX + drawWidth / 2;
  const cy = drawY + drawHeight / 2;
  
  switch (tank.direction) {
    case 'up':
      ctx.fillRect(cx - 2, drawY - 10, 4, 14);
      break;
    case 'down':
      ctx.fillRect(cx - 2, drawY + drawHeight - 4, 4, 14);
      break;
    case 'left':
      ctx.fillRect(drawX - 10, cy - 2, 14, 4);
      break;
    case 'right':
      ctx.fillRect(drawX + drawWidth - 4, cy - 2, 14, 4);
      break;
  }
  
  ctx.fillStyle = '#333333';
  if (tank.direction === 'up' || tank.direction === 'down') {
    ctx.fillRect(drawX - 2, drawY, 4, drawHeight);
    ctx.fillRect(drawX + drawWidth - 2, drawY, 4, drawHeight);
  } else {
    ctx.fillRect(drawX, drawY - 2, drawWidth, 4);
    ctx.fillRect(drawX, drawY + drawHeight - 2, drawWidth, 4);
  }
  
  ctx.restore();
}

function drawBossDefault(boss) {
  const drawX = boss.imgX !== undefined ? boss.imgX : boss.x;
  const drawY = boss.imgY !== undefined ? boss.imgY : boss.y;
  const drawWidth = boss.imgWidth || boss.width;
  const drawHeight = boss.imgHeight || boss.height;
  
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
  
  ctx.fillStyle = '#880000';
  ctx.fillRect(drawX + 10, drawY - 15, 20, 20);
  ctx.fillRect(drawX + drawWidth/2 - 15, drawY - 25, 30, 30);
  ctx.fillRect(drawX + drawWidth - 30, drawY - 15, 20, 20);
  
  if (STATE.bossPhase === 4) {
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffff00';
  } else {
    ctx.fillStyle = '#ff4444';
  }
  ctx.beginPath();
  ctx.arc(drawX + drawWidth/2, drawY + drawHeight/2, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawMap() {
  for (let row = 0; row < CONFIG.gridRows; row++) {
    for (let col = 0; col < CONFIG.gridCols; col++) {
      const tile = mapData[row][col];
      const x = col * CONFIG.tileSize;
      const y = row * CONFIG.tileSize;
      
      switch (tile) {
        case 1:
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x, y, CONFIG.tileSize, CONFIG.tileSize);
          ctx.strokeStyle = '#654321';
          ctx.strokeRect(x, y, CONFIG.tileSize, CONFIG.tileSize);
          ctx.beginPath();
          ctx.moveTo(x + CONFIG.tileSize/2, y);
          ctx.lineTo(x + CONFIG.tileSize/2, y + CONFIG.tileSize);
          ctx.moveTo(x, y + CONFIG.tileSize/2);
          ctx.lineTo(x + CONFIG.tileSize, y + CONFIG.tileSize/2);
          ctx.stroke();
          break;
        case 2:
          ctx.fillStyle = '#808080';
          ctx.fillRect(x, y, CONFIG.tileSize, CONFIG.tileSize);
          ctx.strokeStyle = '#a0a0a0';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, CONFIG.tileSize - 4, CONFIG.tileSize - 4);
          ctx.lineWidth = 1;
          break;
        case 3:
          ctx.fillStyle = '#0044ff';
          ctx.fillRect(x, y, CONFIG.tileSize, CONFIG.tileSize);
          break;
        case 5:
          ctx.fillStyle = '#aaddff';
          ctx.fillRect(x, y, CONFIG.tileSize, CONFIG.tileSize);
          break;
      }
    }
  }
  
  const baseX = 6 * CONFIG.tileSize;
  const baseY = 12 * CONFIG.tileSize;
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(baseX + 5, baseY + 5, CONFIG.tileSize - 10, CONFIG.tileSize - 10);
  ctx.fillStyle = '#000';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('HQ', baseX + CONFIG.tileSize/2, baseY + CONFIG.tileSize/2 + 6);
}

function drawPowerUp(pu) {
  if (Math.floor(Date.now() / 200) % 2 === 0) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pu.type[0].toUpperCase(), pu.x + pu.width/2, pu.y + pu.height/2 + 4);
  }
}

// ============================================
// START GAME
// ============================================
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing game...');
      init();
    });
  } else {
    console.log('DOM already loaded, initializing game...');
    init();
  }
})();
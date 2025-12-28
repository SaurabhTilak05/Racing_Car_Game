const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = 'assets/images/player.png';

const enemyImg = new Image();
enemyImg.src = 'assets/images/enemy_1.png';

const bgMusic = new Audio('assets/audio/engine.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

const crashSound = new Audio('assets/audio/crash.wav');

let score = 0;
let highScore = localStorage.getItem('high') || 0;

const lanes = [80, 175, 270];

const player = {
  x: lanes[1],
  y: 550,
  w: 50,
  h: 100,
  lane: 1,
  speed: 5,
  nitro: 0
};

const enemies = [];
let state = "MENU";
let cameraShake = 0;
let screenFlash = 0;

function spawnEnemy() {
  enemies.push({ x: lanes[Math.floor(Math.random() * 3)], y: -120, w: 50, h: 100 });
}

function startGame() {
  enemies.length = 0;
  score = 0;
  state = "PLAYING";
  document.getElementById('overlay').classList.add('hidden');
  bgMusic.play();
}

function crash() {
  cameraShake = 12;
  screenFlash = 0.5;
  state = "GAMEOVER";
  crashSound.play();
  bgMusic.pause();

  highScore = Math.max(highScore, score);
  localStorage.setItem('high', highScore);

  document.getElementById('overlay').classList.remove('hidden');
}

function update() {
  if (state !== "PLAYING") return;

  if (Math.random() < 0.02) spawnEnemy();

  enemies.forEach(e => {
    e.y += player.speed;

    if (e.x < player.x + player.w &&
        e.x + e.w > player.x &&
        e.y < player.y + player.h &&
        e.y + e.h > player.y) {
      crash();
    }
  });

  if (player.nitro > 0) {
    player.speed = 9;
    player.nitro--;
  } else {
    player.speed = 5;
  }

  score++;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (cameraShake > 0) {
    ctx.translate((Math.random() - 0.5) * cameraShake,
                  (Math.random() - 0.5) * cameraShake);
    cameraShake *= 0.9;
  }

  ctx.fillStyle = '#555';
  ctx.fillRect(40, 0, 320, 700);

  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  enemies.forEach(e => ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h));

  if (screenFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${screenFlash})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    screenFlash -= 0.05;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function loop() {
  update();
  draw();

  document.getElementById('score').innerText = score;
  document.getElementById('speed').innerText = player.speed * 20;
  document.getElementById('highScore').innerText = highScore;

  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && player.lane > 0) player.lane--;
  if (e.key === 'ArrowRight' && player.lane < 2) player.lane++;
  if (e.key === ' ') player.nitro = 60;

  player.x = lanes[player.lane];
});

document.getElementById('btnStart').onclick = startGame;
document.getElementById('btnOverlay').onclick = startGame;

loop();

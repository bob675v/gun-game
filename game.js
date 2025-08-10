const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

const player = {
  x: 400,
  y: 300,
  size: 20,
  speed: 3,
  color: "cyan",
  kills: 0,
  weaponLevel: 0,
  shootCooldown: 0
};

const bullets = [];
const enemies = [];

const weapons = [
  { speed: 5, damage: 1, color: "white" },
  { speed: 6, damage: 2, color: "yellow" },
  { speed: 7, damage: 3, color: "red" }
];

// Spawning enemies
function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 20,
    hp: 3,
    color: "green"
  });
}

// Shooting bullets
function shoot(x, y) {
  if (player.shootCooldown > 0) return;
  const angle = Math.atan2(y - player.y, x - player.x);
  const weapon = weapons[player.weaponLevel];
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * weapon.speed,
    dy: Math.sin(angle) * weapon.speed,
    damage: weapon.damage,
    color: weapon.color
  });
  player.shootCooldown = 15;
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  shoot(e.clientX - rect.left, e.clientY - rect.top);
});

function update() {
  // Movement
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Cooldown
  if (player.shootCooldown > 0) player.shootCooldown--;

  // Bullet logic
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;

    // Remove if offscreen
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }

    // Collision with enemies
    enemies.forEach((e, j) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.size) {
        e.hp -= b.damage;
        bullets.splice(i, 1);
        if (e.hp <= 0) {
          enemies.splice(j, 1);
          player.kills++;
          if (player.kills % 3 === 0 && player.weaponLevel < weapons.length - 1) {
            player.weaponLevel++;
          }
        }
      }
    });
  });

  // Respawn enemies
  if (enemies.length < 5) {
    spawnEnemy();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Draw bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Kills: ${player.kills}`, 10, 20);
  ctx.fillText(`Weapon Level: ${player.weaponLevel + 1}`, 10, 40);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

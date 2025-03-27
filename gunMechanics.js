/* gunMechanics.js */

// Define the weapon properties for each weapon type
const weaponProperties = {
  pistol: { cooldown: 300, bulletCount: 1, spread: 0 },
  shotgun: { cooldown: 800, bulletCount: 5, spread: 0.2 },
  assault: { cooldown: 150, bulletCount: 1, spread: 0 }
};

// Set the initial weapon and related variables
let currentWeapon = "pistol";
let lastShotTime = 0;
const bulletSpeed = 8;
const bulletRadius = 5;
const bullets = [];

// Update the weapon display on the main page
function updateWeaponDisplay() {
  const display = document.getElementById("weaponDisplay");
  if (display) {
    display.textContent = "Weapon: " + currentWeapon.charAt(0).toUpperCase() + currentWeapon.slice(1);
  }
}
updateWeaponDisplay();

// Function to shoot bullets based on the current weapon's properties
function shootBullet(player, gameMode, socket) {
  const now = Date.now();
  const cooldown = weaponProperties[currentWeapon].cooldown;
  if (now - lastShotTime < cooldown) return;
  lastShotTime = now;
  
  const props = weaponProperties[currentWeapon];
  if (props.bulletCount > 1) {
    for (let i = 0; i < props.bulletCount; i++) {
      const offset = -props.spread + (2 * props.spread * i) / (props.bulletCount - 1);
      const bullet = {
        x: player.x,
        y: player.y,
        radius: bulletRadius,
        speed: bulletSpeed,
        angle: player.angle + offset
      };
      bullets.push(bullet);
      if (gameMode === "multiplayer" && socket) {
        socket.emit("shoot", { bullet: bullet });
      }
    }
  } else {
    const bullet = {
      x: player.x,
      y: player.y,
      radius: bulletRadius,
      speed: bulletSpeed,
      angle: player.angle
    };
    bullets.push(bullet);
    if (gameMode === "multiplayer" && socket) {
      socket.emit("shoot", { bullet: bullet });
    }
  }
}

// Update bullet positions and remove them if they leave the canvas
function updateBullets(canvas) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.speed * Math.cos(b.angle);
    b.y += b.speed * Math.sin(b.angle);
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  }
}

// Draw all active bullets on the canvas
function drawBullets(ctx) {
  for (const bullet of bullets) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

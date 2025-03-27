// Default weapon and properties.
let currentWeapon = "pistol"; // Global variable used by the main file.
const weaponProperties = {
  pistol: { cooldown: 300, bulletCount: 1, spread: 0 },
  shotgun: { cooldown: 800, bulletCount: 5, spread: 0.2 },
  // Assault rifle now fires a three-round burst.
  assault: { cooldown: 150, bulletCount: 3, spread: 0.1, burstDelay: 100 }
};

const bullets = []; // Array holding local bullets.
let lastShotTime = 0;

// shootBullet is called when the player clicks.
function shootBullet(player, gameMode, socket) {
  const now = Date.now();
  const props = weaponProperties[currentWeapon];
  
  if (currentWeapon === "assault") {
    if (now - lastShotTime < props.cooldown) return;
    lastShotTime = now;
    for (let i = 0; i < props.bulletCount; i++) {
      setTimeout(() => {
        const bullet = {
          x: player.x,
          y: player.y,
          radius: 5,
          speed: 8,
          angle: player.angle,
          owner: socket ? socket.id : "local"
        };
        bullets.push(bullet);
        if (gameMode === "multiplayer" && socket) {
          socket.emit("playerShot", bullet);
        }
      }, i * props.burstDelay);
    }
  } else {
    if (now - lastShotTime < props.cooldown) return;
    lastShotTime = now;
    if (props.bulletCount > 1) {
      for (let i = 0; i < props.bulletCount; i++) {
        const offset = -props.spread + (2 * props.spread * i) / (props.bulletCount - 1);
        const bullet = {
          x: player.x,
          y: player.y,
          radius: 5,
          speed: 8,
          angle: player.angle + offset,
          owner: socket ? socket.id : "local"
        };
        bullets.push(bullet);
        if (gameMode === "multiplayer" && socket) {
          socket.emit("playerShot", bullet);
        }
      }
    } else {
      const bullet = {
        x: player.x,
        y: player.y,
        radius: 5,
        speed: 8,
        angle: player.angle,
        owner: socket ? socket.id : "local"
      };
      bullets.push(bullet);
      if (gameMode === "multiplayer" && socket) {
        socket.emit("playerShot", bullet);
      }
    }
  }
}

// updateBullets updates positions of local bullets and removes them if off-screen or on obstacle collision.
function updateBullets(canvas, obstacles) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.speed * Math.cos(b.angle);
    b.y += b.speed * Math.sin(b.angle);
    // Remove if off-screen.
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }
    // Check collision with obstacles.
    for (let obs of obstacles) {
      if (b.x > obs.x && b.x < obs.x + obs.width &&
          b.y > obs.y && b.y < obs.y + obs.height) {
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

// drawBullets renders all local bullets.
function drawBullets(ctx) {
  for (const b of bullets) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

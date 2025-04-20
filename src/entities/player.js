import { keys, mouse } from '../utils.js';
import { Bullet } from './bullet.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.hp = 100;
    this.magazine = 30;
    this.reloadTime = 1.5;
    this.reloading = 0;
    this.bullets = [];
    this.facingRight = true;
    this.image = new Image();
    this.image.src = 'assets/main.png';
    this.baseSpeed = 200;
    this.speed = this.baseSpeed;
    this.baseReloadTime = 1.5;
    this.reloadTime = this.baseReloadTime;
    this.showReloadPrompt = false;
  }

  update(delta) {
    if (keys['KeyW']) this.y -= this.speed * delta;
    if (keys['KeyS']) this.y += this.speed * delta;
    if (keys['KeyA']) {
      this.x -= this.speed * delta;
      this.facingRight = false;
    }
    if (keys['KeyD']) {
      this.x += this.speed * delta;
      this.facingRight = true;
    }

    this.x = Math.max(0, Math.min(this.x, 2400 - this.width));
    this.y = Math.max(0, Math.min(this.y, 1800 - this.height));

    // Shooting logic with reload prompt
    if (mouse.left) {
      if (this.magazine > 0 && this.reloading <= 0) {
        this.shoot();
        this.magazine--;
        this.showReloadPrompt = false;
      } else if (this.magazine === 0) {
        this.showReloadPrompt = true;
      }
      mouse.left = false;
    }

    if (mouse.right && this.magazine < 30 && this.reloading <= 0) {
      this.reloading = this.reloadTime;
      this.showReloadPrompt = false;
      mouse.right = false;
    }

    if (this.reloading > 0) {
      this.reloading -= delta;
      if (this.reloading <= 0) this.magazine = 30;
    }

    this.bullets.forEach(b => b.update(delta));
    this.bullets = this.bullets.filter(
      b => b.x >= 0 && b.x <= 2400 && b.y >= 0 && b.y <= 1800
    );
  }

  shoot() {
    const cx = this.x + this.width/2;
    const cy = this.y + this.height/2;
    const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
    const speed = 400;
    
    this.bullets.push(new Bullet(
      cx, cy,
      Math.cos(angle)*speed,
      Math.sin(angle)*speed,
      'player'
    ));
  }

  draw(ctx) {
    ctx.save();
    
    if (this.facingRight) {
      ctx.translate(this.x, this.y);
    } else {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
    }

    if (this.image.complete) {
      ctx.drawImage(this.image, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    
    ctx.restore();
    this.bullets.forEach(b => b.draw(ctx));
  }
}
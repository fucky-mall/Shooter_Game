import { Bullet } from './bullet.js';
import { rectsCollide } from '../utils.js';

export class Monster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 100;
    this.hp = 50;
    this.bullets = [];
    this.shootInterval = 2;
    this._timer = Math.random()*this.shootInterval;
    this.facingRight = false;
    this.image = new Image();
    this.image.src = 'assets/monster.png';
  }

  update(delta, player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 0) {
      this.x += (dx/dist)*this.speed*delta;
      this.y += (dy/dist)*this.speed*delta;
    }

    this.facingRight = player.x > this.x;

    this._timer -= delta;
    if (this._timer <= 0) {
      this._timer = this.shootInterval;
      this.shootAt(player);
    }

    this.bullets.forEach(b => b.update(delta));
    this.bullets = this.bullets.filter(
      b => b.x >= 0 && b.x <= 2400 && b.y >= 0 && b.y <= 1800
    );
  }

  shootAt(player) {
    const cx = this.x + this.width/2;
    const cy = this.y + this.height/2;
    const px = player.x + player.width/2;
    const py = player.y + player.height/2;
    const angle = Math.atan2(py - cy, px - cx);
    const speed = 300;
    
    this.bullets.push(new Bullet(
      cx, cy,
      Math.cos(angle)*speed,
      Math.sin(angle)*speed,
      'monster'
    ));
  }

  draw(ctx) {
    ctx.save();
    
    if (this.facingRight) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(this.x, this.y);
    }

    if (this.image.complete) {
      ctx.drawImage(this.image, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    
    ctx.restore();
    this.bullets.forEach(b => b.draw(ctx));
  }
}
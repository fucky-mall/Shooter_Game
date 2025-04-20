export class Bullet {
    constructor(x, y, vx, vy, owner) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.width = 16;
      this.height = 16;
      this.damage = 10;
      this.owner = owner;
      this.image = new Image();
      this.image.src = 'assets/Bullet.png';
    }
  

    update(delta) {
      this.x += this.vx * delta;
      this.y += this.vy * delta;
    }
  
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));
      
      if (!this.image.complete) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
      } else {
        ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
      }
      
      ctx.restore();
    }
  }
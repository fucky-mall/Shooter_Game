// export class HealthPack {
//     constructor(x, y) {
//       this.x = x;
//       this.y = y;
//       this.width = 32;
//       this.height = 32;
//       this.color = '#00ff00';
//     }
  
//     draw(ctx) {
//       ctx.fillStyle = this.color;
//       ctx.fillRect(this.x, this.y, this.width, this.height);
//     }
//   }


export class HealthPack {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 32;
      this.height = 32;
      this.image = new Image();
      this.image.src = 'assets/health.png';
      this.color = '#00ff00'; //Default colour
    }
  
    draw(ctx) {
      if (this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }
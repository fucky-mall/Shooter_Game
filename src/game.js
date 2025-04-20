import { initInput, rectsCollide } from './utils.js';
import { Player } from './entities/player.js';
import { Monster } from './entities/monster.js';
import { HealthPack } from './entities/healthPack.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        initInput(canvas);

        this.highScore = localStorage.getItem('highScore') || 0;
        this.showInstructions = true;  
        this.gameOver = false;
        this.lastTime = performance.now();

        this.boundKeydown = this.handleKeydown.bind(this);
        window.addEventListener('keydown', this.boundKeydown);

        this.resetGame();
        requestAnimationFrame(this.loop.bind(this));
    }

    handleKeydown(e) {
        if (this.showInstructions) {
            this.showInstructions = false;
            this.lastTime = performance.now();
            return;
        }

        if (this.gameOver) {
            this.resetGame();
        }
    }

    resetGame() {
        this.player = new Player(400, 300);
        this.monsters = [];
        this.healthPacks = [];
        this.spawnTimer = 0;
        this.score = 0;
        this.gameTime = 0;
        this.difficultyLevel = 1;
        this.gameOver = false;
        this.lastTime = performance.now();
    }

    loop(ts) {
        const delta = (ts - this.lastTime) / 1000;
        this.lastTime = ts;

        if (!this.showInstructions && !this.gameOver) {
            this.update(delta);
        }

        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    }

    update(delta) {
        if (this.player.hp <= 0) {
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
            }
            this.gameOver = true;
            return;
        }

        // Health pack 
        if (this.player.hp < 100 && Math.random() < 0.005) {
            const x = Math.random() * (2400 - 32);
            const y = Math.random() * (1800 - 32);
            this.healthPacks.push(new HealthPack(x, y));
        }

        // collisions check
        this.healthPacks = this.healthPacks.filter(pack => {
            if (rectsCollide(this.player, pack)) {
                this.player.hp = Math.min(100, this.player.hp + 10);
                return false;
            }
            return true;
        });

        // Difficulty scaling
        this.gameTime += delta;
        if (this.gameTime >= 60 * this.difficultyLevel) {
            this.difficultyLevel++;
            this.monsters.forEach(m => m.speed *= 1.15);
            this.player.speed = Math.min(this.player.baseSpeed * 1.5, this.player.speed * 1.05);
            this.player.reloadTime = Math.max(0.1, this.player.reloadTime * 0.9);
        }

        this.player.update(delta);

        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = 3;
            this.monsters.push(new Monster(
                Math.random() * (800 - 32),
                Math.random() * (600 - 32)
            ));
        }

        this.monsters.forEach(m => m.update(delta, this.player));

        this.player.bullets = this.player.bullets.filter(b => {
            let keep = true;
            this.monsters.forEach((m, i) => {
                if (rectsCollide(b, m)) {
                    m.hp -= b.damage;
                    keep = false;
                    if (m.hp <= 0) {
                        this.monsters.splice(i, 1);
                        this.score += 10;
                        this.highScore = Math.max(this.score, this.highScore);
                    }
                }
            });
            return keep;
        });

        this.monsters.forEach(m => {
            m.bullets = m.bullets.filter(b => {
                if (rectsCollide(b, this.player)) {
                    this.player.hp -= b.damage;
                    return false;
                }
                return true;
            });
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.showInstructions) {
            this.drawInstructions();
            return;
        }

        if (this.gameOver) {
            this.drawGameOver();
            return;
        }

        this.player.draw(this.ctx);
        this.monsters.forEach(m => m.draw(this.ctx));
        this.healthPacks.forEach(h => h.draw(this.ctx));
        this.drawHUD();
    }

    drawInstructions() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';

        const lines = [
            'HOW TO PLAY',
            '',
            'Movement: W A S D',
            'Aim: Mouse',
            'Shoot: Left Click',
            'Reload: Right Click',
            '',
            'Survive as long as possible!',
            '',
            'Press any key to start'
        ];

        let y = 200;
        lines.forEach(line => {
            this.ctx.fillText(line, this.canvas.width / 2, y);
            y += 50;
        });

        // this.ctx.fillStyle = '.assets/Monster.png';
        // this.ctx.fillRect(this.canvas.width / 2 - 50, y, 32, 32);
        // this.ctx.fillStyle = 'white';
        // this.ctx.fillText('← Shoot these monsters!', this.canvas.width / 2 + 30, y + 20);
    }
    drawHUD() {
        const ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';   

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        const baseX = 10;
        let currentY = 10;
        const lineHeight = 20;

        
        ctx.fillText(`High Score: ${this.highScore}`, baseX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Score: ${this.score}`, baseX, currentY);
        currentY += lineHeight;
        ctx.fillText(`HP: ${this.player.hp}`, baseX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Ammo: ${this.player.magazine}`, baseX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, baseX, currentY);

        // Reload timer
        if (this.player.reloading > 0) {
            currentY += lineHeight;
            ctx.fillText(`Reload: ${this.player.reloading.toFixed(1)}s`, baseX, currentY);
        }

        // Reload prompt
        if (this.player.showReloadPrompt) {
            ctx.fillStyle = 'yellow';
            ctx.font = '24px Arial';
            ctx.fillText('Press RIGHT CLICK to reload!', this.canvas.width/2 - 150, 10);
        }

      
        ctx.restore();
    }

    // drawHUD() {
    //     this.ctx.fillStyle = 'white';
    //     this.ctx.font = '16px Arial';
    //     this.ctx.fillText(`High Score: ${this.highScore}`, 10, 20);
    //     this.ctx.fillText(`Score: ${this.score}`, 10, 40);
    //     this.ctx.fillText(`HP: ${this.player.hp}`, 10, 60);
    //     this.ctx.fillText(`Ammo: ${this.player.magazine}`, 10, 80);
    //     this.ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, 10, 100);

    //     if (this.player.reloading > 0) {
    //         this.ctx.fillText(`Reload: ${this.player.reloading.toFixed(1)}s`, 10, 120);
    //     }

    //     if (this.player.showReloadPrompt) {
    //         this.ctx.fillStyle = 'yellow';
    //         this.ctx.font = '24px Arial';
    //         this.ctx.fillText('Reload..!!!', 300, 40);
    //     }
    // }

    drawGameOver() {
        localStorage.setItem('highScore', this.highScore);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText('Press any key to restart', this.canvas.width / 2, this.canvas.height / 2 + 100);
        this.ctx.textAlign = 'left';
    }
}

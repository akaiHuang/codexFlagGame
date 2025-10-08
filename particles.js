/**
 * 粒子特效系統 - 慶祝答對時的視覺效果
 */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * 建立慶祝粒子
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   */
  createParticles(x, y) {
    const colors = ['#6ee7b7', '#8ab4ff', '#ffd166', '#ff6b6b'];
    const count = 30;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        size: 3 + Math.random() * 4
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和繪製粒子
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // 重力
      p.life -= p.decay;

      if (p.life > 0) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.life;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        return true;
      }
      return false;
    });

    this.ctx.globalAlpha = 1;

    // 如果還有粒子，繼續動畫；否則停止
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
      this.animationId = null;
    }
  }

  /**
   * 停止動畫並清除所有粒子
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    this.isRunning = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

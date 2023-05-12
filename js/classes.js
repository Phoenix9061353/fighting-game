class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    frameMax = 1,
    offset = { x: 0, y: 0 },
  }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.frameMax = frameMax; //最大幀數
    this.framesCurrent = 0; //紀錄目前跑到哪一幀
    this.frameElapsed = 0; //計算過多久用
    this.frameHold = 5; //限制過多久換幀
    this.offset = offset; //將圖片都移至(0,0)的位置（比較好擺）
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.frameMax),
      0,
      this.image.width / this.frameMax,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      (this.image.width / this.frameMax) * this.scale,
      this.image.height * this.scale
    );
  }

  animateFrames() {
    this.frameElapsed++;
    if (this.frameElapsed % this.frameHold === 0) {
      if (this.framesCurrent < this.frameMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update() {
    this.draw();
    this.animateFrames();
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    frameMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = {
      offset: {},
      width: undefined,
      height: undefined,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      frameMax,
      offset,
    });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.color = color;
    this.isAttacking;
    this.health = 100;

    this.framesCurrent = 0;
    this.frameElapsed = 0;
    this.frameHold = 5;
    this.sprites = sprites; //更換角色圖片用

    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = this.sprites[sprite].imageSrc;
    }

    this.finish = false;
  }

  //box-model test
  // draw() {
  //   ctx.fillStyle = this.color;
  //   ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

  //   //Draw attack Box(when isAttacking)
  //   if (this.isAttacking) {
  //     ctx.fillStyle = 'green';
  //     ctx.fillRect(
  //       this.attackBox.position.x,
  //       this.attackBox.position.y,
  //       this.attackBox.width,
  //       this.attackBox.height
  //     );
  //   }
  // }

  update() {
    this.draw();
    if (!this.finish) this.animateFrames();
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // ctx.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // );

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvas.height - 78) {
      this.velocity.y = 0;
      //校正位置數值避免落地動作出現不正常
      this.position.y = 348;
    } else {
      this.velocity.y += gravity;
    }
  }

  attack() {
    this.isAttacking = true;
    this.switchSprites('attack1');
  }

  takeHit() {
    this.health -= 20;

    if (this.health <= 0) {
      this.switchSprites('death');
    } else {
      this.switchSprites('takeHit');
    }
  }

  switchSprites(sprite) {
    //死亡後不會執行其他動作
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.frameMax - 1)
        this.finish = true;
      return;
    }
    //在執行攻擊時不會觸發其他的動作＋使攻擊動作一次只跑完一輪
    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.frameMax - 1
    )
      return;
    //在執行被擊中動作時不會觸發其他的動作＋使被擊中動作一次只跑完一輪
    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.frameMax - 1
    )
      return;
    //其他動作
    switch (sprite) {
      case 'idle':
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.frameMax = this.sprites.idle.frameMax;
          //使動作切換時不會瞬間被卡空白幀數
          this.framesCurrent = 0;
        }
        break;
      case 'run':
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.frameMax = this.sprites.run.frameMax;
          this.framesCurrent = 0;
        }
        break;
      case 'jump':
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.frameMax = this.sprites.jump.frameMax;
          this.framesCurrent = 0;
        }
        break;
      case 'fall':
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.frameMax = this.sprites.fall.frameMax;
          this.framesCurrent = 0;
        }
        break;
      case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.frameMax = this.sprites.attack1.frameMax;
          this.framesCurrent = 0;
        }
        break;
      case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.frameMax = this.sprites.takeHit.frameMax;
          this.framesCurrent = 0;
        }
        break;
      case 'death':
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image;
          this.frameMax = this.sprites.death.frameMax;
          this.framesCurrent = 0;
        }
        break;
    }
  }
}

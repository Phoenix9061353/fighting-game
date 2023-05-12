const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const gravity = 0.7;
const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

//設定寬高
canvas.width = 1024;
canvas.height = 576;

//塗黑背景
ctx.fillRect(0, 0, canvas.width, canvas.height);

//設定背景圖片
const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: './img/background/background.png',
});

//設定商店圖片（要做連續動畫的）
const shop = new Sprite({
  position: {
    x: 650,
    y: 177,
  },
  imageSrc: './img/background/shop_animation.png',
  scale: 2.5,
  frameMax: 6,
});

//設定角色
const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 215,
    y: 155,
  },
  imageSrc: './img/samuraiMack/Idle.png',
  scale: 2.5,
  frameMax: 8,
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      frameMax: 8,
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      frameMax: 8,
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      frameMax: 2,
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      frameMax: 2,
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      frameMax: 6,
    },
    takeHit: {
      imageSrc: './img/samuraiMack/TakeHitWhite.png',
      frameMax: 4,
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      frameMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 155,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: 'blue',
  offset: {
    x: 215,
    y: 170,
  },
  imageSrc: './img/kenji/Idle.png',
  scale: 2.5,
  frameMax: 4,
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      frameMax: 4,
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      frameMax: 8,
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      frameMax: 2,
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      frameMax: 2,
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      frameMax: 4,
    },
    takeHit: {
      imageSrc: './img/kenji/Takehit.png',
      frameMax: 3,
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      frameMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -100,
      y: 50,
    },
    width: 100,
    height: 50,
  },
});

//判定是否有攻擊到
function rectangularCollision(rect1, rect2) {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
    rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

let timer = 60;
let timeId;
const result = document.querySelector('.result');

//判定輸贏
function determineWinner(player, enemy, timeId) {
  clearTimeout(timeId);
  if (player.health === enemy.health) {
    result.innerHTML = 'Tie';
  }
  if (player.health > enemy.health) {
    result.innerHTML = 'Player 1 Win!';
  }
  if (player.health < enemy.health) {
    result.innerHTML = 'Player 2 Win!';
  }
  result.style.display = 'inline-block';
}

//計時

function decreaseTimer() {
  if (timer > 0) {
    timeId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector('.timer').innerHTML = timer;
  }

  if (timer === 0) {
    determineWinner(player, enemy, timeId);
    player.finish = true;
    enemy.finish = true;
  }
}

decreaseTimer();

//移動動畫
function movingAnimation() {
  //重複執行此animation
  window.requestAnimationFrame(movingAnimation);
  //每次畫之前用黑背景蓋掉上一個
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //畫出背景圖、角色
  background.update();
  shop.update();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  //記得每次更新x前要先把速度歸零
  //Play movement
  player.velocity.x = 0;
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5;
    player.switchSprites('run');
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5;
    player.switchSprites('run');
  } else {
    player.switchSprites('idle');
  }
  if (player.velocity.y < 0) {
    player.switchSprites('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprites('fall');
  }

  //Enemy movement
  enemy.velocity.x = 0;
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5;
    enemy.switchSprites('run');
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5;
    enemy.switchSprites('run');
  } else {
    enemy.switchSprites('idle');
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprites('jump');
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprites('fall');
  }

  //設置「攻擊有效」的範圍條件：player武器右端x超過enemy的左端, player武器左端x小於enemy的右端, player武器下端y大於enemy頂端y, player武器上端y小於enemy底端y, player有攻擊（isAttacking）
  if (
    rectangularCollision(player, enemy) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    //使每次攻擊只會算計一次
    player.isAttacking = false;
    enemy.takeHit();
    gsap.to('.health-enemy', {
      width: enemy.health + '%',
    });
  }
  //if attack miss
  if (player.isAttacking && player.framesCurrent === 4) {
    //原先設定為執行攻擊指令後定時取消「正在攻擊」的狀態，改為到指定幀數時就取消
    player.isAttacking = false;
  }

  if (
    rectangularCollision(enemy, player) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    //使每次攻擊只會算計一次
    enemy.isAttacking = false;
    player.takeHit();
    gsap.to('.health-player', {
      width: player.health + '%',
    });
  }
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner(player, enemy, timeId);
  }
}

movingAnimation();

//移動（鍵盤操作）
window.addEventListener('keydown', (e) => {
  if (!player.finish) {
    switch (e.key) {
      //player
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = 'a';
        break;
      case 'w':
        player.velocity.y = -20;
        break;
      case ' ':
        player.attack();
        break;
    }
  }
  if (!enemy.finish) {
    switch (e.key) {
      //enemy
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = 'ArrowLeft';
        break;
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = 'ArrowRight';
        break;
      case 'ArrowUp':
        enemy.velocity.y = -20;
        break;
      case 'ArrowDown':
        enemy.attack();
        break;
    }
  }
});
window.addEventListener('keyup', (e) => {
  //Player
  switch (e.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
  }
  //Enemy
  switch (e.key) {
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
  }
});

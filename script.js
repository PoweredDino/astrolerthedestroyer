/**@type {HTMLCanvasElement} */
console.log("copied from https://www.youtube.com/watch?v=7BHs1BzA4fs&t=35s");
window.addEventListener('load', () => {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;//1500
    canvas.height = 500;

    class InputHandler{
        constructor(jame){
            this.game = jame;
            window.addEventListener('keydown', (e) => {
                if (
                    ((e.key === "ArrowUp") || 
                    (e.key === "ArrowDown")) 
                && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                } else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', (e) => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            })
        }
    }
    class Projectile{
        constructor(jame, x, y){
            this.game = jame;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = projectile;
        }
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8){
                this.markedForDeletion = true;
            }
        }
        draw(ctx){
            ctx.drawImage(this.image, this.x ,this.y);
        }
    }
    class Particle{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = gears;
            this.frameX = Math.floor(Math.random() * 2);
            this.frameY = Math.floor(Math.random() * 2);
            this.spriteSize = 50;
            this.sizeModifier = Math.random() * 0.5 + 0.5;
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
            if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2){
                this.bounced++;
                this.speedY *= -0.9;
            } 
        }
        draw(ctx){
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            ctx.restore();
        }
    }
    class Player{
        constructor(jame){
            this.game = jame;
            this.spriteWidth = 120;
            this.spriteHeight = 190;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = 20;
            this.y = this.game.height/2;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.image = player;
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
            window.addEventListener('click', (e) => {
                window.addEventListener('mousemove',(e) => {
                    if (this.game.keys.includes("ArrowUp") || e.x < window.innerWidth/2 && e.y < window.innerHeight/2) this.moveUp();
                    else if (this.game.keys.includes("ArrowDown") || e.x < window.innerWidth/2 && e.y > window.innerHeight/2) this.moveDown();
                    else this.speedY = 0;
                })
            })
            
            this.y += this.speedY;
            if (this.y > this.game.height - this.height/2) {
                this.y = this.game.height - this.height/2;
            }
            else if (this.y < -this.height/2) {
                this.y = -this.height/2;
            }
            this.projectiles.forEach((a) => {
                a.update();
            });
            this.projectiles = this.projectiles.filter(a => !a.markedForDeletion);

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else{
                this.frameX = 0;
            }
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else{
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }
        draw(ctx){
            if (this.game.debug) ctx.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach((a) => {
                a.draw(ctx);
            });
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height);
        }
        shootTop(){
            if (this.game.ammo > 0) {
                shootSound(this);
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
                this.game.ammo--;
            }
        }
        moveUp(){
            this.speedY = -this.maxSpeed;
        }
        moveDown(){
            this.speedY = this.maxSpeed;
        }
        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            powerUpSound();
            if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
        }
    }
    class Enemy{
        constructor(jame){
            this.game = jame;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 -0.5;
            this.markedForDeletion = false;     
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37; 
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) {
                this.markedForDeletion = true;   
            }
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        draw(ctx){
            if (this.game.debug) {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.fillText(this.lives, this.x, this.y);
            }
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height);
            ctx.font = '20px Helvetica';
        }
    }
    class Anglar1 extends Enemy{
        constructor(jame){
            super(jame);
            this.spriteWidth = 228;
            this.spriteHeight = 169;
            this.width = this.spriteWidth * 1;
            this.height = this.spriteHeight * 1;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = angler1;
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class Anglar2 extends Enemy{
        constructor(jame){
            super(jame);
            this.spriteWidth = 213;
            this.spriteHeight = 165;
            this.width = this.spriteWidth * 1;
            this.height = this.spriteHeight * 1;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = angler2;
            this.frameY = Math.floor(Math.random() * 1);
            this.lives = 6;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy{
        constructor(jame){
            super(jame);
            this.spriteWidth = 99;
            this.spriteHeight = 95;
            this.width = this.spriteWidth * 1;
            this.height = this.spriteHeight * 1;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = lucky;
            this.frameY = Math.floor(Math.random() * 1);
            this.lives = 10;
            this.score = this.lives;
            this.type = 'lucky';
        }
    }
    class HiveWhale extends Enemy{
        constructor(jame){
            super(jame);
            this.spriteWidth = 400;
            this.spriteHeight = 227;
            this.width = this.spriteWidth * 1;
            this.height = this.spriteHeight * 1;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = hivewhale;
            this.frameY = 0;
            this.lives = 20;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }
    class Drone extends Enemy{
        constructor(jame, x, y){
            super(jame);
            this.spriteWidth = 115;
            this.spriteHeight = 95;
            this.width = this.spriteWidth * 1;
            this.height = this.spriteHeight * 1;
            this.x = x;
            this.y = y;
            this.image = drone;
            this.frameY = Math.floor(Math.random() * 1);
            this.lives = 5;
            this.score = this.lives;
            this.type = 'drone';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }
    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if (this.x <= -this.width) {
                this.x = 0;
            }
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(ctx){
            ctx.drawImage(this.image, this.x, this.y);
            ctx.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background{
        constructor(game){
            this.game = game;
            this.image1 = layer1;
            this.image2 = layer2;
            this.image3 = layer3;
            this.image4 = layer4;

            this.layer1 = new Layer(this.game, this.image1, 1);
            this.layer2 = new Layer(this.game, this.image2, 2);
            this.layer3 = new Layer(this.game, this.image3, 2);
            this.layer4 = new Layer(this.game, this.image4, 4);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(ctx){
            this.layers.forEach(layer => layer.draw(ctx));
        }
    }
    class Expolosion{
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width/2;
            this.y = y - this.height/2;
            this.timer = 0;
            this.fps = 15;
            this.interval = 1000/this.fps;
            this.maxFrame = 8;
            this.markedForDeletion = false;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
            }
            else{
                this.timer += deltaTime;
            }
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(ctx){
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0 * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    class SmokeExplosion extends Expolosion{
        constructor(game, x, y){
            super(game, x, y);
            this.image = smokeExplosion;
        }
    }
    class FireExplosion extends Expolosion{
        constructor(game, x, y){
            super(game, x, y);
            this.image = fireExplosion;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width/2;
            this.y = y - this.height/2;
        }
    }
    class UI{
        constructor(jame){
            this.game = jame;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(ctx){
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowColor = 'black';
            ctx.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            ctx.fillText('SCORE: ' + (this.game.winningScore - this.game.score), 20, 40);
            //timer
            const formattedTime = ((this.game.timeLimit - this.game.gameTime) * 0.001).toFixed(1);
            ctx.fillText('Time: ' + formattedTime, 20, 100);
            //message of game over
            if (this.game.gameOver) {
                ctx.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winningScore) {
                    message1 = 'CAPTIVATED!';
                    message2 = 'FINISHED!';
                } else{
                    message1 = 'THAT IS BAD';
                    message2 = 'RELOAD AND TRY AGAIN';
                }
                ctx.font = '50px ' + this.fontFamily;
                ctx.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                ctx.font = '25px ' + this.fontFamily;
                ctx.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            //ammo
            if (this.game.player.powerUp) ctx.fillStyle = 'yellow';
            for (let i = 0; i < this.game.ammo; i++) {
                ctx.fillRect(20 + 5 * i, 50, 3, 20);
            }
            //poweruptimer
            for (let i = 0; i < Math.floor(this.game.player.powerUpLimit - this.game.player.powerUpTimer)/1000; i++) {
                if (this.game.player.powerUp) {
                    ctx.fillText("POWER UP TIMING:", 20, 130);
                    ctx.fillRect(20 + 5 * i, 140, 6, 20);
                }
            }
            ctx.restore();
        }
    }
    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.paricles = [];
            this.explosions = [];
            this.enemyTimer = 0;
            this.fORMATTED_ENEMY_INTERVAL = Math.random() * 2000 + 1000;
            this.enemyInterval = this.fORMATTED_ENEMY_INTERVAL;
            this.maxAmmo = 20;
            this.ammo = 75;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 500;
            this.gameTime = 0;
            this.timeLimit = 100000;
            this.speed = 1;
            this.debug = false;
        }
        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else{
                this.ammoTimer += deltaTime;
            }
            this.paricles.forEach(particle => particle.update());
            this.paricles = this.paricles.filter(particle => !particle.markedForDeletion);

            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);

            this.enemies.forEach((enemy) => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    enemyDestroySound();
                    this.addExplosion(enemy);
                    for (let i = 0; i < enemy.score; i++) {
                        this.paricles.push(new Particle(this, enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                    }
                    if(!this.gameOver) this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        this.paricles.push(new Particle(this, enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                        if (enemy.lives <= 0) {
                            for (let i = 0; i < enemy.score; i++) {
                                this.paricles.push(new Particle(this, enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                            }
                            enemy.markedForDeletion = true;
                            enemyDestroySound();
                            this.addExplosion(enemy);
                            if (enemy.type === 'hive') {
                                for (let i = 0; i < 5; i++) {
                                    this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height/2));
                                }
                            }
                            else if (enemy.type === 'lucky') this.player.enterPowerUp();
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
                this.fORMATTED_ENEMY_INTERVAL = Math.random() * 2000 + 1000;
            } else{
                this.enemyTimer += deltaTime;
            }
        }
        draw(ctx){
            this.background.draw(ctx);
            this.UI.draw(ctx);
            this.player.draw(ctx);
            this.paricles.forEach(particle => particle.draw(ctx));
            this.enemies.forEach((enemy) => {
                enemy.draw(ctx);
            });
            this.explosions.forEach((explosion) => {
                explosion.draw(ctx);
            });
            this.background.layer4.draw(ctx);
        }
        addEnemy(){
            const randomEnemy = Math.random();
            if (randomEnemy < 0.3) this.enemies.push(new Anglar1(this));
            else if (randomEnemy < 0.6) this.enemies.push(new Anglar2(this));
            else if (randomEnemy < 0.7) this.enemies.push(new HiveWhale(this));
            else this.enemies.push(new LuckyFish(this));
        }
        addExplosion(enemy){
            const randomize = Math.random();
            if (randomize < 0.5) {
                this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width/2, enemy.y + enemy.height/2));
            }
            else{
                this.explosions.push(new FireExplosion(this, enemy.x + enemy.width/2, enemy.y + enemy.height/2));
            }
        }
        checkCollision(rect1, rect2){
            return(
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
    //MUSICS
    function shootSound(player) {
        let a;
        if (player.powerUp) {
            a = new Audio("musics/POWER_SHOOT.mp3");
        } else{
            a = new Audio("musics/SHOOT.mp3");
        }
        a.play();
    }
    function enemyDestroySound() {
        let a = Math.random();
        let b;
        if (a < 0.5){
            b = new Audio("musics/ENEMY_DESTROY_1.mp3");
        } else{
            b = new Audio("musics/ENEMY_DESTROY_2.mp3");
        }
        b.play();
    }
    function powerUpSound() {
        let a = new Audio("musics/POWERUP.mp3");
        a.play();
    }
    //phones
    window.addEventListener('click', (e) => {
        if (e.x > window.innerWidth/2) {
            game.player.shootTop();
        }
        //console.log('x: ' + e.x + ' y: ' + e.y + ' width: ' + window.innerWidth + ' height: ' + window.innerHeight);
    });
})

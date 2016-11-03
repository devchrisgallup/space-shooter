var game = new Phaser.Game(800, 600, Phaser.AUTO, 'spaceremix', { preload: preload, create: create, update: update });
var spacefield;
var player;
var cursors;
var bullets;
var bulletTime = 0;
var bulletText; 
var fireButton; 
var score = 0; 
var scoreText;
var winText;
var lives = 3; 
var liveText;
var loseText;
var win = false; 
var levels = 1;  
var bulletCount = 75;
var shipCount = 0; 
var enemies; 
var enemyBullets; 
var enemyBulletTime = 0; 
var livingEnemies = [];
function preload() {
    game.load.image("starfield","assets/starfield.png");
    game.load.image("starfieldlevel2", "assets/starfieldlevel2.png"); 
    game.load.image('player', "assets/spaceship.png");
    game.load.image('bullet', "assets/bullet.png");
    game.load.image('enemy', "assets/enemy.png");
}
function create() {
    spacefield = game.add.tileSprite(0,0,800,600,'starfield');
    player = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'player');
    game.physics.enable(player,Phaser.Physics.ARCADE);
    // keeps player from going offscreen  
    player.body.collideWorldBounds=true;
    cursors = game.input.keyboard.createCursorKeys(); 
    // creates bullets
    bullets = game.add.group();
    bullets.enableBody = true; 
    bullets.physicsBodyType = Phaser.Physics.ARCADE; 
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    // creates enemy bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true; 
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE; 
    enemyBullets.createMultiple(30, 'bullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    // assign spacebar key to fireButton
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    enemies = game.add.group(); 
    enemies.enableBody = true; 
    game.physics.enable(enemies,Phaser.Physics.ARCADE);
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    // passes 3 to createEnemies function 
    // to create 30 enemy ships
    createEnemies(3); 
    // text to be used in the game
    scoreText = game.add.text(0,550,"Score: ", {font: '32px Arial', fill:  '#fff'});
    liveText = game.add.text(422,550,"Lives: ", {font: '32px Arial', fill:  '#fff'});
    bulletText = game.add.text(222,550,"Ammo: ", {font: '32px Arial', fill:  '#fff'});
    winText = game.add.text(300,250, "You Win!",{font: '32px Arial', fill:  '#fff'});
    winText.visible = false;
    loseText = game.add.text(300,150, "You Lose!",{font: '32px Arial', fill:  '#fff'});
    loseText.visible = false;
}
function update() {
    game.physics.arcade.overlap(bullets,enemies,collisionHandler,null,this);
    game.physics.arcade.overlap(enemies,player,collisionHandlerPlayer,null,this);
    game.physics.arcade.overlap(player,enemyBullets,collisionHandlerEnemyBulletAndPlayer,null,this);
    player.body.velocity.x = 0; 
    // scrolls the background
    spacefield.tilePosition.y += 2; 
    // controls
    if(cursors.left.isDown) {
        player.body.velocity.x = -350;
    }
    if(cursors.right.isDown) {
        player.body.velocity.x = 350;
    }
    if(fireButton.isDown) {
        fireBullet(); 
    }
    // Text that appears at the bottom of the screen 
    scoreText.text = "Score: " + score;
    bulletText.text = "Ammo: " + bulletCount; 
    liveText.text = "Lives: " + lives;
    // checks for a win
    if(shipCount == 0 && bulletCount > 0) { 
        winText.visible = true;
        win = true; 
        levels = levels + 1;  
        level();  
    }
    // checks if player has any lives left
    if(lives === 0 || bulletCount === 0) {
        loseText.visible = true;
        player.kill();
        setTimeout(function() {
            player.kill();
        }, 1990);
    }
    fireEnemyBullet(); 
}
function fireBullet() {
    if(bulletCount > 0) {
        if(game.time.now > bulletTime) { 
            bullet = bullets.getFirstExists(false); 
            if(bullet) {
                bullet.reset(player.x + 11, player.y);
                bullet.body.velocity.y = -400;
                bulletTime = game.time.now + 200;
                bulletCount--;
                }
            }
    } else {
        if (lives > 0) {
            lives--;
            bulletCount = 75;
        }
    }
}
// fires enemy bullets
function fireEnemyBullet() {
    livingEnemies.length = 0; 
    enemies.forEachAlive(function(enemy){
        livingEnemies.push(enemy)
    });

    if(game.time.now > enemyBulletTime) { 
        enemyBullet = enemyBullets.getFirstExists(false); 
        if(enemyBullet && livingEnemies.length > 0) {
            var random = game.rnd.integerInRange(0, livingEnemies.length - 1);
            var shooter = livingEnemies[random];
            enemyBullet.reset(shooter.body.x, shooter.body.y + 30);
            enemyBulletTime = game.time.now + 500;
            game.physics.arcade.moveToObject(enemyBullet,player,600);
        }
    } 
}
// creates enemies according to the number
// passed to the function.
// number passed times 10 is the expected enemy count
function createEnemies(count) {
    for(var y = 0; y < count; y++) {
        for(var x = 0; x < 10; x++) {
            var enemy = enemies.create(x*48,y*50,'enemy');
            enemy.anchor.setTo(0.5,0.5);
            enemy.body.moves = false;
            shipCount = shipCount + 1; 
        }
    }
    enemies.x = 100; 
    enemies.y = 50; 
    //  moving the group, rather than individually.
    var tween = game.add.tween(enemies).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 10000, true);
    tween.onLoop.add(descend, this);
}
function descend() {
    enemies.y += 10;
}
function collisionHandler(bullet,enemy) {
    bullet.kill();
    enemy.kill();
    score += 100;
    shipCount = shipCount - 1; 
}
function collisionHandlerPlayer(player,enemy) {
    enemy.kill(); 
    enemies.x = 100; 
    enemies.y = 50; 
    score = 0; 
    if (lives > 0) {
        lives = lives - 1;
    }
}
function collisionHandlerEnemyBulletAndPlayer(player, enemyBullet) {
    if (lives > 0) {
        lives = lives - 1;
        player.kill();
        setTimeout(function() {
            player.reset(game.world.centerX, game.world.centerY + 200, false);
        }, 2000);
    }
}
// recreates level if player has a win
function resetLevel2() {
    player = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'player');
    game.physics.enable(player,Phaser.Physics.ARCADE);
    player.body.collideWorldBounds=true;
    cursors = game.input.keyboard.createCursorKeys(); 
    bullets = game.add.group();
    bullets.enableBody = true; 
    bullets.physicsBodyType = Phaser.Physics.ARCADE; 
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    enemies = game.add.group(); 
    enemies.enableBody = true; 
    game.physics.enable(enemies,Phaser.Physics.ARCADE);
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    createEnemies(4); 
    scoreText = game.add.text(0,550,"Score: ", {font: '32px Arial', fill:  '#fff'});
    liveText = game.add.text(422,550,"Lives: ", {font: '32px Arial', fill:  '#fff'});
    bulletText = game.add.text(222,550,"Ammo: ", {font: '32px Arial', fill:  '#fff'});
    winText = game.add.text(300,250, "You Win!",{font: '32px Arial', fill:  '#fff'});
    winText.visible = false;
    loseText = game.add.text(300,150, "You Lose!",{font: '32px Arial', fill:  '#fff'});
    loseText.visible = false;
    // add to bulletCount for 
    // next level
    bulletCount = bulletCount + 50;
    // reset win flag
    win = false;   
}
// if player has a win reset level
function level() {
    if (levels == 2) { 
        // reassigns the background image for level 2
        spacefield = game.add.tileSprite(0,0,800,600,'starfieldlevel2');
        resetLevel2();
    }
}

describe("AITeammateController", function () {
  it("moves toward nearest enemy", function () {
    var eventManager = new EventManager();
    var container = new SpriteContainer(eventManager);
    var tank = new Tank(eventManager);
    tank.setPosition(new Point(200, 200));
    var controller = new AITeammateController(tank, new Random(), container);
    
    // enemy above the teammate
    var enemy = new Tank(eventManager);
    enemy.makeEnemy();
    enemy.setPosition(new Point(200, 100));
    container.addSprite(enemy);
    
    controller._directionTimer = 999;
    controller._random = {getNumber: function () { return 0; }};
    controller.updateDirection();
    expect(tank.getDirection()).toEqual(Sprite.Direction.UP);
  });
  
  it("shoots when enemy is in facing direction", function () {
    var eventManager = new EventManager();
    var container = new SpriteContainer(eventManager);
    var tank = new Tank(eventManager);
    tank.setPosition(new Point(200, 200));
    tank.setDirection(Sprite.Direction.UP);
    var controller = new AITeammateController(tank, new Random(), container);
    
    var enemy = new Tank(eventManager);
    enemy.makeEnemy();
    enemy.setPosition(new Point(200, 100));
    container.addSprite(enemy);
    
    var shot = 0;
    tank.shoot = function () { shot++; };
    controller._shootTimer = 999;
    controller.updateShoot();
    expect(shot).toEqual(1);
  });
});

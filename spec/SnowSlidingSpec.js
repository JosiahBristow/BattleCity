describe("Sprite sliding (snow)", function () {
  it("tank on snow slides after beginSlide", function () {
    var eventManager = new EventManager();
    var container = new SpriteContainer(eventManager);
    
    var tank = new Tank(eventManager);
    tank.setSpriteContainer(container);
    tank.setPosition(new Point(32, 32));
    tank.setNormalSpeed(2);
    tank.toNormalSpeed();
    tank.setDirection(Sprite.Direction.RIGHT);
    
    var snow = new Snow(eventManager);
    snow.setPosition(new Point(32, 32));
    container.addSprite(snow);
    
    expect(tank.isOnSnow()).toBeTruthy();
    tank.beginSlide();
    expect(tank._sliding).toBeTruthy();
    
    var x0 = tank.getX();
    for (var i = 0; i < 20; ++i) {
      tank.update();
    }
    expect(tank.getX()).toBeGreaterThan(x0);
    expect(tank._sliding).toBeFalsy();
  });
  
  it("tank not on snow does not slide via controller", function () {
    var eventManager = new EventManager();
    var container = new SpriteContainer(eventManager);
    
    var tank = new Tank(eventManager);
    tank.setSpriteContainer(container);
    tank.setPosition(new Point(200, 200));
    tank.setNormalSpeed(2);
    tank.toNormalSpeed();
    tank.setDirection(Sprite.Direction.RIGHT);
    
    var controller = new TankController(eventManager, tank,
      {left: Keyboard.Key.A, right: Keyboard.Key.D, up: Keyboard.Key.W, down: Keyboard.Key.S},
      Keyboard.Key.J);
    
    expect(tank.isOnSnow()).toBeFalsy();
    controller.keyReleased(Keyboard.Key.D);
    expect(tank._sliding).toBeFalsy();
    expect(tank.getSpeed()).toEqual(0);
    var x0 = tank.getX();
    for (var i = 0; i < 20; ++i) {
      tank.update();
    }
    expect(tank.getX()).toEqual(x0);
  });
});

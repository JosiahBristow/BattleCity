describe("PlayerTankFactory", function () {
  it("should subscribe", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var factory = new PlayerTankFactory(eventManager);
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(factory, [TankExplosion.Event.DESTROYED]);
  });
  
  describe("#notify", function () {
    it("TankExplosion.Event.DESTROYED - own player tank", function () {
      var eventManager = new EventManager();
      var factory = new PlayerTankFactory(eventManager, 1);
      spyOn(factory, 'create');
      var tank = new Tank(eventManager);
      tank.setType(Tank.Type.PLAYER_1);
      var explosion = new TankExplosion(eventManager, tank);
      factory.notify({'name': TankExplosion.Event.DESTROYED, 'explosion': explosion});
      expect(factory.create).toHaveBeenCalled();
    });
    
    it("TankExplosion.Event.DESTROYED - other player tank", function () {
      var eventManager = new EventManager();
      var factory = new PlayerTankFactory(eventManager, 1);
      spyOn(factory, 'create');
      var tank = new Tank(eventManager);
      tank.setType(Tank.Type.PLAYER_2);
      var explosion = new TankExplosion(eventManager, tank);
      factory.notify({'name': TankExplosion.Event.DESTROYED, 'explosion': explosion});
      expect(factory.create).not.toHaveBeenCalled();
    });
    
    it("TankExplosion.Event.DESTROYED - enemy tank", function () {
      var eventManager = new EventManager();
      var factory = new PlayerTankFactory(eventManager, 1);
      spyOn(factory, 'create');
      var tank = new Tank(eventManager);
      tank.makeEnemy();
      var explosion = new TankExplosion(eventManager, tank);
      factory.notify({'name': TankExplosion.Event.DESTROYED, 'explosion': explosion});
      expect(factory.create).not.toHaveBeenCalled();
    });
  });
  
  it("#create", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'fireEvent');
    var factory = new PlayerTankFactory(eventManager);
    factory.setAppearPosition(new Point(1,2));
      
    var tank = new Tank(eventManager);
    tank.setPosition(new Point(1,2));
    tank.setState(new TankStateAppearing(tank));
    
    var product = factory.create();
    expect(product).toEqual(tank);
    expect(product.getType()).toEqual(Tank.Type.PLAYER_1);
    expect(eventManager.fireEvent).toHaveBeenCalledWith({'name': PlayerTankFactory.Event.PLAYER_TANK_CREATED, 'tank': tank, 'playerNumber': 1});
  });
  
  it("#create - player 2", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'fireEvent');
    var factory = new PlayerTankFactory(eventManager, 2);
    factory.setAppearPosition(new Point(1,2));
    var product = factory.create();
    expect(product.getType()).toEqual(Tank.Type.PLAYER_2);
    expect(eventManager.fireEvent).toHaveBeenCalledWith({'name': PlayerTankFactory.Event.PLAYER_TANK_CREATED, 'tank': product, 'playerNumber': 2});
  });
});

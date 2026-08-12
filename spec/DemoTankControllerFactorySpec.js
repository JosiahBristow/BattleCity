describe("DemoTankControllerFactory", function () {
  it("creates a DemoTankController when player tank is created", function () {
    var eventManager = new EventManager();
    var factory = new DemoTankControllerFactory(eventManager, 1);
    var tank = new Tank(eventManager);
    spyOn(window, 'DemoTankController').andReturn({update: function(){}});

    eventManager.fireEvent({
      name: PlayerTankFactory.Event.PLAYER_TANK_CREATED,
      tank: tank,
      playerNumber: 1
    });

    expect(DemoTankController).toHaveBeenCalledWith(tank);
  });

  it("does not create a controller for non-matching player number", function () {
    var eventManager = new EventManager();
    var factory = new DemoTankControllerFactory(eventManager, 1);
    var tank = new Tank(eventManager);
    spyOn(window, 'DemoTankController').andReturn({update: function(){}});

    eventManager.fireEvent({
      name: PlayerTankFactory.Event.PLAYER_TANK_CREATED,
      tank: tank,
      playerNumber: 2
    });

    expect(DemoTankController).not.toHaveBeenCalled();
  });
});

describe("DemoTankController", function () {
  var eventManager;
  var tank;
  var random;
  var controller;

  beforeEach(function () {
    eventManager = new EventManager();
    tank = new Tank(eventManager);
    random = new Random();
    controller = new DemoTankController(tank, random);
  });

  it("does not respond to keyboard events", function () {
    spyOn(tank, 'setDirection');
    controller.notify({name: Keyboard.Event.KEY_PRESSED, key: Keyboard.Key.LEFT});
    expect(tank.setDirection).not.toHaveBeenCalled();
  });

  describe("update", function () {
    it("changes direction after interval", function () {
      spyOn(tank, 'setDirection');
      spyOn(random, 'getNumber').andReturn(0.1);
      for (var i = 0; i < 31; i++) {
        controller.update();
      }
      expect(tank.setDirection).toHaveBeenCalled();
    });

    it("shoots after interval", function () {
      spyOn(tank, 'shoot');
      spyOn(random, 'getNumber').andReturn(0.1);
      for (var i = 0; i < 21; i++) {
        controller.update();
      }
      expect(tank.shoot).toHaveBeenCalled();
    });

    it("does not change direction before interval", function () {
      spyOn(tank, 'setDirection');
      for (var i = 0; i < 29; i++) {
        controller.update();
      }
      expect(tank.setDirection).not.toHaveBeenCalled();
    });

    it("does not shoot before interval", function () {
      spyOn(tank, 'shoot');
      for (var i = 0; i < 19; i++) {
        controller.update();
      }
      expect(tank.shoot).not.toHaveBeenCalled();
    });
  });
});

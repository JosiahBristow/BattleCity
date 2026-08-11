describe("CheatScene", function () {
  beforeEach(function () {
    Cheat.reset();
  });
  
  it("subscribe", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var scene = new CheatScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED]);
  });
  
  describe("#keyPressed", function () {
    it("DOWN - next option", function () {
      var eventManager = new EventManager();
      var scene = new CheatScene(new SceneManager(eventManager));
      scene.setCurrent(0);
      scene.keyPressed(Keyboard.Key.DOWN);
      expect(scene.getCurrent()).toEqual(1);
    });
    
    it("UP - prev option", function () {
      var eventManager = new EventManager();
      var scene = new CheatScene(new SceneManager(eventManager));
      scene.setCurrent(1);
      scene.keyPressed(Keyboard.Key.UP);
      expect(scene.getCurrent()).toEqual(0);
    });
    
    it("J - toggle current", function () {
      var eventManager = new EventManager();
      var scene = new CheatScene(new SceneManager(eventManager));
      scene.setCurrent(0);
      expect(Cheat.invincible).toBeFalsy();
      scene.keyPressed(Keyboard.Key.J);
      expect(Cheat.invincible).toBeTruthy();
      scene.keyPressed(Keyboard.Key.J);
      expect(Cheat.invincible).toBeFalsy();
    });
    
    it("ESC - go back", function () {
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new CheatScene(sceneManager);
      spyOn(sceneManager, 'toMoreScene');
      scene.keyPressed(Keyboard.Key.ESC);
      expect(sceneManager.toMoreScene).toHaveBeenCalled();
    });
  });
});

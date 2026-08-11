describe("StageSelectScene", function () {
  it("subscribe", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var scene = new StageSelectScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  });
  
  describe("#keyPressed", function () {
    it("RIGHT - next stage", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(2);
      scene.keyPressed(Keyboard.Key.RIGHT);
      expect(scene.getStage()).toEqual(3);
    });
    
    it("LEFT - prev stage", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(2);
      scene.keyPressed(Keyboard.Key.LEFT);
      expect(scene.getStage()).toEqual(1);
    });
    
    it("wraps to last stage when going below 1", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(1);
      scene.keyPressed(Keyboard.Key.LEFT);
      expect(scene.getStage()).toEqual(scene._stageCount);
    });
    
    it("wraps to first stage when going above count", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(scene._stageCount);
      scene.keyPressed(Keyboard.Key.RIGHT);
      expect(scene.getStage()).toEqual(1);
    });
    
    it("W - prev stage", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(2);
      scene.keyPressed(Keyboard.Key.W);
      expect(scene.getStage()).toEqual(1);
    });
    
    it("S - next stage", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(2);
      scene.keyPressed(Keyboard.Key.S);
      expect(scene.getStage()).toEqual(3);
    });
    
    it("START - go to stage player scene", function () {
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageSelectScene(sceneManager);
      spyOn(sceneManager, 'toStagePlayerScene');
      scene.setStage(5);
      scene.keyPressed(Keyboard.Key.START);
      expect(sceneManager.toStagePlayerScene).toHaveBeenCalledWith(5);
    });
    
    it("ESC - go back to more scene", function () {
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageSelectScene(sceneManager);
      spyOn(sceneManager, 'toMoreScene');
      scene.keyPressed(Keyboard.Key.ESC);
      expect(sceneManager.toMoreScene).toHaveBeenCalled();
    });
  });
  
  describe("hold to scroll", function () {
    it("holding RIGHT advances repeatedly on update", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(1);
      scene.keyPressed(Keyboard.Key.RIGHT);
      scene._holdDelay = 2;
      for (var i = 0; i < 20; ++i) {
        scene.update();
      }
      expect(scene.getStage()).toBeGreaterThan(2);
    });
    
    it("releasing RIGHT stops scrolling", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(1);
      scene.keyPressed(Keyboard.Key.RIGHT);
      scene.keyReleased(Keyboard.Key.RIGHT);
      var stageBefore = scene.getStage();
      for (var i = 0; i < 20; ++i) {
        scene.update();
      }
      expect(scene.getStage()).toEqual(stageBefore);
    });
  });
  
  describe("number jump", function () {
    it("single digit jump", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.keyPressed(53); // digit '5'
      expect(scene.getStage()).toEqual(5);
    });
    
    it("two digit jump", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.keyPressed(51); // '3'
      scene.keyPressed(53); // '5'
      expect(scene.getStage()).toEqual(35);
    });
    
    it("single digit beyond 9 applies immediately", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      scene.setStage(1);
      scene.keyPressed(57); // '9' -> 9*10 > 35, applies immediately
      expect(scene.getStage()).toEqual(9);
    });
  });
  
  describe("#_parseMap", function () {
    it("parses map string into sprites", function () {
      var eventManager = new EventManager();
      var scene = new StageSelectScene(new SceneManager(eventManager));
      var sprites = scene._parseMap("BrickWall(64,48);Base(224,400);Water(96,176)");
      expect(sprites.length).toEqual(3);
      expect(sprites[0].image).toEqual('wall_brick');
      expect(sprites[0].x).toEqual(64);
      expect(sprites[1].image).toEqual('base');
      expect(sprites[2].image).toEqual('water_1');
    });
  });
});

describe("StageListScene", function () {
  it("subscribes to keyboard events", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var scene = new StageListScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  });

  describe("pagination", function () {
    it("starts on page 1", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      expect(scene._page).toEqual(1);
    });

    it("next page increments page", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._tab = 'default';
      scene._nextPage();
      expect(scene._page).toEqual(2);
    });

    it("prev page decrements page", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._tab = 'default';
      scene._page = 2;
      scene._prevPage();
      expect(scene._page).toEqual(1);
    });

    it("page does not go below 1", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._prevPage();
      expect(scene._page).toEqual(1);
    });

    it("page does not exceed max page", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._tab = 'default';
      var maxPage = scene._getMaxPage();
      scene._page = maxPage;
      scene._nextPage();
      expect(scene._page).toEqual(maxPage);
    });
  });

  describe("tabs", function () {
    it("switches tab to custom", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._switchTab('custom');
      expect(scene._tab).toEqual('custom');
    });

    it("resets page when switching tabs", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._page = 3;
      scene._switchTab('custom');
      expect(scene._page).toEqual(1);
    });
  });

  describe("stage conversion", function () {
    it("converts raw stage config to internal format", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      var raw = {
        name: 'test',
        custom: true,
        difficulty: 2,
        map: [
          'B1  X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   E  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  ',
          'X   X   X   X   X   X   X   X   X   X   X   X   X  '
        ],
        bots: ['2*basic', '1*fast']
      };
      var stage = scene._rawToStage(raw);
      expect(stage.name).toEqual('test');
      expect(stage.custom).toEqual(true);
      expect(stage.difficulty).toEqual(2);
      expect(stage.tanks.length).toEqual(3);
      expect(stage.tanks[0]).toEqual(Tank.Type.BASIC);
      expect(stage.map.indexOf('BrickWall(32,16)') !== -1).toEqual(true);
    });

    it("converts internal stage to raw format", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      var stage = {
        name: 'TEST',
        custom: true,
        difficulty: 1,
        map: 'BrickWall(32,16);Base(224,400)',
        tanks: [Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.FAST]
      };
      var raw = scene._stageToRaw(stage);
      expect(raw.name).toEqual('test');
      expect(raw.custom).toEqual(true);
      expect(raw.difficulty).toEqual(1);
      expect(raw.bots).toContain('2*basic');
      expect(raw.bots).toContain('1*fast');
      expect(raw.map[0].indexOf('B1') !== -1).toEqual(true);
      expect(raw.map[12].indexOf('E') !== -1).toEqual(true);
    });
  });

  describe("keyboard", function () {
    it("RIGHT goes to next page", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._tab = 'default';
      scene.keyPressed(Keyboard.Key.RIGHT);
      expect(scene._page).toEqual(2);
    });

    it("LEFT goes to previous page", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._tab = 'default';
      scene._page = 2;
      scene.keyPressed(Keyboard.Key.LEFT);
      expect(scene._page).toEqual(1);
    });

    it("TAB switches tabs", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene.keyPressed(Keyboard.Key.TAB);
      expect(scene._tab).toEqual('custom');
    });

    it("ESC goes back to more scene", function () {
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageListScene(sceneManager);
      spyOn(sceneManager, 'toMoreScene');
      scene.keyPressed(Keyboard.Key.ESC);
      expect(sceneManager.toMoreScene).toHaveBeenCalled();
    });
  });
});

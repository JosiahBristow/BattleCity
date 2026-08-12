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

  describe("unified stage actions", function () {
    beforeEach(function () {
      MapStorage.maps = null;
      MapStorage.currentMap = null;
      try {
        localStorage.removeItem(MapStorage.STORAGE_KEY);
      }
      catch (e) {}
    });

    it("AI play launches a 3-player game for a custom stage", function () {
      MapStorage.saveStage('TEST', 'Base(224,400)');
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageListScene(sceneManager);
      spyOn(sceneManager, 'toGameScene');
      scene._tab = 'custom';
      scene._playStage(scene._getCustomStages()[0], 3);
      expect(sceneManager.toGameScene).toHaveBeenCalledWith(1, undefined, 3, jasmine.any(Object));
    });

    it("rename opens the rename scene and selects the map", function () {
      MapStorage.saveStage('TEST', 'Base(224,400)');
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageListScene(sceneManager);
      spyOn(sceneManager, 'toMapRenameScene');
      var stage = {custom: true, name: 'TEST'};
      scene._renameStage(stage);
      expect(sceneManager.toMapRenameScene).toHaveBeenCalledWith(0, 'toStageListScene');
      expect(sceneManager.toMapRenameScene).toHaveBeenCalled();
    });

    it("rename ignores default stages", function () {
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageListScene(sceneManager);
      spyOn(sceneManager, 'toMapRenameScene');
      scene._renameStage({custom: false});
      expect(sceneManager.toMapRenameScene).not.toHaveBeenCalled();
    });

    it("edit opens the editor with back to the list", function () {
      MapStorage.saveStage('TEST', 'Base(224,400)');
      var eventManager = new EventManager();
      var sceneManager = new SceneManager(eventManager);
      var scene = new StageListScene(sceneManager);
      spyOn(sceneManager, 'toAdvancedEditorScene');
      scene._editStage({custom: true, name: 'TEST'});
      expect(sceneManager.toAdvancedEditorScene).toHaveBeenCalledWith('toStageListScene');
    });
  });

  describe("fc93 pixel layout", function () {
    it("uses a 480px canvas to fit the hint row", function () {
      expect(Globals.CANVAS_HEIGHT).toEqual(480);
    });

    it("uses fc93 grid metrics", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      expect(scene._previewSize).toEqual(104);
      expect(scene._gap).toEqual(50);
      expect(scene._len).toEqual(154);
      expect(scene._rowHeight).toEqual(140);
      expect(scene._btnB).toEqual(16);
      expect(scene._cols).toEqual(3);
      expect(scene._stagesPerPage).toEqual(6);
    });

    it("provides pixel glyphs for the button-row icons", function () {
      expect(EditorFont.chars['\u2170']).toBeTruthy();
      expect(EditorFont.chars['\u2171']).toBeTruthy();
      expect(EditorFont.chars['\u2190']).toBeTruthy();
      expect(EditorFont.chars['\u2192']).toBeTruthy();
      expect(EditorFont.chars['\u2193']).toBeTruthy();
    });

    function makeCtx() {
      return {
        fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '',
        textBaseline: 'alphabetic',
        canvas: {width: Globals.CANVAS_WIDTH, height: Globals.CANVAS_HEIGHT},
        measureText: function (text) { return {width: String(text).length * 8}; },
        fillRect: function () {}, strokeRect: function () {}, clearRect: function () {},
        beginPath: function () {}, closePath: function () {}, moveTo: function () {},
        lineTo: function () {}, arc: function () {}, rect: function () {},
        stroke: function () {}, fill: function () {},
        drawImage: function () {},
        save: function () {}, restore: function () {}, translate: function () {},
        scale: function () {}, rotate: function () {},
        setLineDash: function () {}, setTransform: function () {}, transform: function () {},
        createLinearGradient: function () { return {addColorStop: function () {}}; }
      };
    }

    it("lays the half-size button row at the fc93 anchors", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._drawStage(makeCtx(), {name: '1', custom: false, map: 'Base(224,400)'}, 50, 80);
      var clickables = scene._clickables;
      expect(clickables.length).toEqual(5);
      var xs = [46, 62, 78, 94, 142];
      var widths = [16, 16, 24, 16, 16];
      for (var i = 0; i < clickables.length; ++i) {
        expect(clickables[i].x).toEqual(xs[i]);
        expect(clickables[i].y).toEqual(190);
        expect(clickables[i].w).toEqual(widths[i]);
        expect(clickables[i].h).toEqual(12);
      }
      expect(clickables[3].disabled).toEqual(true);
      expect(clickables[4].disabled).toEqual(false);
    });

    it("adds rename and delete buttons for custom stages", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      scene._drawStage(makeCtx(), {name: 'M', custom: true, map: 'Base(224,400)'}, 50, 80);
      var clickables = scene._clickables;
      expect(clickables.length).toEqual(7);
      var xs = [46, 62, 78, 94, 110, 126, 142];
      var widths = [16, 16, 24, 16, 16, 16, 16];
      for (var i = 0; i < clickables.length; ++i) {
        expect(clickables[i].x).toEqual(xs[i]);
        expect(clickables[i].y).toEqual(190);
        expect(clickables[i].w).toEqual(widths[i]);
        expect(clickables[i].h).toEqual(12);
      }
      expect(clickables[3].disabled).toEqual(false);
    });

    it("draws the empty-custom message at the fc93 position", function () {
      var scene = new StageListScene(new SceneManager(new EventManager()));
      spyOn(EditorFont, 'draw').andCallThrough();
      scene._tab = 'custom';
      scene._page = 1;
      MapStorage.maps = [];
      scene._drawGrid(makeCtx());
      var call = EditorFont.draw.mostRecentCall;
      expect(call.args[1]).toEqual('NO CUSTOM STAGE');
      expect(call.args[2]).toEqual(16);
      expect(call.args[3]).toEqual(96);
    });
  });
});

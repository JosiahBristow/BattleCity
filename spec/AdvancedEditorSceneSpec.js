describe("AdvancedEditorScene", function () {
  beforeEach(function () {
    MapStorage.maps = null;
    MapStorage.currentMap = null;
    try {
      localStorage.removeItem(MapStorage.STORAGE_KEY);
    }
    catch (e) {}
  });
  
  it("subscribes to key presses", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var scene = new AdvancedEditorScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED]);
  });
  
  describe("#_paint", function () {
    it("places brick with full hex", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._paint(6 * 13 + 6);
      var cell = scene.getGrid()[6][6];
      expect(cell.type).toEqual(Editor.Structure.BRICK);
      expect(cell.hex).toEqual(0xf);
    });
    
    it("only one base exists after painting eagle", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('E');
      scene._paint(0);
      var count = 0;
      for (var r = 0; r < 13; ++r) {
        for (var c = 0; c < 13; ++c) {
          if (scene.getGrid()[r][c].type == Editor.Structure.BASE) {
            count++;
          }
        }
      }
      expect(count).toEqual(1);
      expect(scene.getGrid()[0][0].type).toEqual(Editor.Structure.BASE);
    });
  });
  
  describe("#setView / getView", function () {
    it("switches between map and config", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      expect(scene.getView()).toEqual('map');
      scene.setView('config');
      expect(scene.getView()).toEqual('config');
    });
  });
  
  describe("#_save", function () {
    it("saves map with tanks", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene._save();
      expect(MapStorage.getCount()).toEqual(1);
      var saved = MapStorage.getMap(0);
      expect(saved.map).toContain('Base');
      expect(Array.isArray(saved.tanks)).toBeTruthy();
    });
  });
  
  describe("keyboard cursor", function () {
    it("moves cursor with arrows and paints with space", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.keyPressed(Keyboard.Key.DOWN);
      scene.keyPressed(Keyboard.Key.RIGHT);
      scene.setItemType('B');
      scene.keyPressed(Keyboard.Key.SPACE);
      var cell = scene.getGrid()[7][7];
      expect(cell.type).toEqual(Editor.Structure.BRICK);
    });
  });
  
  describe("new map", function () {
    it("N key resets to default grid", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._paint(0);
      scene.keyPressed(Keyboard.Key.N);
      expect(scene.getGrid()[0][0].type).toEqual(Editor.Structure.CLEAR);
      expect(scene.getGrid()[12][6].type).toEqual(Editor.Structure.BASE);
    });
  });
  
  describe("spawn positions", function () {
    it("places P1 and P2 spawn markers", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('P1');
      scene._paint(2);
      scene.setItemType('P2');
      scene._paint(3);
      expect(scene.getGrid()[0][2].type).toEqual(Editor.Structure.SPAWN1);
      expect(scene.getGrid()[0][3].type).toEqual(Editor.Structure.SPAWN2);
    });
    
    it("only one P1 exists", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('P1');
      scene._paint(2);
      scene._paint(5);
      var count = 0;
      for (var r = 0; r < 13; ++r) {
        for (var c = 0; c < 13; ++c) {
          if (scene.getGrid()[r][c].type == Editor.Structure.SPAWN1) count++;
        }
      }
      expect(count).toEqual(1);
    });
  });
  
  describe("hex shape", function () {
    it("toggles brick quadrants with Q/E/Z/X", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.keyPressed(Keyboard.Key.Q);
      expect(scene._brickHex).toEqual(0xe);
      scene.keyPressed(Keyboard.Key.E);
      expect(scene._brickHex).toEqual(0xc);
      scene.keyPressed(Keyboard.Key.Z);
      expect(scene._brickHex).toEqual(0x8);
    });
    
    it("cycles brick shape with C", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.keyPressed(Keyboard.Key.C);
      expect(scene._brickHex).toEqual(0x3);
    });
  });
  
  describe("mouse clicks", function () {
    it("selects item by clicking toolbar icon", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      var e = {target: {getBoundingClientRect: function () { return {left: 0, top: 0}; }}, clientX: 450, clientY: 85};
      scene._onMouseDown(e);
      expect(scene.getItemType()).toEqual('B');
    });
    
    it("switches view by clicking bottom menu config button", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      var e = {target: {getBoundingClientRect: function () { return {left: 0, top: 0}; }}, clientX: 20, clientY: 430};
      scene._onMouseDown(e);
      expect(scene.getView()).toEqual('config');
    });
  });
  
  describe("enemy spawns", function () {
    it("0 key cycles enemy spawn types", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.keyPressed(48);
      expect(scene.getItemType()).toEqual('E1');
      scene.keyPressed(48);
      expect(scene.getItemType()).toEqual('E2');
      scene.keyPressed(48);
      expect(scene.getItemType()).toEqual('E3');
    });
    
    it("places enemy spawn markers with uniqueness", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.keyPressed(48);
      scene._paint(0);
      scene._paint(2);
      var count = 0;
      for (var r = 0; r < 13; ++r) {
        for (var c = 0; c < 13; ++c) {
          if (scene.getGrid()[r][c].type == Editor.Structure.ENEMY1) count++;
        }
      }
      expect(count).toEqual(1);
      expect(scene.getGrid()[0][2].type).toEqual(Editor.Structure.ENEMY1);
    });
    
    it("serializes enemy spawn markers", function () {
      var grid = Editor.createEmptyGrid();
      grid[0][0] = {type: Editor.Structure.ENEMY1, hex: 0};
      grid[0][6] = {type: Editor.Structure.ENEMY2, hex: 0};
      grid[0][12] = {type: Editor.Structure.ENEMY3, hex: 0};
      var map = Editor.serializeGrid(grid);
      expect(map).toContain('Enemy1(32,16)');
      expect(map).toContain('Enemy2(224,16)');
      expect(map).toContain('Enemy3(416,16)');
    });
  });
});

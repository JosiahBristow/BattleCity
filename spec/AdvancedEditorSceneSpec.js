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
    function eventAt(x, y) {
      return {
        target: {
          getBoundingClientRect: function () { return {left: 0, top: 0, width: 512, height: 480}; },
          width: 512, height: 480
        },
        clientX: x, clientY: y
      };
    }

    it("selects item by clicking toolbar icon", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene._onMouseDown(eventAt(450, 85));
      expect(scene.getItemType()).toEqual('B');
    });
    
    it("switches view by clicking bottom menu config button", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene._onMouseDown(eventAt(20, 430));
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

  describe("f reset button", function () {
    it("resets brick hex when clicked in brick mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._brickHex = 0x3;
      expect(scene._handlePanelClick(488, 88)).toEqual(true);
      expect(scene._brickHex).toEqual(0xf);
      expect(scene.getItemType()).toEqual('B');
    });

    it("resets steel hex when clicked in steel mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('T');
      scene._steelHex = 0x5;
      expect(scene._handlePanelClick(488, 136)).toEqual(true);
      expect(scene._steelHex).toEqual(0xf);
    });

    it("does not swallow spawn-icon clicks", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('E');
      scene._brickHex = 0x1;
      expect(scene._handlePanelClick(496, 96)).toEqual(true);
      expect(scene.getItemType()).toEqual('P2');
      expect(scene._brickHex).toEqual(0x1);
    });
  });

  describe("wall sub-tile painting", function () {
    function eventAt(x, y) {
      return {
        target: {
          getBoundingClientRect: function () { return {left: 0, top: 0, width: 512, height: 480}; },
          width: 512, height: 480
        },
        clientX: x, clientY: y
      };
    }

    it("stamps the template on an empty cell", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._brickHex = 0x5;
      scene._applySubPaint(6 * 13 + 6, 0b0001);
      var cell = scene.getGrid()[6][6];
      expect(cell.type).toEqual(Editor.Structure.BRICK);
      expect(cell.hex).toEqual(0x5);
    });

    it("toggles a single quadrant off on an existing brick cell", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.getGrid()[6][6] = {type: Editor.Structure.BRICK, hex: 0xf};
      scene._applySubPaint(6 * 13 + 6, 0b0010);
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.BRICK);
      expect(scene.getGrid()[6][6].hex).toEqual(0xd);
    });

    it("collapses the cell to clear when the last quadrant is removed", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.getGrid()[6][6] = {type: Editor.Structure.BRICK, hex: 0b0010};
      scene._applySubPaint(6 * 13 + 6, 0b0010);
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.CLEAR);
    });

    it("toggles steel quadrants in steel mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('T');
      scene.getGrid()[6][6] = {type: Editor.Structure.STEEL, hex: 0xf};
      scene._applySubPaint(6 * 13 + 6, 0b1000);
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.STEEL);
      expect(scene.getGrid()[6][6].hex).toEqual(0x7);
    });

    it("does not double-toggle the same quadrant while dragging", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.getGrid()[6][6] = {type: Editor.Structure.BRICK, hex: 0xf};
      scene._applySubPaint(6 * 13 + 6, 0b0001);
      scene._applySubPaint(6 * 13 + 6, 0b0001);
      expect(scene.getGrid()[6][6].hex).toEqual(0xe);
    });

    it("does not toggle a freshly stamped cell until the pointer leaves it", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._brickHex = 0xf;
      scene._applySubPaint(6 * 13 + 6, 0b0001);
      scene._applySubPaint(6 * 13 + 6, 0b0010);
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.BRICK);
      expect(scene.getGrid()[6][6].hex).toEqual(0xf);
    });

    it("maps the four 16px regions of a cell to quadrant bits", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      var t = 6 * 13 + 6;
      expect(scene._quadrantBit(6 * 32 + 4, 6 * 32 + 4, t)).toEqual(0b0001);
      expect(scene._quadrantBit(6 * 32 + 20, 6 * 32 + 4, t)).toEqual(0b0010);
      expect(scene._quadrantBit(6 * 32 + 4, 6 * 32 + 20, t)).toEqual(0b0100);
      expect(scene._quadrantBit(6 * 32 + 20, 6 * 32 + 20, t)).toEqual(0b1000);
    });

    it("mousedown toggles the clicked quadrant of an existing wall", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene.getGrid()[6][6] = {type: Editor.Structure.BRICK, hex: 0xf};
      scene._onMouseDown(eventAt(6 * 32 + 20, 6 * 32 + 20));
      expect(scene.getGrid()[6][6].hex).toEqual(0x7);
    });

    it("mousedown stamps the template on an empty cell and mouseup does not re-toggle", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._brickHex = 0xf;
      scene._onMouseDown(eventAt(6 * 32 + 20, 6 * 32 + 20));
      scene._onMouseUp(eventAt(6 * 32 + 20, 6 * 32 + 20));
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.BRICK);
      expect(scene.getGrid()[6][6].hex).toEqual(0xf);
    });

    it("routes non-wall tools to whole-cell painting", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('R');
      scene._paintAt(6 * 32 + 20, 6 * 32 + 20, 6 * 13 + 6);
      expect(scene.getGrid()[6][6].type).toEqual(Editor.Structure.WATER);
    });

    it("highlights the hovered wall quadrant on the field", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      var hover = scene._hoveredSubTile(6 * 32 + 20, 6 * 32 + 4, 6 * 13 + 6);
      expect(hover).toEqual({row: 6, col: 6, quad: 1});
      scene.setItemType('X');
      expect(scene._hoveredSubTile(6 * 32 + 20, 6 * 32 + 4, 6 * 13 + 6)).toEqual(null);
    });
  });

  describe("wall quadrant widget clicks", function () {
    it("toggles the matching quadrant of the brick sample in brick mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('B');
      scene._brickHex = 0xf;
      expect(scene._handlePanelClick(470, 85)).toEqual(true);
      expect(scene._brickHex).toEqual(0xd);
      expect(scene.getItemType()).toEqual('B');
    });

    it("toggles the matching quadrant of the steel sample in steel mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('T');
      scene._steelHex = 0xf;
      expect(scene._handlePanelClick(452, 148)).toEqual(true);
      expect(scene._steelHex).toEqual(0xb);
    });

    it("selects the brick tool when clicking the sample in another mode", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene.setItemType('X');
      scene._brickHex = 0xf;
      scene._handlePanelClick(450, 85);
      expect(scene.getItemType()).toEqual('B');
      expect(scene._brickHex).toEqual(0xf);
    });

    it("reports the hovered widget quadrant", function () {
      var eventManager = new EventManager();
      var scene = new AdvancedEditorScene(new SceneManager(eventManager));
      scene._mouseX = 464;
      scene._mouseY = 85;
      expect(scene._widgetHover(0, 448, 80)).toEqual(false);
      expect(scene._widgetHover(1, 448, 80)).toEqual(true);
      expect(scene._widgetHover(2, 448, 80)).toEqual(false);
      expect(scene._widgetHover(3, 448, 80)).toEqual(false);
    });
  });
});

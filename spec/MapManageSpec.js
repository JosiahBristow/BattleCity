describe("MapStorage management", function () {
  beforeEach(function () {
    MapStorage.maps = null;
    MapStorage.currentMap = null;
    MapStorage.selectedIndex = 0;
    try {
      localStorage.removeItem(MapStorage.STORAGE_KEY);
    }
    catch (e) {}
  });
  
  it("#remove deletes a map", function () {
    MapStorage.save("Base(224,400)");
    MapStorage.save("Base(224,400);Water(96,176)");
    expect(MapStorage.getCount()).toEqual(2);
    MapStorage.remove(0);
    expect(MapStorage.getCount()).toEqual(1);
    expect(MapStorage.getMap(0).map).toContain("Water");
  });
  
  it("#rename changes the name", function () {
    MapStorage.save("Base(224,400)");
    MapStorage.rename(0, "MY LEVEL");
    expect(MapStorage.getMap(0).name).toEqual("MY LEVEL");
  });
  
  it("#update changes map and tanks", function () {
    MapStorage.save("Base(224,400)");
    MapStorage.update(0, "Base(224,400);BrickWall(64,48)", [Tank.Type.BASIC]);
    expect(MapStorage.getMap(0).map).toContain("BrickWall");
    expect(MapStorage.getMap(0).tanks).toEqual([Tank.Type.BASIC]);
  });
});

describe("MapManageScene", function () {
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
    var scene = new MapManageScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  });
  
  it("delete key removes current map", function () {
    MapStorage.save("Base(224,400)");
    MapStorage.save("Base(224,400);Water(96,176)");
    var eventManager = new EventManager();
    var scene = new MapManageScene(new SceneManager(eventManager));
    scene.setIndex(1);
    scene.keyPressed(51); // '3'
    expect(MapStorage.getCount()).toEqual(1);
  });
  
  it("J key goes to player scene", function () {
    MapStorage.save("Base(224,400)");
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var scene = new MapManageScene(sceneManager);
    spyOn(sceneManager, 'toMyMapPlayerScene');
    scene.keyPressed(Keyboard.Key.J);
    expect(sceneManager.toMyMapPlayerScene).toHaveBeenCalled();
  });
  
  it("1 key goes to editor", function () {
    MapStorage.save("Base(224,400)");
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var scene = new MapManageScene(sceneManager);
    spyOn(sceneManager, 'toAdvancedEditorScene');
    scene.keyPressed(49); // '1'
    expect(sceneManager.toAdvancedEditorScene).toHaveBeenCalled();
  });
  
  it("preview parses snow tiles", function () {
    MapStorage.save("Base(224,400);Snow(64,48)");
    var eventManager = new EventManager();
    var scene = new MapManageScene(new SceneManager(eventManager));
    var sprites = scene._parseMap(MapStorage.getMap(0).map);
    expect(sprites.some(function (s) { return s.image == 'snow' && s.tile; })).toBeTruthy();
  });
});

describe("MapRenameScene", function () {
  beforeEach(function () {
    MapStorage.maps = null;
    MapStorage.currentMap = null;
    try {
      localStorage.removeItem(MapStorage.STORAGE_KEY);
    }
    catch (e) {}
  });
  
  it("types letters and saves on enter", function () {
    MapStorage.save("Base(224,400)");
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var scene = new MapRenameScene(sceneManager, 0);
    spyOn(sceneManager, 'toMapManageScene');
    scene.keyPressed(65); // A
    scene.keyPressed(66); // B
    scene.keyPressed(Keyboard.Key.START);
    expect(MapStorage.getMap(0).name).toEqual("AB");
    expect(sceneManager.toMapManageScene).toHaveBeenCalled();
  });
  
  it("backspace deletes last char", function () {
    MapStorage.save("Base(224,400)");
    var eventManager = new EventManager();
    var scene = new MapRenameScene(new SceneManager(eventManager), 0);
    scene.keyPressed(65);
    scene.keyPressed(66);
    scene.keyPressed(8); // backspace
    expect(scene.getName()).toEqual("A");
  });
});

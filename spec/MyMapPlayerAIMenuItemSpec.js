describe("MyMapPlayerAIMenuItem", function () {
  it("#execute - activates map and starts AI mode", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new MyMapPlayerAIMenuItem(sceneManager);
    spyOn(sceneManager, 'toGameScene');
    MapStorage.activate = function () { MapStorage.usingCustomMap = true; };
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalledWith(1, undefined, 3);
    expect(MapStorage.usingCustomMap).toBeTruthy();
  });
});

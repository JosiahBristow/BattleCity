describe("CheatMenuItem", function () {
  it("#execute", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new CheatMenuItem(sceneManager);
    spyOn(sceneManager, 'toCheatScene');
    item.execute();
    expect(sceneManager.toCheatScene).toHaveBeenCalled();
  });
});

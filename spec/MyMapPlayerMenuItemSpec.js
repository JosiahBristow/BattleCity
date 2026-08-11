describe("MyMapPlayerMenuItem", function () {
  it("#execute - 1 player", function () {
    var sceneManager = new SceneManager();
    var item = new MyMapPlayerMenuItem(sceneManager, 1);
    spyOn(sceneManager, 'toGameScene');
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalledWith(1, undefined, 1);
  });
  
  it("#execute - 2 players", function () {
    var sceneManager = new SceneManager();
    var item = new MyMapPlayerMenuItem(sceneManager, 2);
    spyOn(sceneManager, 'toGameScene');
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalledWith(1, undefined, 2);
  });
});

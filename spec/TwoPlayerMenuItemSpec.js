describe("TwoPlayerMenuItem", function () {
  it("#execute", function () {
    var sceneManager = new SceneManager();
    var item = new TwoPlayerMenuItem(sceneManager);
    spyOn(sceneManager, 'toGameScene');
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalled();
  });
});

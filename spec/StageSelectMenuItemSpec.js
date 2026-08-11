describe("StageSelectMenuItem", function () {
  it("#execute", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new StageSelectMenuItem(sceneManager);
    spyOn(sceneManager, 'toStageSelectScene');
    item.execute();
    expect(sceneManager.toStageSelectScene).toHaveBeenCalled();
  });
});

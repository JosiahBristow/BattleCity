describe("StagePlayerAIMenuItem", function () {
  it("#execute - starts AI mode at stage", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new StagePlayerAIMenuItem(sceneManager, 7);
    spyOn(sceneManager, 'toGameScene');
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalledWith(7, undefined, 3);
  });
});

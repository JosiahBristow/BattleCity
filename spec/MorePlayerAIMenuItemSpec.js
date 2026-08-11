describe("MorePlayerAIMenuItem", function () {
  it("#execute - directly starts stage 1 in AI mode", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new MorePlayerAIMenuItem(sceneManager);
    spyOn(sceneManager, 'toGameScene');
    item.execute();
    expect(sceneManager.toGameScene).toHaveBeenCalledWith(1, undefined, 3);
  });
});

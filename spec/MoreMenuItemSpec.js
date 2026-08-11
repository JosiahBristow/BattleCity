describe("MoreMenuItem", function () {
  it("#execute", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new MoreMenuItem(sceneManager);
    spyOn(sceneManager, 'toMoreScene');
    item.execute();
    expect(sceneManager.toMoreScene).toHaveBeenCalled();
  });
});

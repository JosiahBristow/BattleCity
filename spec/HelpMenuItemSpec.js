describe("HelpMenuItem", function () {
  it("#execute", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new HelpMenuItem(sceneManager);
    spyOn(sceneManager, 'toHelpScene');
    item.execute();
    expect(sceneManager.toHelpScene).toHaveBeenCalled();
  });
});

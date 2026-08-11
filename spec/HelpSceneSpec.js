describe("HelpScene", function () {
  it("subscribe", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var scene = new HelpScene(new SceneManager(eventManager));
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(scene, [Keyboard.Event.KEY_PRESSED]);
  });
  
  it("#keyPressed START", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var scene = new HelpScene(sceneManager);
    spyOn(sceneManager, 'toMoreScene');
    scene.keyPressed(Keyboard.Key.START);
    expect(sceneManager.toMoreScene).toHaveBeenCalled();
  });
});

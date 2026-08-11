describe("MoreScene", function () {
  it("subscribe", function () {
    var eventManager = new EventManager();
    var scene = new MoreScene(new SceneManager(eventManager));
    expect(scene._mainMenu.getItemsInfo().length).toBeGreaterThan(0);
  });
});

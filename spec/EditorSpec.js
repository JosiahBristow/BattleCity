describe("Editor", function () {
  describe("#serializeGrid", function () {
    it("serializes brick walls with hex bits", function () {
      var grid = Editor.createEmptyGrid();
      grid[6][6] = {type: Editor.Structure.BRICK, hex: 0xf};
      var map = Editor.serializeGrid(grid);
      expect(map).toContain('BrickWall(' + (32 + 6 * 32) + ',' + (16 + 6 * 32) + ')');
      expect(map).toContain('BrickWall(' + (32 + 6 * 32 + 16) + ',' + (16 + 6 * 32) + ')');
      expect(map).toContain('BrickWall(' + (32 + 6 * 32) + ',' + (16 + 6 * 32 + 16) + ')');
      expect(map).toContain('BrickWall(' + (32 + 6 * 32 + 16) + ',' + (16 + 6 * 32 + 16) + ')');
    });
    
    it("serializes base", function () {
      var grid = Editor.createEmptyGrid();
      grid[12][6] = {type: Editor.Structure.BASE, hex: 0};
      var map = Editor.serializeGrid(grid);
      expect(map).toContain('Base(224,400)');
    });
  });
  
  describe("#serializeBots", function () {
    it("expands bot config into tank type array", function () {
      var bots = [
        {type: Tank.Type.BASIC, count: 2},
        {type: Tank.Type.FAST, count: 1}
      ];
      var tanks = Editor.serializeBots(bots);
      expect(tanks).toEqual([Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.FAST]);
    });
  });
});

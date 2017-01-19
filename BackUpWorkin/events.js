var spawner = require("spawner");

module.exports = {

    tick()
    {
        var controllerLevel = this.GetControllerLevel();

        if (controllerLevel != Memory.ControllerLevel)
            this.OnControllerLevelChanged(controllerLevel);
    },

    init()
    {
        if (Memory.ControllerLevel === undefined) {
            Memory.ControllerLevel = this.GetControllerLevel();
        }
    },

    OnControllerLevelChanged(newLevel)
    {
        Memory.ControllerLevel = newLevel;

        console.log("New controller level : " + newLevel);

        if (newLevel == 2) {
            spawner.addToSpawnQueue(["upgrader", "citizen", "citizen", "citizen", "citizen"]);
        }

        if (Memory.BuildingInfo) {
            for (var structureName in Memory.BuildingInfo) {
                Memory.BuildingInfo[structureName].needUpgrade = true;
            }
        }
    },

    GetControllerLevel()
    {
        return this.GetRoom().controller.level;
    },

    GetRoom()
    {
        for (var name in Game.rooms) {
            return Game.rooms[name];
        }
    },

};

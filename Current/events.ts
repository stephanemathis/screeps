import * as spawner from "./spawner";



export function tick()
{
    init();

    for(var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var controllerLevel = room.controller.level;

        if (controllerLevel != Memory.controllerLevel[roomName])
            onControllerLevelChanged(controllerLevel, room);
    }

    for(var flagName in Game.flags) {
        if(flagName == "Conquest") {
            spawner.addClaimerIfNecessary();
        }
    }
}

export function init()
{
    if(Memory.controllerLevel === undefined)
    Memory.controllerLevel = {};

    if(Memory.buildingUpgradeInfo === undefined)
    Memory.buildingUpgradeInfo = {};

    for(var roomName in Game.rooms) {
        if(Memory.controllerLevel[roomName] === undefined)
            Memory.controllerLevel[roomName] = Game.rooms[roomName].controller.level;
    }
}

export function onControllerLevelChanged(newLevel: number, room: Room)
{
    Memory.controllerLevel[room.name] = newLevel;

    console.log("New controller level : " + newLevel);

    if (newLevel == 2) {
        spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
        spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
        spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
        spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
    }

    for (var structureName in Memory.buildingUpgradeInfo) {
        Memory.buildingUpgradeInfo[structureName] = true;
    }
}

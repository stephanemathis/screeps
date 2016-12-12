var roleUpgrader = require('role.upgrader');
var roleCitizen = require('role.citizen');
var roleMiner = require('role.miner');
var _ = require('lodash');
var spawner = require("spawner");
var building = require("building");
var defender = require("defender");

module.exports.loop = function () {

    Init();

    var controllerLevel = GetControllerLevel();
    if(controllerLevel != Memory.ControllerLevel)
        OnControllerLevelChanged(controllerLevel);

    spawner.init();
    spawner.respawnDeadCreeps();
    spawner.spawnIfNecessary();

    building.createBuildingIfNecessary();

    defender.run();

    for(var name in Game.creeps) {

        var creep = Game.creeps[name];

        if(creep.memory.role == 'upgrader')
        roleUpgrader.run(creep);

        if(creep.memory.role == 'citizen')
        roleCitizen.run(creep);

        if(creep.memory.role == 'miner')
        roleMiner.run(creep);

    }
}

/* Controller */
function OnControllerLevelChanged(newLevel)
{
    Memory.ControllerLevel = newLevel;

    console.log("New controller level : " + newLevel);

    if(newLevel == 2)
    {
        spawner.addToSpawnQueue(["upgrader", "citizen", "citizen", "citizen"]);
    }
}

function GetControllerLevel()
{
    return GetRoom().controller.level;
}

function GetRoom()
{
    for(var name in Game.rooms)
    {
        return Game.rooms[name];
    }
}

function Init()
{
    if(!Memory.IsInitialized)
    {
        Memory.IsInitialized = true;

        Memory.ControllerLevel = GetControllerLevel();
        Memory.CreepCount = 0;
    }
}

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCitizen = require('role.citizen');
var roleMiner = require('role.miner');
var _ = require('lodash');
var spawner = require("spawner");
var building = require("building");

module.exports.loop = function () {

    Init();

    var controllerLevel = GetControllerLevel();
    if(controllerLevel != Memory.ControllerLevel)
        OnControllerLevelChanged(controllerLevel);

    spawner.init();
    spawner.respawnDeadCreeps();
    spawner.spawnIfNecessary();

    building.createBuildingIfNecessary();

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
    }
}

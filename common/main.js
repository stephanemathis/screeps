var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
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

        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }

        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }

        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}

/* Controller */
function OnControllerLevelChanged(newLevel)
{
    Memory.ControllerLevel = newLevel;
    
    console.log("New controller level : " + newLevel);
    
    if(newLevel == 2)
    {
        spawner.addToSpawnQueue(["builder", "builder", "builder", "builder", "upgrader", "upgrader"]);
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
        console.log("Init done");
        Memory.IsInitialized = true;
    
        Memory.CreepCount = 0;
        Memory.ControllerLevel = GetControllerLevel();
    }
}

/** @param {string} text **/
function Log(text) {
    console.log(text);
}



/*
Avoir des move et carry rapidement
et 2 qui move et work work au debut
*/



















































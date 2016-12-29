var roleUpgrader = require('role.upgrader');
var roleCitizen = require('role.citizen');
var roleMiner = require('role.miner');
var spawner = require("spawner");
var building = require("building");
var defender = require("defender");
var events = require("events");

module.exports.loop = function ()
{
    events.tick();
    spawner.tick();
    building.tick();
    defender.tick();

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

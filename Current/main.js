"use strict";
var roleUpgrader = require("./role.upgrader");
var roleCitizen = require("./role.citizen");
var roleMiner = require("./role.miner");
var roleClaimer = require("./role.claimer");
var spawner = require("./spawner");
var building = require("./building");
var defender = require("./defender");
var eventsManager = require("./events");
var proto = require("./prototype.creep");
function loop() {
    proto.run();
    eventsManager.tick();
    spawner.tick();
    building.tick();
    defender.tick();
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'upgrader')
            roleUpgrader.run(creep);
        if (creep.memory.role == 'citizen')
            roleCitizen.run(creep);
        if (creep.memory.role == 'miner')
            roleMiner.run(creep);
        if (creep.memory.role == 'claimer')
            roleClaimer.run(creep);
    }
}
exports.loop = loop;

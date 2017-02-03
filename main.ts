import * as roleUpgrader from "./role.upgrader";
import * as roleCitizen from "./role.citizen";
import * as roleMiner from "./role.miner";
import * as roleClaimer from "./role.claimer";
import * as spawner from "./spawner";
import * as building from "./building";
import * as defender from "./defender";
import * as eventsManager from "./events";

import * as proto from "./prototype.creep";

export function loop() {
//Memory.spawnQueue["W71N19"].push(require("spawner").getSpawnQueueTarget("citizen", true))
    proto.run();

    eventsManager.tick();
    spawner.tick();
    building.tick();
    defender.tick();

    Memory.turnGoal = {};

    if(Memory.roomGoal === undefined)
        Memory.roomGoal = {};

    for (var roomName in Game.rooms) {
        Memory.turnGoal[roomName] = {};

        if(Memory.roomGoal[roomName] === undefined)
            Memory.roomGoal[roomName] = {};
    }

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

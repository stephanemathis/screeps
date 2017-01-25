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

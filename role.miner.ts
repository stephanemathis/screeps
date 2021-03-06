export function run(creep: Creep) {
    if (!creep.goToRoomIfNecessary()) {
        if (!creep.memory.targetSourceId) {
            var sources = <Source[]>creep.room.find(FIND_SOURCES);//var sources = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            for (var i = 0; i < sources.length; i++) {
                var pos = sources[i].pos;
                var result = <LookAtResultWithPos[]>creep.room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);

                var miners = result.filter((p) => {
                    return p.type == "creep" && p.creep.my && p.creep.memory.role == "miner"
                });

                if (miners.length == 0) {
                    var isSpotReserved = false;
                    for (var creepName in Game.creeps) {
                        if (Game.creeps[creepName].memory.targetSourceId == sources[i].id)
                            isSpotReserved = true;
                    }

                    if (!isSpotReserved) {
                        creep.memory.targetSourceId = sources[i].id;
                    }
                }
            }
        }

        var source = <Source>Game.getObjectById(creep.memory.targetSourceId);

        if (!source)
            creep.memory.targetSourceId = null;

        var res = <Structure[]>creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y);

        var actionConsumed = false;

        if (res.length == 0 || res.filter((s) => { return s.structureType == STRUCTURE_CONTAINER }).length == 0) {

            if (source != null) {
                var pos = source.pos;

                var result = <LookAtResultWithPos[]>source.room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);

                var numberOfContainer = result.filter((p) => {
                    return p.type === "structure" && p.structure.structureType == STRUCTURE_CONTAINER
                });

                if (numberOfContainer.length > 0) {
                    creep.moveTo(numberOfContainer[0].x, numberOfContainer[0].y);
                    actionConsumed = true;
                }
            }
        }

        if (!actionConsumed) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
}

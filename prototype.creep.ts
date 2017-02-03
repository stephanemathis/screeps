export function run() {
    Creep.prototype.findAndPickEnergy = function () {
        var creep = this;
        var needMoreEnergy = true;

        if (needMoreEnergy) {
            var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
            }).sort((i, j) => { 
                var energyDiff = j.store[RESOURCE_ENERGY] - i.store[RESOURCE_ENERGY];
                if(energyDiff > 1000)
                    return j.store[RESOURCE_ENERGY] - i.store[RESOURCE_ENERGY];
                else return 0;
            });

            if (containersWithEnergy && containersWithEnergy.length > 0) {

                var containerIndex = 0;
                var withdrawResult = creep.withdraw(containersWithEnergy[containerIndex], RESOURCE_ENERGY);

                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containersWithEnergy[containerIndex]);
                    needMoreEnergy = false;
                }

                if (withdrawResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {
            var sources = creep.room.find(FIND_DROPPED_ENERGY).sort((i, j) => { return j.energy - i.energy });

            if (sources.length > 0) {
                var pickResult = creep.pickup(sources[0]);
                if (pickResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                    needMoreEnergy = false;
                }

                if (pickResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {
            sources = creep.room.find(FIND_SOURCES);//sources = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            var targetSource = sources[0];
            //targetSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource);
            }
        }
    };

    Creep.prototype.goToRoomIfNecessary = function () {
        var creep = this;

        if (creep.memory.roomName != creep.room.name) {
            creep.moveTo(Game.flags[creep.memory.roomName]);
            return true;
        }

        return false;
    };
}

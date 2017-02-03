export function run() {
    Creep.prototype.findAndPickEnergy = function () {
        var creep: Creep = this;
        var needMoreEnergy = true;

        if (needMoreEnergy) {

            if(Memory.turnGoal[creep.room.name].energyContainerTargetId === undefined) {

                var currentRoomContainerId = Memory.roomGoal[creep.room.name].energyContainerTargetId;

                // On vérifie qu'il y a encore de l'énergie
                if(currentRoomContainerId) {
                    var container = Game.getObjectById<Container>(currentRoomContainerId);
                    if(container.store[RESOURCE_ENERGY] < 100) {
                        currentRoomContainerId = null;
                        Memory.roomGoal[creep.room.name].energyContainerTargetId = undefined;
                    }
                }

                // Sinon on cherche un autre container
                if(!currentRoomContainerId) {
                   var containersWithEnergy = creep.room.find<Container>(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
                    }).sort((i, j) => { return j.store[RESOURCE_ENERGY] - i.store[RESOURCE_ENERGY]; });

                    if(containersWithEnergy.length && containersWithEnergy[0].store[RESOURCE_ENERGY] > 100) {
                        currentRoomContainerId = containersWithEnergy[0].id;
                        Memory.roomGoal[creep.room.name].energyContainerTargetId = currentRoomContainerId;
                        console.log("Salle " + creep.room.name + "/" +  currentRoomContainerId);
                    }
                }

                if(currentRoomContainerId) {
                    Memory.turnGoal[creep.room.name].energyContainerTargetId = currentRoomContainerId;
                }
            }

            if(Memory.turnGoal[creep.room.name].energyContainerTargetId) {

                var container = Game.getObjectById<Container>(Memory.turnGoal[creep.room.name].energyContainerTargetId);

                var withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);

                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                    needMoreEnergy = false;
                }

                if (withdrawResult == OK)
                    needMoreEnergy = false;
            }


            /*var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
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
            }*/
        }

        if (needMoreEnergy) {
            var droppedSources = creep.room.find<Resource>(FIND_DROPPED_ENERGY).sort((i, j) => { return j.amount - i.amount });

            if (droppedSources.length > 0) {
                var pickResult = creep.pickup(droppedSources[0]);
                if (pickResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedSources[0]);
                    needMoreEnergy = false;
                }

                if (pickResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {
            var energySources = creep.room.find<Source>(FIND_SOURCES);//sources = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            var targetSource = energySources[0];
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

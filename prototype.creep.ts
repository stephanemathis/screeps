export function run() {
    Creep.prototype.findAndPickEnergy = function () {
        let creep: Creep = this;
        let needMoreEnergy = true;

        if (needMoreEnergy && Memory.attackStep < 1) {

            let storages = <Storage[]>creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE;
                }
            });

            let storage = storages[0];

            if (storage.store.energy > 250) {
                let withdrawResult = creep.withdraw(storage, RESOURCE_ENERGY);

                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                    needMoreEnergy = false;
                }

                if (withdrawResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {

            if (Memory.turnGoal[creep.room.name].energyContainerTargetId === undefined) {

                var currentRoomContainerId = Memory.roomGoal[creep.room.name].energyContainerTargetId;

                // On vérifie qu'il y a encore de l'énergie
                if (currentRoomContainerId) {
                    let container = Game.getObjectById<Container>(currentRoomContainerId);

                    if (!container || container.store[RESOURCE_ENERGY] < 100) {
                        currentRoomContainerId = null;
                        Memory.roomGoal[creep.room.name].energyContainerTargetId = undefined;
                    }
                }

                // Sinon on cherche un autre container
                if (!currentRoomContainerId) {
                    var containersWithEnergy = creep.room.find<Container>(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
                    }).sort((i, j) => { return j.store[RESOURCE_ENERGY] - i.store[RESOURCE_ENERGY]; });

                    if (containersWithEnergy.length && containersWithEnergy[0].store[RESOURCE_ENERGY] > 100) {
                        currentRoomContainerId = containersWithEnergy[0].id;
                        Memory.roomGoal[creep.room.name].energyContainerTargetId = currentRoomContainerId;
                        console.log("Salle " + creep.room.name + "/" + currentRoomContainerId);
                    }
                }

                if (currentRoomContainerId) {
                    Memory.turnGoal[creep.room.name].energyContainerTargetId = currentRoomContainerId;
                }
            }

            if (Memory.turnGoal[creep.room.name].energyContainerTargetId) {

                let container = Game.getObjectById<Container>(Memory.turnGoal[creep.room.name].energyContainerTargetId);

                if (!container) {
                    Memory.roomGoal[creep.room.name].energyContainerTargetId = null;
                } else {
                    let withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);

                    if (withdrawResult == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                        needMoreEnergy = false;
                    }

                    if (withdrawResult == OK)
                        needMoreEnergy = false;
                }
            }
        }

        if (needMoreEnergy) {
            let droppedSources = creep.room.find<Resource>(FIND_DROPPED_ENERGY).sort((i, j) => { return j.amount - i.amount });

            if (droppedSources.length > 0) {
                let pickResult = creep.pickup(droppedSources[0]);
                if (pickResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedSources[0]);
                    needMoreEnergy = false;
                }

                if (pickResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {
            let energySources = creep.room.find<Source>(FIND_SOURCES);//sources = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            let targetSource = energySources[0];
            //targetSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            let harvestResult = creep.harvest(targetSource);
            //console.log("harvest" + harvestResult);
            if (harvestResult == ERR_NOT_IN_RANGE) {
                let moveResult = creep.moveTo(targetSource);
                //console.log("move" + moveResult);
            }
        }
    };

    Creep.prototype.goToRoomIfNecessary = function () {
        let creep: Creep = this;

        if (creep.memory.roomName != creep.room.name) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
            return true;
        }

        return false;
    };
}

"use strict";
function run(creep) {
    if (!creep.goToRoomIfNecessary()) {
        if (creep.carry.energy == creep.carryCapacity)
            creep.memory.dispatch = true;
        else if (!creep.carry.energy)
            creep.memory.dispatch = false;
        if (creep.memory.dispatch == false) {
            creep.findAndPickEnergy();
        }
        else {
            if (creep.room.controller.ticksToDowngrade < 1000) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
            else {
                var targetsFillEnergy = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return (structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });
                if (targetsFillEnergy.length > 0) {
                    if (creep.transfer(targetsFillEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetsFillEnergy[0]);
                    }
                }
                else {
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (targets.length) {
                        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                    }
                    else {
                        if (Memory.buildingUpgradeInfo === undefined)
                            Memory.buildingUpgradeInfo = {};
                        var repairTargets = creep.room.find(FIND_STRUCTURES, {
                            filter: function (structure) {
                                if (structure.structureType != STRUCTURE_RAMPART)
                                    return false;
                                var possibleStructure = structure;
                                if (possibleStructure.hits == possibleStructure.hitsMax) {
                                    Memory.buildingUpgradeInfo[possibleStructure.id] = false;
                                }
                                if (possibleStructure.hits < possibleStructure.hitsMax * 0.5) {
                                    Memory.buildingUpgradeInfo[possibleStructure.id] = true;
                                    return true;
                                }
                                else {
                                    return !!Memory.buildingUpgradeInfo[possibleStructure.id];
                                }
                            }
                        });
                        if (repairTargets.length > 0) {
                            if (creep.repair(repairTargets[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(repairTargets[0]);
                            }
                        }
                        else {
                            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.controller);
                            }
                        }
                    }
                }
            }
        }
    }
}
exports.run = run;

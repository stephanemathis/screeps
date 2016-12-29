module.exports = function() {
    
    Creep.prototype.findAndPickEnergy = function ()
    {
        var creep = this;
        var needMoreEnergy = true;

        if (needMoreEnergy) {
            var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
            });

            if (containersWithEnergy && containersWithEnergy.length > 0) {
                var withdrawResult = creep.withdraw(containersWithEnergy[0], RESOURCE_ENERGY);
                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containersWithEnergy[0]);
                    needMoreEnergy = false;
                }

                if (withdrawResult == OK)
                    needMoreEnergy = false;
            }
        }

        if (needMoreEnergy) {
            var sources = creep.room.find(FIND_DROPPED_ENERGY);

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
            sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    };
};
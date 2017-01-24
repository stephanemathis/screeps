var roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.carry.energy == creep.carryCapacity)
            creep.memory.dispatch = true;
        else if (!creep.carry.energy)
            creep.memory.dispatch = false;

        if (creep.memory.dispatch == false) {
            // On va chercher de l'énergie
            creep.findAndPickEnergy();
        }
        else {
            var flag = Game.flags["Conquest"];

            if (flag) {
                if (creep.room.name == flag.room.name) {
                    if(creep.room.controller.my) {
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                    } else {
                        if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE)
                            creep.moveTo(creep.room.controller);
                    }
                } else {
                    creep.moveTo(flag);
                }
            }
        }
    }
};

module.exports = roleclaimer;

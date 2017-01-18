var roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {

        var flag = Game.flags["Conquest"];

        if(flag) {
            if(creep.room.name == flag.room.name) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.controller);
            } else {
                creep.moveTo(flag);
            }
        }
    }
};

module.exports = roleclaimer;

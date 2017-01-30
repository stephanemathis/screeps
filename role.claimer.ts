export function run(creep: Creep) {
    var flag = Game.flags["Conquest"];

    if (flag) {
        if (creep.room.name == flag.pos.roomName) {
            if (creep.room.controller.my) {
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

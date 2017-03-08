export function run(creep: Creep) {

    var moveDone = creep.goToRoomIfNecessary();

    if (!moveDone) {
        var claimResult = creep.claimController(creep.room.controller);
        if (claimResult == ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.controller);
        else if (claimResult == OK)
            creep.suicide();
    }
}

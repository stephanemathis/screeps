interface Memory {
    controllerLevel: {[roomName: string]: number};
    buildingUpgradeInfo: {[buildingId: string]: boolean};
    creepCount: number;
    spawnQueue: {[roomName: string]: SpawnQueueTarget[]};
}

interface Creep {
    findAndPickEnergy(): void;
    goToRoomIfNecessary(): void;
    memory: any | CreepMemory;
}

interface SpawnQueueTarget {
    role: string;
    roomName: string;
    maxParts: number;
    respawnAfterDeath: boolean;
}

interface CreepMemory {
    roomName: string;
    role: string;
    respawnAfterDeath: boolean;

    targetSourceId?: string;
    dispatch?: boolean;
    upgrading?: boolean;
}

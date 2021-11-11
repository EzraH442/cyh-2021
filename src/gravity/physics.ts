import Ball from "./Ball";
import Vector, {
    add, subtract, multiply, divide, dotProduct,
} from "../graphics/Vector";

const SPEED_LIMIT = 10000000;

function distanceSquared(v1: Vector, v2: Vector): number {
    return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2;
}

function magnitudeSquared(v: Vector): number {
    return v.x ** 2 + v.y ** 2;
}

function normalize(v: Vector): Vector {
    const mag = Math.sqrt(magnitudeSquared(v));
    return divide(mag, v);
}

function calcMaxVelocityUnderSpeedLimit(b: Ball, deltaV: Vector): Vector {
    const newV = add(b.getVelocity(), deltaV);
    const magSquared = magnitudeSquared(newV);

    if (magSquared < SPEED_LIMIT ** 2) return newV;

    const scalar = SPEED_LIMIT / Math.sqrt(magSquared); // gets the amount its over the speed limit
    return multiply(scalar, newV);
}

async function handleGravity(b1: Ball, b2: Ball, FPS: number, GC: number): Promise<void> {
    const Fg: number = await Promise.resolve((b1.getMass() * b2.getMass())
                        / distanceSquared(b1.getPosition(), b2.getPosition()));

    const normalizedDirection: Vector = await Promise.resolve(
        normalize(subtract(b2.getPosition(), b1.getPosition())),
    );

    Promise.all([
        multiply(((GC * Fg) / b1.getMass()) / FPS, normalizedDirection),
        multiply(((GC * -Fg) / b2.getMass()) / FPS, normalizedDirection)])
        .then(([deltaV1, deltaV2]) => {
            Promise.all([
                b1.setVelocity(calcMaxVelocityUnderSpeedLimit(b1, deltaV1)),
                b2.setVelocity(calcMaxVelocityUnderSpeedLimit(b2, deltaV2))]);
        })
        .then();
}


async function determineMTVHorizontal(b: Ball, w: number): Promise<number> {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();
    if (pos.x + r > w) {
        return -1 * (pos.x + r - w);
    }

    return -1 * (pos.x - r);
}

async function determineMTVVertical(b: Ball, h: number): Promise<number> {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();
    if (pos.y + r > h) {
        return -1 * (pos.y + r - h);
    }

    return -1 * (pos.y - r);
}

async function handleWallCollisions(b: Ball, w: number, h: number, FPS: number): Promise<boolean> {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();

    if (pos.x + r >= w || pos.x - r <= 0) {
        determineMTVHorizontal(b, w).then((mtv) => new Promise<void>(() => {
            Promise.all([
                b.popTrailPoints(),
                b.popTrailPoints(),
                b.addTrailPoint({ x: b.getPosition().x + mtv, y: b.getPosition().y }),
                b.move({ x: mtv, y: b.getVelocity().y / FPS }),
                b.setVelocity({ x: -b.getVelocity().x, y: b.getVelocity().y }),
            ]).then(() => true);
        }));
    }
    else if (pos.y + r > h || pos.y - r < 0) {
        determineMTVVertical(b, h).then((mtv) => new Promise<void>(() => {
            Promise.all([
                b.popTrailPoints(),
                b.popTrailPoints(),
                b.addTrailPoint({ x: b.getPosition().x, y: b.getPosition().y + mtv }),
                b.move({ x: b.getVelocity().x / FPS, y: mtv }),
                b.addTrailPoint(b.getPosition()),
                b.setVelocity({ x: b.getVelocity().x, y: -b.getVelocity().y }),
            ]).then(() => false);
        }));
    }

    return Promise.resolve(false);
}

async function determineMTV2D(b1: Ball, b2: Ball): Promise<Vector> {
    const relativePos = await Promise.resolve(subtract(b2.getPosition(), b1.getPosition()));
    const intersectionMagnitude = await Promise.resolve(Math.sqrt(magnitudeSquared(relativePos)));

    return multiply(
        (b1.getRadius() + b2.getRadius() - intersectionMagnitude) / intersectionMagnitude,
        relativePos,
    );
}

async function handleBallCollisions(
    b1: Ball,
    b2: Ball,
    E_LOSS: number,
): Promise<boolean> {
    const relativePos: Vector = subtract(b2.getPosition(), b1.getPosition());
    const relativeVel: Vector = subtract(b2.getVelocity(), b1.getVelocity());
    const dot: number = dotProduct(relativePos, relativeVel);
    const centerDistSquared = distanceSquared(
        b1.getPosition(),
        b2.getPosition(),
    );

    const radiusSum = (b1.getRadius() + b2.getRadius());


    if (dot < 0 && (centerDistSquared) < radiusSum ** 2) {
        const mtv = await determineMTV2D(b1, b2);

        const v1 = b1.getVelocity();
        const v2 = b2.getVelocity();
        const p1 = b1.getPosition();
        const p2 = b2.getPosition();
        const m1 = b1.getMass();
        const m2 = b2.getMass();
        const im1 = 1 / m1;
        const im2 = 1 / m2;
        const mSum = m1 + m2;
        const dist = distanceSquared(p1, p2);

        const im11 = (2 * m2) / (mSum);
        const im22 = (2 * m1) / (mSum);
        const rv1 = subtract(v1, v2);
        const rv2 = subtract(v2, v1);
        const rp1 = subtract(p1, p2);
        const rp2 = subtract(p2, p1);

        const dot1 = dotProduct(rv1, rp1);
        const dot2 = dotProduct(rv2, rp2);
        const dv1 = multiply(1 - E_LOSS, subtract(v1, multiply((im11 * dot1) / dist, rp1)));
        const dv2 = multiply(1 - E_LOSS, subtract(v2, multiply((im22 * dot2) / dist, rp2)));

        const [deltaPos1, deltaPos2] = await Promise.all([
            multiply((im1 / (im1 + im2)) * 1.000000001, mtv),
            multiply((im2 / (im1 + im2)) * 1.000000001, mtv)]);

        b1.move(deltaPos1);
        b2.move(deltaPos2);

        Promise.all([
            b1.setVelocity(dv1),
            b2.setVelocity(dv2)])
            .then(() => true);
    }
    return Promise.resolve(false);
}


export { handleGravity, handleWallCollisions, handleBallCollisions };

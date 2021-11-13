import Ball from "./Ball";
import Vector, {
    subtract, multiply, divide, dotProduct,
} from "../graphics/Vector";

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

async function handleGravity(b1: Ball, b2: Ball, FPS: number, GC: number): Promise<void> {
    return Promise.all([
        (b1.getMass() * b2.getMass()) / distanceSquared(b1.getPosition(), b2.getPosition()),
        normalize(subtract(b2.getPosition(), b1.getPosition())),
    ])
        .then(([Fg, direction]) => Promise.all([
            multiply(((GC * Fg) / b1.getMass()) / FPS, direction),
            multiply(((GC * -Fg) / b2.getMass()) / FPS, direction)]))
        .then(([deltaV1, deltaV2]) => Promise.all([
            b1.accelerate(deltaV1),
            b2.accelerate(deltaV2)]))
        .then();
}

function determineMTVHorizontal(b: Ball, w: number): number {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();
    if (pos.x + r > w) {
        return -1 * (pos.x + r - w);
    }

    return -1 * (pos.x - r);
}

function determineMTVVertical(b: Ball, h: number): number {
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
        return Promise.resolve(determineMTVHorizontal(b, w))
            .then((mtv) => Promise.all([
                b.popTrailPoints(),
                b.popTrailPoints(),
                b.addTrailPoint({ x: b.getPosition().x + mtv, y: b.getPosition().y }),
                b.move({ x: mtv, y: b.getVelocity().y / FPS }),
                b.setVelocity({ x: -b.getVelocity().x, y: b.getVelocity().y }),
            ]).then(() => true));
    }
    if (pos.y + r > h || pos.y - r < 0) {
        return Promise.resolve(determineMTVVertical(b, h))
            .then((mtv) => Promise.all([
                b.popTrailPoints(),
                b.popTrailPoints(),
                b.addTrailPoint({ x: b.getPosition().x, y: b.getPosition().y + mtv }),
                b.move({ x: b.getVelocity().x / FPS, y: mtv }),
                b.addTrailPoint(b.getPosition()),
                b.setVelocity({ x: b.getVelocity().x, y: -b.getVelocity().y }),
            ]).then(() => false));
    }

    return Promise.resolve(false);
}

function determineMTV2D(b1: Ball, b2: Ball): Vector {
    const relativePos = subtract(b2.getPosition(), b1.getPosition());
    const intersectionMagnitude = Math.sqrt(magnitudeSquared(relativePos));

    return multiply(
        (b1.getRadius() + b2.getRadius() - intersectionMagnitude) / intersectionMagnitude,
        relativePos,
    );
}

async function handleBallCollisions(
    b1: Ball,
    b2: Ball,
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
        const mtv = determineMTV2D(b1, b2);

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
        const dv1 = multiply((-im11 * dot1) / dist, rp1);
        const dv2 = multiply((-im22 * dot2) / dist, rp2);

        const [deltaPos1, deltaPos2] = await Promise.all([
            multiply((im1 / (im1 + im2)) * 1.000000001, mtv),
            multiply((im2 / (im1 + im2)) * 1.000000001, mtv)]);

        b1.move(deltaPos1);
        b2.move(deltaPos2);

        return Promise.all([
            b1.accelerate(dv1),
            b2.accelerate(dv2),
        ])
            .then(() => true);
    }
    return Promise.resolve(false);
}


export { handleGravity, handleWallCollisions, handleBallCollisions };

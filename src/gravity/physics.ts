import { relative } from "path";
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


function handleGravity(b1: Ball, b2: Ball, FPS: number, GC: number): void {
    /*

    F = ma
    F = m (delta v) / t
    F * t = = m * delta v
    delta v = F * t / m

    Fg = G * M1* M2 / R^2
        where G = the universal gravitation constant
    */

    const Fg: number = (b1.getMass() * b2.getMass())
                        / distanceSquared(b1.getPosition(), b2.getPosition());

    const normalizedDirection: Vector = normalize(subtract(b2.getPosition(), b1.getPosition()));

    b1.accelerate(multiply(((GC * Fg) / b1.getMass()) / FPS, normalizedDirection));
    b2.accelerate(multiply(((GC * -Fg) / b2.getMass()) / FPS, normalizedDirection));
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

async function handleWallCollisions(b: Ball, w: number, h: number): Promise<void> {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();

    if (pos.x + r >= w || pos.x - r <= 0) {
        determineMTVHorizontal(b, w).then((mtv) => new Promise(() => {
            b.move({ x: mtv, y: 0 });
            b.setVelocity({ x: -b.getVelocity().x, y: b.getVelocity().y });
        }));
    }
    if (pos.y + r > h || pos.y - r < 0) {
        determineMTVVertical(b, h).then((mtv) => new Promise(() => {
            b.move({ x: 0, y: mtv });
            b.setVelocity({ x: b.getVelocity().x, y: -b.getVelocity().y });
        }));
    }
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
): Promise<void> {
    const relativePos: Vector = subtract(b2.getPosition(), b1.getPosition());
    const relativeVel: Vector = subtract(b2.getVelocity(), b1.getVelocity());
    const dot: number = dotProduct(relativePos, relativeVel);
    const centerDistSquared = distanceSquared(
        b1.getPosition(),
        b2.getPosition(),
    );

    const radiusSum = (b1.getRadius() + b2.getRadius());


    if (dot < 0 && centerDistSquared < radiusSum ** 2) {
        const mtv = await determineMTV2D(b1, b2);

        const [im1, im2] = await Promise.all([1 / b1.getMass(), 1 / b2.getMass()]);

        const [deltaPos1, deltaPos2] = await Promise.all([
            multiply((im1 / (im1 + im2)) * -1.0001, mtv),
            multiply((im2 / (im1 + im2)) * 1.0001, mtv)]);

        b1.move(deltaPos1);
        b2.move(deltaPos2);

        const v = await Promise.resolve(subtract(b1.getVelocity(), b2.getVelocity()));
        const vn = await Promise.resolve(dotProduct(normalize(v), normalize(mtv)));
        const impulseMag = await Promise.resolve((vn * (1 - E_LOSS)) / (im1 + im2));
        const impulse = await Promise.resolve(multiply(
            -impulseMag,
            normalize(relativePos),
        ));
        const [deltaV1, deltaV2] = await Promise.all([
            divide(-b1.getMass(), impulse),
            divide(b2.getMass(), impulse)]);

        return new Promise(() => {
            b1.accelerate(deltaV1);
            b2.accelerate(deltaV2);
        });
    }
    return Promise.resolve();
}


export { handleGravity, handleWallCollisions, handleBallCollisions };

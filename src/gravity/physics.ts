import Ball from "./Ball";
import Vector, {
    subtract, multiply, divide, dotProduct,
} from "../graphics/Vector";

function distanceSquared(v1: Vector, v2: Vector): number {
    return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2;
}

function normalize(v: Vector): Vector {
    const mag = Math.sqrt(v.x ** 2 + v.y ** 2);
    return divide(mag, v);
}

const GC = 1; // gravitation constant

function handleGravity(b1: Ball, b2: Ball, fps: number): void {
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

    b1.accelerate(multiply(((GC * Fg) / b1.getMass()) / fps, normalizedDirection));
    b2.accelerate(multiply(((GC * -Fg) / b2.getMass()) / fps, normalizedDirection));
}

function handleWallCollisions(b: Ball, w: number, h: number, fps: number): void {
    const pos: Vector = b.getPosition();
    const r: number = b.getRadius();

    if (pos.x + r > w || pos.x - r < 0) {
        b.move(divide(fps, { x: b.getVelocity().x * -1, y: 0 }));
        b.setVelocity({ x: -b.getVelocity().x, y: b.getVelocity().y });
    }
    if (pos.y + r > h || pos.y - r < 0) {
        b.move(divide(fps, { x: 0, y: b.getVelocity().y * -1 }));
        b.setVelocity({ x: b.getVelocity().x, y: -b.getVelocity().y });
    }
}

function handleBallCollisions(b1: Ball, b2: Ball, FPS: number): void {
    const relativePos: Vector = subtract(b2.getPosition(), b1.getPosition());
    const relativeVel: Vector = subtract(b2.getVelocity(), b1.getVelocity());

    const dot: number = dotProduct(relativePos, relativeVel);

    const E_LOSS = 0.1;

    const centerDistSquared = distanceSquared(
        b1.getPosition(),
        b2.getPosition(),
    );

    const radiusSumSquared = (b1.getRadius() + b2.getRadius()) ** 2;

    if (dot < 0 && centerDistSquared < radiusSumSquared) {
        const massSum: number = b1.getMass() + b2.getMass();

        b1.move(divide(-FPS, b1.getVelocity()));
        b2.move(divide(-FPS, b1.getVelocity()));

        const deltaV1: Vector = multiply(
            (
                (((-2 * b2.getMass()) / massSum) / centerDistSquared)
                    * dotProduct(
                        subtract(b1.getVelocity(), b2.getVelocity()),
                        subtract(b1.getPosition(), b2.getPosition()),
                    )
            ),
            subtract(b1.getPosition(), b2.getPosition()),
        );

        const deltaV2: Vector = multiply(
            (
                (((-2 * b1.getMass()) / massSum) / centerDistSquared)
                    * dotProduct(
                        subtract(b2.getVelocity(), b1.getVelocity()),
                        subtract(b2.getPosition(), b1.getPosition()),
                    )
            ),
            subtract(b2.getPosition(), b1.getPosition()),
        );

        b1.accelerate(multiply(1 - E_LOSS, deltaV1));
        b2.accelerate(multiply(1 - E_LOSS, deltaV2));
    }
}


export { handleGravity, handleWallCollisions, handleBallCollisions };

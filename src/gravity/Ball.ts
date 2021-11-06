import Circle from "../graphics/Circle";
import Line from "../graphics/Line";
import Vector, { add as Vadd } from "../graphics/Vector";
import Color from "../graphics/Color";

const TRAIL_LIFETIME = 100;

class Ball extends Circle {
    constructor(r: number) {
        super(r);
        this.mass = (4 / 3) * r * r * r * Math.PI;
        this.trail = new Line();
        this.trail.setLineThickness(this.getRadius() / 3);
        this.trail.setLineCap("round");
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);

        if (this.trail.vertices.length > TRAIL_LIFETIME) {
            this.trail.vertices.shift();
        }
        this.trail.vertices.push(this.position);

        this.trail.draw(ctx);
    }

    public setFillColor(color: Color) {
        super.setFillColor(color);
        this.trail.setLineColor(color);
    }

    public getVelocity(): Vector {
        return this.velocity;
    }

    public setVelocity(velocity: Vector): void {
        this.velocity = velocity;
    }

    public accelerate(accel: Vector): void {
        this.velocity = Vadd(this.velocity, accel);
    }

    public getMass(): number {
        return this.mass;
    }

    private velocity: Vector = { x: 0, y: 0 };

    private mass: number;

    private trail: Line;
}

export default Ball;

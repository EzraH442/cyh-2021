import Circle from "../graphics/Circle";
import Line from "../graphics/Line";
import Vector, { add as Vadd } from "../graphics/Vector";
import Color from "../graphics/Color";

class Ball extends Circle {
    constructor(r: number, FPS: number) {
        super(r);
        this.mass = (4 / 3) * r * r * r * Math.PI;
        this.trail = new Line();
        this.trail.setLineThickness(this.getRadius() / 3);
        this.trail.setLineCap("round");
        this.trailLifetime = FPS;
    }

    public drawTrail(ctx: CanvasRenderingContext2D): Promise<void> {
        return Promise.resolve(this.trail.draw(ctx));
    }

    public drawCircle(ctx: CanvasRenderingContext2D): Promise<void> {
        return Promise.resolve(super.draw(ctx));
    }

    public addTrailPoint(point: Vector): void {
        if (this.trail.vertices.length > this.trailLifetime) {
            this.trail.vertices.shift();
        }
        this.trail.vertices.push(point);
    }

    public popTrailPoints(): void {
        if (this.trail.vertices.length > 0) this.trail.vertices.pop();
    }

    public setFillColor(color: Color): void {
        super.setFillColor(color);
        this.trail.setLineColor(color);
    }

    public setTrailLifetime(trailLifetime: number): void {
        this.trailLifetime = trailLifetime;
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

    private trailLifetime: number;
}

export default Ball;

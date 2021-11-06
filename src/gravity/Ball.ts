import Circle from "../graphics/Circle";
import Vector, {add as Vadd} from "../graphics/Vector";

class Ball extends Circle {

    constructor(r: number) {
        super(r);
        this.mass = 4/3 * r*r*r * Math.PI;
    }

    public getVelocity(): Vector {
        return this.velocity;
    }

    public setVelocity(velocity: Vector): void {
        this.velocity = velocity
    }

    public accelerate(accel: Vector): void {
        this.velocity = Vadd(this.velocity, accel);
    }

    public getMass(): number {
        return this.mass;
    }

    private velocity: Vector = {x: 0, y: 0};
    private mass: number;
}

export default Ball;
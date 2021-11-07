import Color, { Colors, randomColor } from "../graphics/Color";
import Drawable from "../graphics/Drawable";
import Circle from "../graphics/Circle";
import Line from "../graphics/Line";
import Vector, { subtract as Vsubtract } from "../graphics/Vector";
import Ball from "./Ball";

class TempBall extends Drawable {
    constructor(pos: Vector, radius: number) {
        super();
        this.circle = new Circle(radius);
        this.circle.setFillColor(Colors.White);
        this.circle.setPosition(pos);
        this.tempLine = new Line(2);
        this.tempLine.setLineThickness(1);
        this.tempLine.vertices[0] = pos;
        this.tempLine.vertices[1] = pos;
    }

    public toBall(FPS: number): Ball {
        const newBall: Ball = new Ball(this.circle.getRadius(), FPS);

        newBall.setPosition(this.circle.getPosition());
        newBall.setVelocity(Vsubtract(
            this.tempLine.vertices[0],
            this.tempLine.vertices[1],
        ));

        newBall.setFillColor(randomColor());
        return newBall;
    }

    public changeRadius(deltaR: number): void {
        if (deltaR + this.circle.getRadius() >= 0) {
            this.circle.setRadius(this.circle.getRadius() + deltaR);
        }
    }

    public setCirclePos(newPos: Vector): void {
        this.circle.setPosition(newPos);
        this.tempLine.vertices[0] = newPos;
        this.tempLine.vertices[1] = newPos;
    }

    public getCirlceRadius(): number {
        return this.circle.getRadius();
    }

    public setEndpointPos(newPos: Vector): void {
        this.tempLine.vertices[1] = newPos;
    }

    public setFillColor(fillColor: Color): void {
        this.circle.setFillColor(fillColor);
        this.tempLine.setLineColor(fillColor);
    }

    public async draw(ctx: CanvasRenderingContext2D): Promise<void> {
        return new Promise(() => {
            this.tempLine.draw(ctx);
            this.circle.draw(ctx);
        });
    }

    private circle: Circle;

    private tempLine: Line;
}

export default TempBall;

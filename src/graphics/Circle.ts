import Shape from "./Shape";

export default class Circle extends Shape {
    constructor(radius = 0) {
        super();
        this.radius = radius;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.fillColor.hexCode;

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        if (this.outlineThickness > 0) {
            ctx.lineWidth = this.outlineThickness;
            ctx.strokeStyle = this.outlineColor.hexCode;

            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y,
                this.radius, 0, 2 * Math.PI);

            ctx.stroke();
        }
    }

    public getRadius(): number {
        return this.radius;
    }

    public setRadius(radius: number): void {
        this.radius = radius;
    }

    private radius: number;
}

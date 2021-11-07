import Color, { Colors } from "./Color";
import Drawable from "./Drawable";
import Vector from "./Vector";

type LineCap = "butt" | "round" | "square";

class Line extends Drawable {
    constructor(length?: number) {
        super();
        if (length) this.vertices.fill({ x: 0, y: 0 }, 0, length - 1);
    }

    public vertices: Vector[] = [];

    public async draw(ctx: CanvasRenderingContext2D): Promise<void> {
        return new Promise(() => {
            ctx.beginPath();
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
            ctx.strokeStyle = this.lineColor.hexCode;
            ctx.lineWidth = this.lineThickness;
            ctx.lineCap = this.lineCap;
            for (let i = 1; i < this.vertices.length; i++) {
                ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            ctx.stroke();
        });
    }

    public getLineColor(): Color {
        return this.lineColor;
    }

    public setLineColor(lineColor: Color): void {
        this.lineColor = lineColor;
    }

    public getLineThickness(): number {
        return this.lineThickness;
    }

    public setLineThickness(lineThickness: number): void {
        this.lineThickness = lineThickness;
    }

    public setLineCap(lineCap: LineCap): void {
        this.lineCap = lineCap;
    }

    private lineColor: Color = Colors.White;

    private lineThickness = 1;

    private lineCap: LineCap = "butt";
}

export default Line;

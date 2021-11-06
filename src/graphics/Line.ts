import Color, { Colors } from "./Color";
import Drawable from "./Drawable";
import Vector from "./Vector";

class Line extends Drawable {

    constructor(length?: number) {
        super();
        if (length) this.vertices.fill({x: 0, y:0}, 0, length-1);
    }

    public vertices: Vector[] = [];

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        ctx.strokeStyle=this.lineColor.hexCode;
        ctx.lineWidth = this.lineThickness;

        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y)
        }

        ctx.stroke();
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
    
    private lineColor: Color = Colors.White;
    
    private lineThickness: number = 1;

}

export default Line;

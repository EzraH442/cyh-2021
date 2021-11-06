import Drawable from "./Drawable";
import Vector, { add as Vadd } from "./Vector";
import Color, { Colors } from "./Color";

abstract class Shape extends Drawable {
    public setFillColor(c : Color): void {
        this.fillColor = c;
    }

    public getFillColor(): Color {
        return this.fillColor;
    }

    public setOutlineColor(c : Color): void {
        this.outlineColor = c;
    }

    public getOutlineColor(): Color {
        return this.outlineColor;
    }

    public setOutlineThickness(thickness: number): void {
        this.outlineThickness = thickness;
    }

    public getOutlineThickness(): number {
        return this.outlineThickness;
    }

    public setPosition(pos: Vector): void {
        this.position = pos;
    }

    public getPosition(): Vector {
        return this.position;
    }

    public move(offset: Vector): void {
        this.position = Vadd(this.position, offset);
    }

    protected fillColor: Color = Colors.White;

    protected outlineColor: Color = Colors.White;

    protected outlineThickness = 0;

    protected position: Vector = { x: 0, y: 0 };
}

export default Shape;

abstract class Drawable {
    abstract draw(ctx: CanvasRenderingContext2D): Promise<void>;
}

export default Drawable;

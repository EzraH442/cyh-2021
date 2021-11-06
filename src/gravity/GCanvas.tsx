import React from "react";
import Ball from "./Ball";
import Color, { Colors } from "../graphics/Color";
import { handleBallCollisions, handleGravity, handleWallCollisions } from "./physics";

type GProps = {
    width: number,
    height: number
};

type GState = {
    balls: Ball[],
    intervalID: number | null
};

const FPS = 100;
const FILL_COLOR: Color = Colors.Black;

class GCanvas extends React.Component<GProps, GState> {
    constructor(props: GProps) {
        super(props);

        const test1 = new Ball(10);
        const test2 = new Ball(20);

        test1.setPosition({ x: 100, y: 100 });
        test1.setVelocity({ x: 0, y: 1 });
        test2.setPosition({ x: 600, y: 100 });
        this.state = {
            balls: [test1, test2],
            intervalID: null,
        };
        this.canvasRef = React.createRef<HTMLCanvasElement>();
    }

    componentDidMount(): void {
        const canvas = this.canvasRef.current;
        const context = canvas?.getContext("2d");

        const intervalID = (context)
            ? window.setInterval((() => this.update(context)), 1000 / FPS) as unknown as number
            : null;

        this.setState({ intervalID });

        this.render();
    }

    componentWillUnmount(): void {
        const { intervalID } = this.state;

        if (intervalID) clearInterval(intervalID);

        this.setState({ intervalID: null });
    }

    canvasRef;

    clearScreen = (ctx: CanvasRenderingContext2D): void => {
        const { width, height } = this.props;

        ctx.fillStyle = FILL_COLOR.hexCode;
        ctx.fillRect(0, 0, width, height);
    }

    update = (ctx: CanvasRenderingContext2D) => {
        this.clearScreen(ctx);

        const { balls } = this.state;
        const { width, height } = this.props;
        let b1: Ball;
        let b2: Ball;

        for (let i = 0; i < balls.length; i++) {
            b1 = balls[i];
            b1.move(b1.getVelocity());

            handleWallCollisions(b1, width, height, FPS);

            for (let j = i + 1; j < balls.length; j++) {
                b2 = balls[j];
                handleGravity(b1, b2, FPS);
                handleBallCollisions(b1, b2, FPS);
            }

            b1.draw(ctx);
        }
    };

    pause = (): void => {
        const { intervalID } = this.state;

        if (intervalID) clearInterval(intervalID);

        this.setState({ intervalID: null });
    }

    render(): JSX.Element {
        return (
            <canvas
                ref={this.canvasRef}
                {...this.props}
            />
        );
    }
}

export default GCanvas;

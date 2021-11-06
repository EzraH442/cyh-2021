import React from "react";
import Ball from "./Ball";
import TempBall from "./TempBall";
import { handleBallCollisions, handleGravity, handleWallCollisions } from "./physics";

import Vector from "../graphics/Vector";
import Color, { Colors } from "../graphics/Color";

type GProps = {
    width: number,
    height: number
};


type GState = {
    balls: Ball[],
    tempBall: TempBall | null,
    intervalID: number | null,
    worldData: {
        isCreatingNewBall: boolean
        isMovingNewBall: boolean,
        isMovingEndpoint: boolean,
        previousBallRadius: number,
    }
    pressedKeys: Set<string>
};

const FPS = 100;
const FILL_COLOR: Color = Colors.Black;
const MOUSE_LEFT = 0;

class GCanvas extends React.Component<GProps, GState> {
    constructor(props: GProps) {
        super(props);

        this.state = {
            balls: [],
            tempBall: null,
            intervalID: null,
            worldData: {
                isCreatingNewBall: false,
                isMovingNewBall: false,
                isMovingEndpoint: false,
                previousBallRadius: 10,
            },
            pressedKeys: new Set(),
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

        window.addEventListener("mousedown", this.clickDownHandler);
        window.addEventListener("mouseup", this.clickUpHandler);
        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);
        window.addEventListener("wheel", this.mouseScrollHandler);
        window.addEventListener("mousemove", this.mouseMoveHandler);
        this.render();
    }

    componentWillUnmount(): void {
        const { intervalID } = this.state;

        if (intervalID) clearInterval(intervalID);

        this.setState({ intervalID: null });

        window.removeEventListener("mousedown", this.clickDownHandler);
        window.removeEventListener("mouseup", this.clickUpHandler);
        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
        window.removeEventListener("wheel", this.mouseScrollHandler);
        window.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    // Utility Methods

    setKeyPress = (key: string): void => {
        const { pressedKeys } = this.state;
        pressedKeys.add(key);
        this.setState({ pressedKeys });
    }

    removeKeyPress = (key: string): void => {
        const { pressedKeys } = this.state;
        pressedKeys.delete(key);
        this.setState({ pressedKeys });
    }

    clearScreen = (ctx: CanvasRenderingContext2D): void => {
        const { width, height } = this.props;

        ctx.fillStyle = FILL_COLOR.hexCode;
        ctx.fillRect(0, 0, width, height);
    }

    addTempBall = (pos: Vector) => {
        const { worldData } = this.state;

        const tempBall = new TempBall(pos, worldData.previousBallRadius);

        worldData.isCreatingNewBall = true;
        this.setState({ tempBall, worldData });
    }

    addTempDrawableToDrawables = () => {
        const { tempBall, balls, worldData } = this.state;

        if (tempBall === null) return;

        const newBall = tempBall.toBall();
        balls.push(newBall);

        worldData.isCreatingNewBall = false;

        this.setState({ balls, tempBall: null, worldData });
    }

    // Event Handling

    clickDownHandler = (e: globalThis.MouseEvent) => {
        if (e.button !== MOUSE_LEFT) return;

        const { worldData, pressedKeys } = this.state;

        if (!worldData.isCreatingNewBall) {
            const mousePos: Vector = {
                x: e.clientX,
                y: e.clientY,
            };
            this.addTempBall(mousePos);
        }
        else if (!pressedKeys.has("Shift")) {
            worldData.isMovingNewBall = true;
            this.setState({ worldData });
        }
        else {
            worldData.isMovingEndpoint = true;
            this.setState({ worldData });
        }
    }

    clickUpHandler = (e: globalThis.MouseEvent) => {
        const { worldData } = this.state;

        if (e.button !== MOUSE_LEFT || !worldData.isCreatingNewBall) return;

        if (worldData.isMovingNewBall) {
            worldData.isMovingNewBall = false;
            this.setState({ worldData });
        }
        else if (worldData.isMovingEndpoint) {
            worldData.isMovingEndpoint = true;
            this.setState({ worldData });
        }
    }

    mouseMoveHandler = (e: globalThis.MouseEvent) => {
        const { tempBall, worldData } = this.state;

        if (worldData.isCreatingNewBall) {
            const mousePos: Vector = {
                x: e.clientX,
                y: e.clientY,
            };
            if (worldData.isMovingNewBall) {
                tempBall?.setCirclePos(mousePos);
            }
            else if (worldData.isMovingEndpoint) {
                tempBall?.setEndpointPos(mousePos);
            }
        }
    }

    mouseScrollHandler = (e: globalThis.WheelEvent) => {
        const { tempBall, worldData } = this.state;

        if (worldData.isCreatingNewBall) {
            tempBall?.changeRadius(e.deltaY / 50);
        }
    }

    keyDownHandler = (e: globalThis.KeyboardEvent) => {
        this.setKeyPress(e.key);
    }

    keyUpHandler = (e: globalThis.KeyboardEvent) => {
        this.removeKeyPress(e.key);
    }

    update = (ctx: CanvasRenderingContext2D) => {
        this.clearScreen(ctx);

        const {
            balls, tempBall, pressedKeys, worldData,
        } = this.state;
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

        if (worldData.isCreatingNewBall) {
            tempBall?.draw(ctx);
        }

        if (pressedKeys.has("Enter") && worldData.isCreatingNewBall) {
            this.addTempDrawableToDrawables();
        }
    };

    pause = (): void => {
        const { intervalID } = this.state;

        if (intervalID) clearInterval(intervalID);

        this.setState({ intervalID: null });
    }

    canvasRef;

    render(): JSX.Element {
        return (
            <canvas
                ref={this.canvasRef}
                tabIndex={0}
                {...this.props}
            />
        );
    }
}

export default GCanvas;

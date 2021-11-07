import React from "react";
import Ball from "./Ball";
import TempBall from "./TempBall";
import { handleBallCollisions, handleGravity, handleWallCollisions } from "./physics";

import Vector, { divide as Vdivide } from "../graphics/Vector";
import Color from "../graphics/Color";

type GProps = {
    width: number,
    height: number
    FPS: number,
    fillColor: Color,
    constants: {
        GC: number,
        E_LOSS_COLLISION: number,
        MAX_RADIUS: number,
    }
    isPaused: boolean,
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
        const { FPS } = this.props;

        this.restartWithFPS(FPS);

        window.addEventListener("mousedown", this.clickDownHandler);
        window.addEventListener("mouseup", this.clickUpHandler);
        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);
        window.addEventListener("wheel", this.mouseScrollHandler);
        window.addEventListener("mousemove", this.mouseMoveHandler);
        this.render();
    }

    componentDidUpdate(prevProps: GProps): void {
        const { FPS, isPaused } = this.props;

        if (prevProps.isPaused === true && isPaused === false) {
            this.restartWithFPS(FPS);
        }
        else if (prevProps.isPaused === false && isPaused === true) {
            this.stop();
        }
        else if (prevProps.FPS !== FPS) {
            this.restartWithFPS(FPS);
        }
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
        const { width, height, fillColor } = this.props;

        ctx.fillStyle = fillColor.hexCode;
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
        const { FPS } = this.props;
        if (tempBall === null) return;

        const newBall = tempBall.toBall(FPS);
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
            worldData.isMovingEndpoint = false;
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
        const { constants } = this.props;

        if (tempBall && worldData.isCreatingNewBall
            && tempBall.getCirlceRadius() + e.deltaY / 50 < constants.MAX_RADIUS) {
            tempBall.changeRadius(e.deltaY / 50);
        }
    }

    keyDownHandler = (e: globalThis.KeyboardEvent) => {
        this.setKeyPress(e.key);
    }

    keyUpHandler = (e: globalThis.KeyboardEvent) => {
        this.removeKeyPress(e.key);
    }

    update = async (ctx: CanvasRenderingContext2D) => {
        this.clearScreen(ctx);

        const {
            balls, tempBall, pressedKeys, worldData,
        } = this.state;
        const {
            width, height, FPS, constants,
        } = this.props;
        let b1: Ball;
        let b2: Ball;

        const physicsEvents: Promise<void>[] = [];
        const drawBallEvents: Promise<void>[] = [];
        const drawTrailEvents: Promise<void>[] = [];

        for (let i = 0; i < balls.length; i++) {
            b1 = balls[i];
            b1.move(Vdivide(FPS, b1.getVelocity()));

            physicsEvents.push(handleWallCollisions(b1, width, height));

            for (let j = i + 1; j < balls.length; j++) {
                b2 = balls[j];
                physicsEvents.push(handleGravity(b1, b2, FPS, constants.GC));
                physicsEvents.push(handleBallCollisions(b1, b2, FPS));
            }

            const [drawBallPromise, drawTailPromise] = b1.getDrawPromises(ctx);
            drawBallEvents.push(drawBallPromise);
            drawTrailEvents.push(drawTailPromise);
        }


        if (tempBall && worldData.isCreatingNewBall) {
            drawBallEvents.push(tempBall.draw(ctx));
        }

        if (pressedKeys.has("Enter") && worldData.isCreatingNewBall) {
            this.addTempDrawableToDrawables();
        }

        Promise.all(physicsEvents).then(() => {
            Promise.all(drawTrailEvents);
        }).then(() => {
            Promise.all(drawBallEvents);
        });
    };

    stop = (): void => {
        const { intervalID } = this.state;

        if (intervalID) clearInterval(intervalID);

        this.setState({ intervalID: null });
    }

    restartWithFPS = (FPS: number): void => {
        const canvas = this.canvasRef.current;
        const context = canvas?.getContext("2d");

        const intervalID = (context)
            ? window.setInterval((() => this.update(context)), 1000 / FPS) as unknown as number
            : null;


        const { balls } = this.state;

        for (let i = 0; i < balls.length; i++) {
            balls[i].setTrailLifetime(FPS);
        }
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ intervalID });
    }

    canvasRef;

    render(): JSX.Element {
        const { width, height } = this.props;

        return (
            <canvas
                ref={this.canvasRef}
                tabIndex={0}
                width={width}
                height={height}
            />
        );
    }
}

export default GCanvas;

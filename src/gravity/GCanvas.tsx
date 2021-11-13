import React from "react";
import styled from "styled-components";

import Ball from "./Ball";
import TempBall from "./TempBall";
import { handleBallCollisions, handleGravity, handleWallCollisions } from "./physics";

import Vector from "../graphics/Vector";
import { Colors } from "../graphics/Color";

type GProps = {
    width: number,
    height: number
    constants: {
        GC: number,
        E_LOSS_COLLISION: number,
    }
    isPaused: boolean,
    isPhysicsPaused: boolean
    isResetting: boolean // really just a signal, the boolean value switching is what triggers reset
    trailLength: number
};


type GState = {
    balls: Ball[],
    tempBall: TempBall | null,
    worldData: {
        isCreatingNewBall: boolean
        isMovingNewBall: boolean,
        isMovingEndpoint: boolean,
        previousBallRadius: number,
    }
    pressedKeys: Set<string>
};

const MOUSE_LEFT = 0;
const FILL_COLOR = Colors.Black;
const FPS = 100;

const StyledCanvas = styled.canvas<{width: number, height: number}>`
    border: 1px solid white;
    margin: 10px;
    width: ${(props) => `${props.width - 22}px`};
    height: ${(props) => `${props.height - 22}px`}
`;

function getMousePos(e: globalThis.MouseEvent): Vector {
    return {
        x: e.offsetX + 10,
        y: e.offsetY + 10,
    };
}

class GCanvas extends React.Component<GProps, GState> {
    constructor(props: GProps) {
        super(props);

        this.state = {
            balls: [],
            tempBall: null,
            worldData: {
                isCreatingNewBall: false,
                isMovingNewBall: false,
                isMovingEndpoint: false,
                previousBallRadius: 10,
            },
            pressedKeys: new Set(),
        };
        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.intervalID = null;
    }

    componentDidMount(): void {
        this.restart();

        this.canvasRef.current?.addEventListener("mousedown", this.clickDownHandler);
        this.canvasRef.current?.addEventListener("mouseup", this.clickUpHandler);
        this.canvasRef.current?.addEventListener("keydown", this.keyDownHandler);
        this.canvasRef.current?.addEventListener("keyup", this.keyUpHandler);
        this.canvasRef.current?.addEventListener("mousemove", this.mouseMoveHandler);

        globalThis.addEventListener("keydown", (e: globalThis.KeyboardEvent) => {
            if (e.code === "ArrowUp" || e.code === "ArrowDown") e.preventDefault(); // disable arrow key scrolling behaviour
        });

        this.render();
    }

    componentDidUpdate(prevProps: GProps): void {
        const { isPaused, isResetting, trailLength } = this.props;
        const { balls } = this.state;

        if (prevProps.isPaused === true && isPaused === false) {
            this.restart();
        }
        else if (prevProps.isPaused === false && isPaused === true) {
            this.stop();
        }
        else if (prevProps.isResetting !== isResetting) this.resetData();
        else if (prevProps.trailLength !== trailLength) {
            for (let i = 0; i < balls.length; i++) {
                balls[i].setTrailLifetime((trailLength * 100000) / FPS);
            }
        }
    }

    componentWillUnmount(): void {
        this.stop();

        this.canvasRef.current?.removeEventListener("mousedown", this.clickDownHandler);
        this.canvasRef.current?.removeEventListener("mouseup", this.clickUpHandler);
        this.canvasRef.current?.removeEventListener("keydown", this.keyDownHandler);
        this.canvasRef.current?.removeEventListener("keyup", this.keyUpHandler);
        this.canvasRef.current?.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    // Utility Methods

    resetData = (): void => {
        this.setState({
            balls: [],
            tempBall: null,
            worldData: {
                isCreatingNewBall: false,
                isMovingNewBall: false,
                isMovingEndpoint: false,
                previousBallRadius: 10,
            },
            pressedKeys: new Set(),
        });
    }

    putKeyPress = (key: string): void => {
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

    addTempDrawableToDrawables = async (): Promise<void> => {
        const { tempBall, balls, worldData } = this.state;
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
            const mousePos = getMousePos(e);
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
            const mousePos = getMousePos(e);
            if (worldData.isMovingNewBall) {
                tempBall?.setCirclePos(mousePos);
            }
            else if (worldData.isMovingEndpoint) {
                tempBall?.setEndpointPos(mousePos);
            }
        }
    }

    keyDownHandler = (e: globalThis.KeyboardEvent) => {
        this.putKeyPress(e.key);
    }

    keyUpHandler = (e: globalThis.KeyboardEvent) => {
        this.removeKeyPress(e.key);
    }

    doBallGravityPhysics = async (): Promise<void[]> => {
        const { balls } = this.state;
        const { constants } = this.props;

        const promises: Promise<void>[] = [];
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                promises.push(handleGravity(balls[i], balls[j], FPS, constants.GC));
            }
        }

        return Promise.all(promises);
    }

    drawTrails = async (ctx: CanvasRenderingContext2D): Promise<void[]> => {
        const { balls } = this.state;

        const promises: Promise<void>[] = [];
        for (let i = 0; i < balls.length; i++) {
            balls[i].addTrailPoint(balls[i].getPosition());
            promises.push(balls[i].drawTrail(ctx));
        }

        return Promise.all(promises);
    }

    update = async (ctx: CanvasRenderingContext2D) => {
        const {
            balls, tempBall, pressedKeys, worldData,
        } = this.state;
        const {
            width, height, constants, isPhysicsPaused,
        } = this.props;
        Promise.resolve(this.clearScreen(ctx))
            .then(async () => {
                if (!isPhysicsPaused) Promise.resolve(this.doBallGravityPhysics());
            })
            .then(async () => {
                Promise.resolve(this.drawTrails(ctx));
            })
            .then(async () => {
                if (!isPhysicsPaused) {
                    for (let i = 0; i < balls.length; i++) {
                        let foundCollision = false;
                        const b1 = balls[i];

                        b1.move({ x: b1.getVelocity().x / FPS, y: b1.getVelocity().y / FPS });
                        handleWallCollisions(b1, width, height, FPS)
                            .then((didCollide) => {
                                foundCollision = didCollide;
                            });

                        for (let j = i + 1; j < balls.length; j++) {
                            const b2 = balls[j];
                            let foundCollisionj = false;
                            handleBallCollisions(b1, b2, constants.E_LOSS_COLLISION)
                                .then((didCollide) => {
                                    foundCollisionj = didCollide;
                                });

                            if (foundCollisionj) foundCollision = true;
                        }
                        if (!foundCollision) {
                            b1.addTrailPoint(b1.getPosition());
                        }
                    }
                }
                for (let i = 0; i < balls.length; i++) {
                    const b = balls[i];
                    b.drawCircle(ctx);
                }

                if (tempBall && worldData.isCreatingNewBall) {
                    tempBall.draw(ctx);
                }

                if (worldData.isCreatingNewBall) {
                    if (pressedKeys.has("Enter")) {
                        await Promise.resolve(this.addTempDrawableToDrawables());
                    }
                    if (pressedKeys.has("ArrowUp")) {
                        await Promise.resolve(tempBall?.changeRadius(1));
                    }
                    if (pressedKeys.has("ArrowDown")) {
                        await Promise.resolve(tempBall?.changeRadius(-1));
                    }
                }
                this.intervalID = window.setTimeout(() => this.update(ctx), 1000 / FPS);
            });
    };

    stop = (): void => {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    restart = (): void => {
        const canvas = this.canvasRef.current;
        const context = canvas?.getContext("2d");

        this.intervalID = (context)
            ? window.setTimeout((() => this.update(context)), (1000 / FPS)) as unknown as number
            : null;
    }

    canvasRef;

    intervalID: number | null;

    render(): JSX.Element {
        const { width, height } = this.props;

        return (
            <StyledCanvas
                ref={this.canvasRef}
                tabIndex={0}
                width={width}
                height={height}
            />
        );
    }
}

export default GCanvas;

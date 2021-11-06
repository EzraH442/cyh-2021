type Vector = {
    x: number,
    y: number
}

function add(v1: Vector, v2: Vector): Vector {
    return {x: v1.x + v2.x, y: v1.y + v2.y}
}

function subtract(v1: Vector, v2: Vector): Vector {
    return {x: v1.x - v2.x, y: v1.y - v2.y}
}

function multiply(scalar: number, v: Vector): Vector {
    return {x: v.x*scalar, y:v.y*scalar}
}

function divide(scalar: number, v: Vector): Vector {
    return multiply(1/scalar, v);
}

function dotProduct(v1: Vector, v2:Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
}

export default Vector;
export {add, subtract, multiply, divide, dotProduct}

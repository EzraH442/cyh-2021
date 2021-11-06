class Color {
    hexCode: string;

    constructor(hexCode: string) {
        if (!hexCode.startsWith("#") || hexCode.length !== 7) {
            throw new Error(`${hexCode} is an invalid color`);
        }

        this.hexCode = hexCode;
    }
}

const Colors: Record<string, Color> = {
    White: new Color("#FFFFFF"),
    Black: new Color("#000000"),
    Red: new Color("#FF0000"),
    Green: new Color("#00FF00"),
    Blue: new Color("#0000FF"),
    Yellow: new Color("#FFFF00"),
    Cyan: new Color("#00FFFF"),
    Magenta: new Color("#FF00FF"),
};

function randomColor(): Color {
    return new Color(`#${(0x1000000 + Math.random() * 0xffffff)
        .toString(16)
        .substr(1, 6)}`);
}

export default Color;
export { Colors, randomColor };

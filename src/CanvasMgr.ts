import { GridState } from "./GameMgr";

interface ICanvasMgrOptions {
    width: number;
    height: number;
    backgroundColor: string;
    rootElement: HTMLElement;
    cellSize: number;
}

export default class CanvasMgr {
    rootElement: HTMLElement;
    width: number;
    height: number;
    cellSize: number;
    backgroundColor: string;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(options: ICanvasMgrOptions) {
        this.rootElement = options.rootElement;
        this.width = options.width;
        this.height = options.height;
        this.cellSize = options.cellSize;
        this.backgroundColor = options.backgroundColor;
        this.canvas = document.createElement("canvas");
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    }

    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = this.backgroundColor;
        this.rootElement.append(this.canvas);
    }

    drawBoard(boardState: GridState[][]) {
        boardState.forEach((row, y) => {
            row.forEach((cell, x) => {
                this.ctx.fillStyle = cell === GridState.Filled ? "red" : "black";
                this.ctx.strokeStyle = cell === GridState.Filled ? "white" : "black";

                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            });
        });
    }
}

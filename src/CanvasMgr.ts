import { ActivePiece, GridState } from "./GameMgr";

interface ICanvasMgrOptions {
    width: number;
    height: number;
    backgroundColor: string;
    rootElement: HTMLElement;
    cellSize: number;
    bufferSize: number;
    isDebug: boolean;
}

export default class CanvasMgr {
    rootElement: HTMLElement;
    width: number;
    height: number;
    cellSize: number;
    bufferSize: number;
    backgroundColor: string;
    isDebug: boolean;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    uiContainer: HTMLDivElement;
    pCtx: CanvasRenderingContext2D;
    ctx: CanvasRenderingContext2D;

    constructor(options: ICanvasMgrOptions) {
        this.rootElement = options.rootElement;
        this.width = options.width;
        this.height = options.height;
        this.cellSize = options.cellSize;
        this.bufferSize = options.bufferSize;
        this.backgroundColor = options.backgroundColor;
        this.canvas = document.createElement("canvas");
        this.uiContainer = document.createElement("div");
        this.previewCanvas = document.createElement("canvas");
        this.pCtx = <CanvasRenderingContext2D>this.previewCanvas.getContext('2d');
        this.isDebug = options.isDebug;
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    }

    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = "white";


        this.previewCanvas.height = this.cellSize * 4;
        this.previewCanvas.width = this.cellSize * 4;
        this.previewCanvas.style.backgroundColor = "black";

        this.uiContainer.style.marginTop = `${2 * this.cellSize}px`;
        const previewLabel = document.createElement('p')
        previewLabel.innerText = "Next piece:"

        this.uiContainer.append(previewLabel, this.previewCanvas);

        this.rootElement.append(this.canvas, this.uiContainer);
    }

    updateNextPiece(nextPiece: ActivePiece) {
        this.pCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height)
        nextPiece.data.forEach((row, y) => {
            row.forEach((c, x) => {
                this.pCtx.fillStyle = c.value === 1 ? c.color : 'black';
                this.pCtx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            })
        })
    }

    drawBoard(boardState: GridState[][]) {
        boardState.filter((_, idx) => idx >= this.bufferSize && idx < boardState.length - this.bufferSize)
            .forEach((row, y) => {
                if (y >= this.bufferSize && y <= boardState.length - this.bufferSize - 1) {
                    row.forEach((cell, x) => {
                        if (x >= this.bufferSize - 1 && x <= boardState[y].length - this.bufferSize - 1) {
                            this.ctx.fillStyle = cell.color;
                            this.ctx.fillRect(
                                x * this.cellSize,
                                y * this.cellSize,
                                this.cellSize,
                                this.cellSize
                            );
                            this.ctx.fillStyle = 'black';
                        }
                        // if (this.isDebug) {
                        //     this.ctx.fillStyle = (cell === GridState.Filled || cell === GridState.Player) ? "#00FFFF" : cell === GridState.Window ? "#6b003b" : "black";
                        // } else {
                        //     this.ctx.fillStyle = cell === GridState.Filled ? "#00FFFF" : "black";
                        // }

                    });
                }
            })
        // boardState;
    }
}

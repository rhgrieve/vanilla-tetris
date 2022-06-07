import Debug from "./Debug";
import Matrix from './Matrix';
import CanvasMgr from "./CanvasMgr";

const CELL_SIZE = 25;
const BUFFER_SIZE = 2;
const DEFAULT_WIDTH = CELL_SIZE * 10;
const DEFAULT_HEIGHT = CELL_SIZE * (20 + BUFFER_SIZE);
const DEFAULT_BACKGROUND = "black";
const TICK_SPEED = 200;

enum GameState {
    NotStarted,
    Dropping,
    WaitingForPiece,
}

export enum FillState {
    Empty,
    Player,
    Filled,
    Window
}

export interface GridState {
    type: FillState,
    color: string
}

enum Direction {
    Left,
    Right,
    Top,
    Bottom
}

export type ActivePiece = Matrix

export interface GamePiece {
    x: number,
    y: number,
    color: string,
    value: 0 | 1
}

interface GameOptions {
    rootElement: HTMLElement;
    width?: number;
    height?: number;
    isDebug: boolean;
}

interface PieceDefinition {
    color: string,
    shape: string,
}

const I_PIECE = {
    color: 'cyan',
    shape: `0 0 0 0\n1 1 1 1\n0 0 0 0\n0 0 0 0`
}
    

const J_PIECE = {
    color: 'blue',
    shape: `1 0 0\n1 1 1\n0 0 0`
}
    
const L_PIECE = {
    color: 'orange',
    shape: `0 0 1\n1 1 1\n0 0 0`
}
    

const O_PIECE = {
    color: 'yellow',
    shape: `1 1\n1 1`
}



export default class GameManager {
    root: HTMLElement;
    state: GameState;
    boardOptions: {
        width: number;
        height: number;
    };
    cellSize: number;
    bufferSize: number;
    canvasMgr: CanvasMgr;
    boardState: GridState[][];
    keyPressed: string | null;
    activePiece: ActivePiece;
    isDebug: boolean;
    debug: Debug;

    pieces = [I_PIECE, J_PIECE, L_PIECE, O_PIECE];

    EMPTY_CELL: GridState;
    WINDOW_CELL: GridState;

    constructor(options: GameOptions) {
        this.root = options.rootElement;
        this.state = GameState.NotStarted;
        this.boardOptions = {
            height: options.height || DEFAULT_HEIGHT,
            width: options.width || DEFAULT_WIDTH
        };
        this.cellSize = CELL_SIZE;
        this.bufferSize = BUFFER_SIZE;
        this.isDebug = options.isDebug || false;

        this.canvasMgr = new CanvasMgr({
            height: this.boardOptions.height,
            width: this.boardOptions.width,
            rootElement: this.root,
            cellSize: this.cellSize,
            bufferSize: this.bufferSize,
            isDebug: this.isDebug,
            backgroundColor: DEFAULT_BACKGROUND
        });

        this.EMPTY_CELL = { type: FillState.Empty, color: 'black' };
        this.WINDOW_CELL = { type: FillState.Window, color: this.isDebug ? 'gray' : 'black'}

        this.keyPressed = null;
        this.activePiece = new Matrix([]);
        this.debug = new Debug(this.root, this.activePiece);

        this.boardState = new Array<GridState>(this.boardOptions.height / this.cellSize)
            .fill(this.EMPTY_CELL)
            .map((_cell) =>
                new Array<GridState>(this.boardOptions.width / this.cellSize).fill(this.EMPTY_CELL)
            );

        
    }

    clearRow(y: number) {
        this.boardState[y] = new Array(this.boardOptions.width / this.cellSize).fill(this.EMPTY_CELL);
    }

    getRandomPiece() {
        const randomIndex = Math.floor(Math.random() * this.pieces.length);
        return this.pieces[randomIndex];
    }

    getMatrixFromPiece(piece: PieceDefinition) {
        return new Matrix(piece.shape.split('\n')
            .map((p, y) => p.split(' ')
                .map((n, x) => (<GamePiece>{
                    x: x,
                    y: y,
                    color: piece.color,
                    value: parseInt(n)
                }))))
    }

    clearWindowTiles() {
        this.boardState.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell.type === FillState.Window) {
                    this.boardState[y][x] = this.EMPTY_CELL;
                }
            })
        })
    }

    shiftAllFilledTilesDown() {
        this.boardState.forEach((row, y) => {
            row.forEach((c, x) => {
                if (c.type === FillState.Filled) {
                    const color = this.boardState[y][x].color;
                    this.boardState[y][x] = this.EMPTY_CELL;
                    if (y < this.boardState.length - 1) {
                        this.boardState[y + 1][x] = {
                            type: FillState.Filled,
                            color: color
                        };
                    }
                }
            })
        })
    }

    getCollisions(activeTetromino: ActivePiece) {
        const collisions = [];

        const solidBody = activeTetromino.data.flat().filter(p => p.value === 1)

        const rightmostX = Math.max(...solidBody.map(p => p.x))
        const allPiecesAtRightmostX = solidBody.filter(p => p.x === rightmostX);
        const isRightBorder = solidBody.some(p => p.x === this.boardState[p.y].length - 1)
        const isCollidingRight = isRightBorder || allPiecesAtRightmostX.some(p => this.boardState[p.y][p.x + 1].type === FillState.Filled)

        const leftmostX = Math.min(...solidBody.map(p => p.x))
        const allPiecesAtLeftmostX = solidBody.filter(p => p.x === leftmostX);
        const isLeftBorder = solidBody.some(p => p.x === 0)
        const isCollidingLeft = isLeftBorder || allPiecesAtLeftmostX.some(p => this.boardState[p.y][p.x - 1].type === FillState.Filled)

        const lowestY = Math.max(...solidBody.map(p => p.y))
        const allPiecesAtLowestY = solidBody.filter(p => p.y === lowestY)
        const isBottomBorder = solidBody.some(p => p.y === this.boardState.length - this.bufferSize - 1);
        const isCollidingBottom = isBottomBorder || allPiecesAtLowestY.some(p => this.boardState[p.y + 1][p.x].type === FillState.Filled)

        if (isCollidingRight) {
            collisions.push(Direction.Right);
        }
        if (isCollidingLeft) {
            collisions.push(Direction.Left);
        }
        if (isCollidingBottom) {
            collisions.push(Direction.Bottom);
        }

        return collisions;
    }

    handleFullRows() {
        for (let y = this.bufferSize - 1; y < this.boardState.length - this.bufferSize; y++) {
            if (y === this.boardState.length - 1 - this.bufferSize) {
                console.log(y)
            }
            if (this.boardState[y].every(c => c.type === FillState.Filled)) {
                this.clearRow(y);
                for (let z = y; z > 0 + 1; z--) {
                    for (let x = 0; x < this.boardState[z].length; x++) {
                        if (z > 0 && this.boardState[z-1][x].type !== FillState.Player) {
                            this.boardState[z][x] = this.boardState[z-1][x];
                        }
                    }
                }
            }
        }
    }

    shiftActiveTetromino(direction: Direction) {
        const activeTetromino = this.activePiece;
        const collisions = this.getCollisions(activeTetromino);

        this.state = collisions.includes(Direction.Bottom) ? GameState.WaitingForPiece : GameState.Dropping;

        const piecesToShift = activeTetromino
            .data
            .flat()
            .filter(p => {
                try {
                    return p.value === 1 || this.boardState[p.y][p.x].type !== FillState.Filled
                } catch (e) {
                    throw new Error(`failed accessing this.boardState[${p.y}][${p.x}]`)
                }
            })

        if (direction === Direction.Bottom && !collisions.includes(Direction.Bottom)) {
            piecesToShift.forEach(p => {
                this.boardState[p.y][p.x] = this.EMPTY_CELL;
                p.y = p.y + 1;
            })
        } else if (direction === Direction.Right && !collisions.includes(Direction.Right)) {
            piecesToShift.forEach(p => {
                this.boardState[p.y][p.x] = this.EMPTY_CELL;
                p.x = p.x + 1;
            })
        } else if (direction === Direction.Left && !collisions.includes(Direction.Left)) {
            piecesToShift.forEach(p => {
                this.boardState[p.y][p.x] = this.EMPTY_CELL;
                p.x = p.x - 1;
            })
        }

        this.clearWindowTiles();
        this.renderActivePiece();
        this.handleFullRows();
        this.canvasMgr.drawBoard(this.boardState);
    }

    rotateActiveTetromino() {
        const newPiece = this.activePiece.rotate90();
        console.log(newPiece.data.map(r => r.map(c => c.value).join(' ')).join('\n'))
        this.activePiece = newPiece;
        this.renderActivePiece();
        this.canvasMgr.drawBoard(this.boardState);
    }

    handleKeyDown(e: KeyboardEvent) {
        console.debug(`keydown: ${e.key}`)
        switch (e.key) {
            case 'ArrowRight':
                this.shiftActiveTetromino(Direction.Right);
                break;
            case 'ArrowLeft':
                this.shiftActiveTetromino(Direction.Left);
                break;
            case 'ArrowDown':
                this.shiftActiveTetromino(Direction.Bottom);
                break;
            case 'ArrowUp':
                this.rotateActiveTetromino();
                break;
        }
        this.draw();
    }

    handleKeyUp(_: KeyboardEvent) {
        this.keyPressed = null;
    }

    calculateMovement() {
        this.shiftActiveTetromino(Direction.Bottom);
    }

    renderActivePiece() {
        this.activePiece
            .data
            .flat()
            .forEach(piece => {
                if (piece.value === 1) {
                    if (this.boardState[piece.y][piece.x].type !== FillState.Filled) {
                        this.boardState[piece.y][piece.x] = {
                            type: FillState.Player,
                            color: piece.color,
                        };
                    }
                } else {
                    if (this.boardState[piece.y][piece.x].type !== FillState.Filled) {
                        this.boardState[piece.y][piece.x] = this.WINDOW_CELL;
                    }
                }
            })
        this.canvasMgr.drawBoard(this.boardState);
    }

    insertPiece(piece: PieceDefinition) {
        this.boardState.forEach((r, y) => {
            r.forEach((c, x) => {
                if (c.type === FillState.Player) {
                    this.boardState[y][x] = {
                        type: FillState.Filled,
                        color: c.color
                    }
                }
            })
        })

        this.activePiece = this.getMatrixFromPiece(piece)
        this.renderActivePiece();
    }

    // renderDebugWindow() {
    //     this.debugWindow = {
    //         panel: document.createElement('div'),
    //         activeCoordinates: document.createElement('p')
    //     }

    //     this.debugWindow.activeCoordinates.innerText = this.activePiece.map(p => {
    //         return `(${p.x},${p.y})`
    //     }).join(' ');

    //     this.debugWindow.panel.append(this.debugWindow.activeCoordinates);
    //     this.root.append(this.debugWindow.panel);
    // }

    // updateDebugWindow() {
    //     this.debugWindow.activeCoordinates.innerText = this.activePiece.map(p => {
    //         return `(${p.x},${p.y})`
    //     }).join(' ');
    // }

    setup() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        const startingPiece = this.getRandomPiece();
        this.insertPiece(startingPiece)
        this.canvasMgr.init();
        // if (this.isDebug) {
        //     this.debug.init();
        // }
    }

    update() {
        if (this.state === GameState.WaitingForPiece) {
            const randomPiece = this.getRandomPiece();
            this.insertPiece(randomPiece)
        }
        this.calculateMovement();
    }

    draw() {
        this.canvasMgr.drawBoard(this.boardState);
    }

    play() {
        if (this.state === GameState.NotStarted) {
            this.setup();
        }
        this.draw();
        setInterval(() => {
            this.update();
            this.draw();
        }, TICK_SPEED)
    }
}
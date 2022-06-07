import Debug from "./Debug";
import CanvasMgr from "./CanvasMgr";

const CELL_SIZE = 25;
const DEFAULT_WIDTH = CELL_SIZE * 10;
const DEFAULT_HEIGHT = CELL_SIZE * 20;
const DEFAULT_BACKGROUND = "black";
const TICK_SPEED = 500;

type Orientation = 0 | 90 | 180 | 270;

enum GameState {
    NotStarted,
    Dropping,
    WaitingForPiece,
}

export enum GridState {
    Empty,
    Filled
}

enum Piece {
    I,
    J,
    L,
    O,
    S,
    T,
    Z
}

enum Direction {
    Left,
    Right,
    Top,
    Bottom
}

// this.boardState[0][this.boardState[0].length / 2] = GridState.Filled;
//                 this.boardState[0][this.boardState[0].length / 2 + 1] = GridState.Filled;
//                 this.boardState[0][this.boardState[0].length / 2 - 1] = GridState.Filled;
//                 this.boardState[0][this.boardState[0].length / 2 - 2] = GridState.Filled;

export type ActivePiece = {
    orientation: Orientation,
    pieces: GamePiece[],
};

interface GamePiece {
    x: number,
    y: number
}

interface GameOptions {
    rootElement: HTMLElement;
    width?: number;
    height?: number;
    isDebug: boolean;
}

const I_PIECE = 
`0 0 0 0
1 1 1 1
0 0 0 0
0 0 0 0`

export default class GameManager {
    root: HTMLElement;
    state: GameState;
    boardOptions: {
        width: number;
        height: number;
    };
    cellSize: number;
    canvasMgr: CanvasMgr;
    boardState: GridState[][];
    keyPressed: string | null;
    activePiece: ActivePiece;
    isDebug: boolean;
    debug: Debug;
    // debugWindow: {
    //     panel: HTMLElement,
    //     activeCoordinates: HTMLElement
    // };

    constructor(options: GameOptions) {
        this.root = options.rootElement;
        this.state = GameState.NotStarted;
        this.boardOptions = {
            height: options.height || DEFAULT_HEIGHT,
            width: options.width || DEFAULT_WIDTH
        };
        this.cellSize = CELL_SIZE;
        this.isDebug = options.isDebug || false;

        this.canvasMgr = new CanvasMgr({
            height: this.boardOptions.height,
            width: this.boardOptions.width,
            rootElement: this.root,
            cellSize: this.cellSize,
            backgroundColor: DEFAULT_BACKGROUND
        });

        this.keyPressed = null;
        this.activePiece = {
            orientation: 0,
            pieces: []
        };
        this.debug = new Debug(this.root, this.activePiece);

        this.boardState = new Array<GridState>(this.boardOptions.height / this.cellSize)
            .fill(GridState.Empty)
            .map((_cell) =>
                new Array<GridState>(this.boardOptions.width / this.cellSize).fill(GridState.Empty)
            );
    }

    getActiveTetromino() {
        const activeTetromino = [];
        for (let y = 0; y < this.boardState.length; y++) {
            for (let x = 0; x < this.boardState[y].length; x++) {
                if (this.boardState[y][x] === GridState.Filled) {
                    activeTetromino.push({ x: x, y: y })
                }
            }
        }
        return activeTetromino;
    }

    getCollisions(activeTetromino: ActivePiece) {
        const collisions = [];

        const rightmostX = Math.max(...activeTetromino.pieces.map(p => p.x))
        const allPiecesAtRightmostX = activeTetromino.pieces.filter(p => p.x === rightmostX);
        const isRightBorder = activeTetromino.pieces.some(p => p.x === this.boardState[p.y].length - 1)
        const isCollidingRight = isRightBorder || allPiecesAtRightmostX.some(p => this.boardState[p.y][p.x + 1] === GridState.Filled)

        const leftmostX = Math.min(...activeTetromino.pieces.map(p => p.x))
        const allPiecesAtLeftmostX = activeTetromino.pieces.filter(p => p.x === leftmostX);
        const isLeftBorder = activeTetromino.pieces.some(p => p.x === 0)
        const isCollidingLeft = isLeftBorder || allPiecesAtLeftmostX.some(p => this.boardState[p.y][p.x - 1] === GridState.Filled)

        const lowestY = Math.max(...activeTetromino.pieces.map(p => p.y))
        const allPiecesAtLowestY = activeTetromino.pieces.filter(p => p.y === lowestY)
        const isBottomBorder = activeTetromino.pieces.some(p => p.y === this.boardState.length - 1);
        const isCollidingBottom = isBottomBorder || allPiecesAtLowestY.some(p => this.boardState[p.y + 1][p.x] === GridState.Filled)

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

    shiftActiveTetromino(direction: Direction) {
        const activeTetromino = <ActivePiece>this.activePiece;
        const collisions = this.getCollisions(activeTetromino);

        this.state = collisions.includes(Direction.Bottom) ? GameState.WaitingForPiece : GameState.Dropping;

        if (direction === Direction.Bottom && !collisions.includes(Direction.Bottom)) {
            activeTetromino.pieces.forEach(p => {
                this.boardState[p.y][p.x] = GridState.Empty;
                p.y = p.y + 1;
            })
        } else if (direction === Direction.Right && !collisions.includes(Direction.Right)) {
            activeTetromino.pieces.forEach(p => {
                this.boardState[p.y][p.x] = GridState.Empty;
                p.x = p.x + 1;
            })
        } else if (direction === Direction.Left && !collisions.includes(Direction.Left)) {
            activeTetromino.pieces.forEach(p => {
                this.boardState[p.y][p.x] = GridState.Empty;
                p.x = p.x - 1;
            })
        }

        this.renderActivePiece();
        this.canvasMgr.drawBoard(this.boardState);
    }

    rotateActiveTetromino() {
        let movementSpace;
        switch (this.activePiece.orientation) {
            case 0: {

            }
        }

            // this.activePiece.forEach(p => {
            //     this.boardState[p.y][p.x] = GridState.Empty;
            // })

            // this.activePiece[0].x += 2;
            // this.activePiece[0].y -= 2;
            // this.activePiece[1].x += 1;
            // this.activePiece[1].y -= 1;
            // this.activePiece[3].x -= 1;
            // this.activePiece[3].y += 1;

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
        this.activePiece?.pieces.forEach(piece => {
            this.boardState[piece.y][piece.x] = GridState.Filled;
        })
        this.canvasMgr.drawBoard(this.boardState);
    }

    insertPiece(piece: Piece) {
        switch (piece) {
            case Piece.I:
                this.activePiece = {
                    orientation: 0,
                    pieces: [
                        { x: this.boardState[0].length / 2 - 2, y: 0 },
                        { x: this.boardState[0].length / 2 - 1, y: 0 },
                        { x: this.boardState[0].length / 2, y: 0 },
                        { x: this.boardState[0].length / 2 + 1, y: 0 },
                    ]
                }
        }
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
        if (this.isDebug) {
            this.debug.init();
        }

        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        this.insertPiece(Piece.I)
        this.canvasMgr.init();
    }

    update() {
        if (this.state === GameState.WaitingForPiece) {
            this.insertPiece(Piece.I)
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
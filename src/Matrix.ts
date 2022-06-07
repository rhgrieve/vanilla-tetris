import {GamePiece} from './GameMgr'

export default class Matrix {
    data: GamePiece[][];

    constructor(data: GamePiece[][]) {
        this.data = data;
    }

    rotate90(): Matrix {
        const newMatrix: GamePiece[][] = [];

        this.data.forEach((row, y, arr) => {
            let newRow: GamePiece[] = [];
            row.forEach((c, x) => {
                const newX = y;
                const newY = arr.length - 1 - x;
                const newPiece = {
                    x: c.x,
                    y: c.y,
                    color: c.color,
                    value: arr[newY][newX].value
                }
                newRow.push(newPiece)
            })
            newMatrix.push(newRow);
        })

        return new Matrix(newMatrix);
    }
}
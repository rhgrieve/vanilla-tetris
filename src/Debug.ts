import { ActivePiece } from "GameMgr"

export default class Debug {
    root: HTMLElement
    activePiece: ActivePiece
    panel: HTMLElement
    activeCoords: {
        element: HTMLElement
        label: string
        text: string
    }

    constructor(root: HTMLElement, activePiece: ActivePiece) {
        this.root = root;
        this.activePiece = activePiece;
        this.panel = document.createElement('div');
        this.activeCoords = {
            element: document.createElement('div'),
            label: 'Active Coordinates',
            text: ""
        }
    }

    setupActiveCoords() {
        const label = document.createElement('p');
        label.innerText = this.activeCoords.label;
        const display = document.createElement('p');
        display.innerText = this.activeCoords.text;

        this.activeCoords.element.append(label, display);
        this.panel.append(this.activeCoords.element);
    }

    init() {
        this.setupActiveCoords();
        this.root.append(this.panel);
    }
}
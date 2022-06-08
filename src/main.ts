import "./style.css"

import GameMgr from "./GameMgr";

const game = new GameMgr({
  rootElement: <HTMLElement>document.getElementById("app"),
  isDebug: false,
});

game.play();

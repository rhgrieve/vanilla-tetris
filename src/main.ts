import GameMgr from "./GameMgr";

const game = new GameMgr({
  rootElement: <HTMLElement>document.getElementById("app")
});

game.play();

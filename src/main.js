import { Game } from './game.js';

window.onload = () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  game.start();
  console.log('Game started!');
};
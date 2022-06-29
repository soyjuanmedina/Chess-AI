import { Injectable } from '@angular/core';
import { Move } from "../interfaces/move.interface";

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  directionOffsets: Array<number> = [8, -8, 1, -1, 7, -7, 9, -9];
  numSquaresToEdge = [[]];
  moves: Array<Move>;

  constructor() { 
    this.preComputedMoveData();
    // this.generateSlideMovings(35, 'piece')
  }

  preComputedMoveData() {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let numNorth = y;
        let numSouth = 7 - y;
        let numWest = x;
        let numEast = 7 - x;

        let squereIndex = y * 8 + x + 1;
        let minNW = Math.min(numNorth, numWest);
        let minSE = Math.min(numSouth, numEast);
        let minNE = Math.min(numNorth, numEast);
        let minSW = Math.min(numSouth, numWest);

        this.numSquaresToEdge[squereIndex] = [
          numNorth,
          numSouth,
          numWest,
          numEast,
          minNW,
          minSE,
          minNE,
          minSW
        ]
      }
      
    }
  }

  generateMoves() {

  }

  generateSlideMovings(startSquare, piece) {
    startSquare = parseInt(startSquare. slice(2));
    console.log('startSquare, piece', startSquare, piece);
    this.moves = [];
    // let square = document.getElementById(startSquare);
    // square.classList.add('mark');
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[15][5]; n++) {
        let targetSquare = startSquare + this.directionOffsets[directionIndex] * (n + 1);
        let move: Move = {
          startSquare: startSquare,
          targetSquare: targetSquare
        }
        this.moves.push(move);
      }
    }
    console.log('this.moves', this.moves); 
  }
}

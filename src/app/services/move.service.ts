import { Injectable } from '@angular/core';
import { Move } from "../interfaces/move.interface";

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  directionOffsets: Array<number> = [8, -8, 1, -1, 7, -7, 9, -9];
  numSquaresToEdge;
  moves: Array<Move>

  constructor() { }

  preComputedMoveData() {
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        let numNorth = 7 - rank;
        let numSouth = rank;
        let numWest = file;
        let numEast = 7 - file;

        let squereIndex = rank * 8 + file;
        let minNW = Math.min(numNorth, numWest);
        let minSE = Math.min(numSouth, numEast);
        let minNE = Math.min(numNorth, numEast);
        let minSW = Math.min(numSouth, numWest);

        this.numSquaresToEdge[squereIndex] = {
          numNorth,
          numSouth,
          numWest,
          numEast,
          minNW,
          minSE,
          minNE,
          minSW
        }
          ;
      }
    }
  }

  generateMoves() {

  }

  generateSlideMovings(startSquare, piece) {
    console.log('startSquare, piece', startSquare, piece);

    let square = document.getElementById('e4');
    console.log('square', square);
    square.classList.add('mark');
    /* for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[0][0]; n++) {
        let targetSquare = startSquare + this.directionOffsets[directionIndex] * (n + 1);
        let move: Move = {
          startSquare: startSquare,
          targetSquare: targetSquare
        }
        this.moves.push(move);
      }

    } */
  }
}

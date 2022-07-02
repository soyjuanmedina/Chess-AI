import { Injectable } from '@angular/core';
import { Move } from "../interfaces/move.interface";
import { Piece } from '../interfaces/piece.interface';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  directionOffsets: Array<number> = [-8, 8, -1, 1, -7, 7, -9, 9];
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
          minNE,
          minSW,
          minNW,
          minSE
        ]
      }

    }
    // console.log('this.numSquaresToEdge', this.numSquaresToEdge[54]);
  }

  generateMoves() {

  }

  getPiece(pieceId: string) {
    let piece: Piece = {
      type: pieceId.charAt(1),
      color: pieceId.charAt(0)
    };
    return piece;
  }

  generateSlideMovings(startSquareId, pieceId) {
    let piece = this.getPiece(pieceId);
    let startSquare = parseInt(startSquareId.slice(2));
    this.moves = [];
    // let square = document.getElementById(startSquare);
    // square.classList.add('mark');
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[startSquare][directionIndex]; n++) {
        let targetSquare = startSquare + this.directionOffsets[directionIndex] * (n + 1);
        let targetSquareId = 'sq' + targetSquare;
        let square = document.getElementById(targetSquareId);
        let move: Move = {
          startSquare: startSquare,
          targetSquare: targetSquare
        }
        if (!square.hasChildNodes()) {
          this.moves.push(move);
        } else {
          let pieceId = square.getElementsByTagName('img')[0].id;
          let targetPiece = this.getPiece(pieceId);
          if (piece.color != targetPiece.color) {
            move.type = 'posibleCapture';
            this.moves.push(move);
          }
          n = this.numSquaresToEdge[startSquare][directionIndex];
        }
      }
    }
    for (let i = 0; i < this.moves.length; i++) {
      console.log('this.moves[i]', this.moves[i].type);
      let targetSquareId = 'sq' + this.moves[i].targetSquare;
      let square = document.getElementById(targetSquareId);
      if (this.moves[i].type == 'posibleCapture') {
        square.classList.add('posibleCapture');
      } else {
        square.classList.add('posibleMove');
      }
      square.addEventListener("dragover", this.allowDrop);
    }
    /* this.moves.forEach(move => {
      let targetSquareId = 'sq' + move.targetSquare;
      let square = document.getElementById(targetSquareId);
      if (square.hasChildNodes()) {
        let pieceId = square.getElementsByTagName('img')[0].id;
        let targetPiece = this.getPiece(pieceId);
        if (piece.color != targetPiece.color) {
          square.classList.add('posibleCapture');
        }
      } else {
        square.classList.add('posibleMove');
      }
    }); */

  }

  allowDrop(ev) {
    ev.preventDefault();
  }
}

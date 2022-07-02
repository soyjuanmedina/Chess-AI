import { Injectable } from '@angular/core';
import { Move } from "../interfaces/move.interface";
import { Piece } from '../interfaces/piece.interface';
import { ResourcesService } from './resources.service';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  directionOffsets: Array<number> = [-8, 8, -1, 1, -7, 7, -9, 9];
  numSquaresToEdge = [[]];
  moves: Array<Move>;
  FEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  constructor(public _resourcesService: ResourcesService) {
    this.preComputedMoveData();
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

  generateMoves(startSquareId, pieceId) {
    let piece = this._resourcesService.getPiece(pieceId);
    let colorToMove = this.FEN.split(' ')[1];
    if (colorToMove == piece.color && this._resourcesService.isSlidingPiece(piece)) {
      this.generateSlideMovings(startSquareId, piece);
    }
  }



  generateSlideMovings(startSquareId, piece) {
    console.log(piece.type);
    let startIndex = piece.type == 'b' ? 4 : 0;
    let endIndex = piece.type == 'r' ? 4 : 8;
    let startSquare = parseInt(startSquareId.slice(2));
    this.moves = [];
    // let square = document.getElementById(startSquare);
    // square.classList.add('mark');
    for (let directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
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
          let targetPiece = this._resourcesService.getPiece(pieceId);
          if (piece.color != targetPiece.color) {
            move.type = 'posibleCapture';
            this.moves.push(move);
          }
          n = this.numSquaresToEdge[startSquare][directionIndex];
        }
      }
    }
    for (let i = 0; i < this.moves.length; i++) {
      let targetSquareId = 'sq' + this.moves[i].targetSquare;
      let square = document.getElementById(targetSquareId);
      if (this.moves[i].type == 'posibleCapture') {
        square.classList.add('posibleCapture');
      } else {
        square.classList.add('posibleMove');
      }
      square.addEventListener("dragover", this.allowDrop);
    }
  }


  // Funciones Drag & Drop

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    let pieceId = ev.target.id;
    let pieceSrc = ev.target.src;
    let squareId = ev.target.parentNode.id;
    ev.dataTransfer.setData("pieceId", pieceId);
    ev.dataTransfer.setData("pieceSrc", pieceSrc);
    this.generateMoves(squareId, pieceId);
    /*     let audio = new Audio('assets/sounds/dragslide1.mp3');
        audio.play(); */
  }

  drop(ev) {
    if (ev.target.getAttribute('class').includes('posibleMove')) {
      ev.preventDefault();
      let pieceId = ev.dataTransfer.getData("pieceId");
      let pieceSrc = ev.dataTransfer.getData("pieceSrc");
      if (ev.target.getAttribute('src')) {
        ev.target.setAttribute('src', pieceSrc);
      }
      if (ev.target.id != pieceId) {
        ev.target.appendChild(document.getElementById(pieceId));
      }
      /*     let audio = new Audio('assets/sounds/chess-move-on-alabaster.wav');
          audio.play(); */

    }
    this._resourcesService.cleanClasses();


  }

}

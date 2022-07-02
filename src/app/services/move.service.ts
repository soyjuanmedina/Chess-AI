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
  FEN: string = '8/2q5/5r2/8/2Q5/5N2/3B4/8 w KQkq - 0 1';
  colorToMove = 'w'

  constructor(public _resourcesService: ResourcesService) {
    this.preComputedMoveData();
    this.colorToMove = this.FEN.split(' ')[1];
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
    if (this.colorToMove == piece.color && this._resourcesService.isSlidingPiece(piece)) {
      this.generateSlideMovings(startSquareId, piece);
    }
  }



  generateSlideMovings(startSquareId, piece) {
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
            move.type = 'possibleCapture';
            this.moves.push(move);
          }
          n = this.numSquaresToEdge[startSquare][directionIndex];
        }
      }
    }
    for (let i = 0; i < this.moves.length; i++) {
      let targetSquareId = 'sq' + this.moves[i].targetSquare;
      let square = document.getElementById(targetSquareId);
      if (this.moves[i].type == 'possibleCapture') {
        square.classList.add('possibleCapture');
      } else {
        square.classList.add('possibleMove');
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
    let squareId = ev.target.parentNode.id;
    ev.dataTransfer.setData("pieceId", pieceId);
    this.generateMoves(squareId, pieceId);
  }

  drop(ev) {
    if (this.isPossibleMove(ev.target)) {
      ev.preventDefault();
      let pieceId = ev.dataTransfer.getData("pieceId");
      let piece = this._resourcesService.getPiece(pieceId);
      let square = ev.target.getAttribute('id').slice(2);
      if (ev.target.id != pieceId) {
        document.getElementById(pieceId).remove();
        this.drawPiece(piece, square);
        this.colorToMove = this.colorToMove == 'w' ? 'b' : 'w';
        let audio = new Audio('assets/sounds/chess-move-on-alabaster.wav');
        audio.play();
      }
    }
    this._resourcesService.cleanClasses();
  }

  isPossibleMove(node) {
    if (node.getAttribute('class').includes('possibleMove') ||
      node.parentNode.getAttribute('class').includes('possibleCapture')) {
      return true;
    }
    return false;
  }

  drawPiece(piece: Piece, square) {
    // let position = String.fromCharCode(97 + x) + (y + 1);
    let innerDiv = document.getElementById('sq' + square);
    if (innerDiv.hasChildNodes()) {
      innerDiv.removeChild(innerDiv.firstChild);
    }
    let img: HTMLImageElement = document.createElement("img");
    img.src = 'assets/pieces/' + piece.color + piece.type + '.png';
    img.classList.add('square');
    img.setAttribute("id", piece.color + piece.type + square);
    img.setAttribute("draggable", "true");
    img.addEventListener('dragstart', this.drag.bind(this));
    innerDiv.appendChild(img);
  }

}

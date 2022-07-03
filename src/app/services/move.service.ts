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
  }

  generateMoves(startSquareId, pieceId) {
    let piece = this._resourcesService.getPiece(pieceId);
    if (this.colorToMove == piece.color) {
      if (this._resourcesService.isSlidingPiece(piece)) {
        this.generateSlideMovings(startSquareId, piece);
      } else if (piece.type == 'p') {
        this.generatePawnMovings(startSquareId, piece);
      } else if (piece.type == 'n') {
        this.generateKnightMovings(startSquareId, piece);
      }
    }
  }

  generateKnightMovings(startSquareId, piece) {
    this.moves = [];
    let possibleKnightMoves: Array<number> = [-17, -10, -15, -6, 6, 10, 15, 17];
    let startSquare = parseInt(startSquareId.slice(2));
    for (let index = 0; index < possibleKnightMoves.length; index++) {
      let targetSquare = startSquare + possibleKnightMoves[index]
      if (targetSquare > 0 && targetSquare < 65) {
        let move: Move = {
          startSquare: startSquare,
          targetSquare: targetSquare
        }
        console.log('move', move);
        this.moves.push(move);
      }
    }
    this.drawMoves(this.moves)
  }

  generatePawnMovings(startSquareId, piece) {
    this.moves = [];
    let startSquare = parseInt(startSquareId.slice(2));
    let possiblesMoves = this.isPawnStartPosition(startSquare, piece) ? 2 : 1;
    let increment = piece.color == 'b' ? 8 : -8;
    let targetSquare = startSquare + increment - 1;
    for (let index = 0; index < 3; index++) {
      if (index == 1) {
        if (this._resourcesService.squareHasPiece(targetSquare + index)) {
          index++;
        } else {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare + index
          }
          this.moves.push(move);
        }

      } else {
        if (this._resourcesService.squareHasPiece(targetSquare + index)) {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare + index
          }
          this.moves.push(move);
        }
      }
    }
    if (possiblesMoves == 2) {
      let move: Move = {
        startSquare: startSquare,
        targetSquare: startSquare + increment * 2
      }
      this.moves.push(move);
    }
    this.drawMoves(this.moves)
  }

  isPawnStartPosition(square, piece) {
    if (piece.color == 'b' && square > 8 && square < 17) {
      return true;
    } else if (piece.color == 'w' && square > 48 && square < 57) {
      return true;
    }
    return false;
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
        if (square.hasChildNodes()) {
          n = this.numSquaresToEdge[startSquare][directionIndex];
        }
        this.moves.push(move);
      }
    }
    this.drawMoves(this.moves)
  }

  isPossibleCapture(startSquareNum, targetSquareNum) {
    let targetSquareId = 'sq' + targetSquareNum;
    let targetSquare = document.getElementById(targetSquareId);
    if (!targetSquare.hasChildNodes()) {
      return false
    } else {
      let startSquareId = 'sq' + startSquareNum;
      let startSquare = document.getElementById(startSquareId);
      let startPieceId = startSquare.getElementsByTagName('img')[0].id;
      let startPiece = this._resourcesService.getPiece(startPieceId);
      let targetPieceId = targetSquare.getElementsByTagName('img')[0].id;
      let targetPiece = this._resourcesService.getPiece(targetPieceId);
      if (startPiece.color != targetPiece.color) {
        return true
      }
      return false
    }
  }

  isFriendPiece(startSquareNum, targetSquare) {
    let startSquareId = 'sq' + startSquareNum;
    let startSquare = document.getElementById(startSquareId);
    let startPieceId = startSquare.getElementsByTagName('img')[0].id;
    let startPiece = this._resourcesService.getPiece(startPieceId);
    let targetPieceId = targetSquare.getElementsByTagName('img')[0].id;
    let targetPiece = this._resourcesService.getPiece(targetPieceId);
    if (startPiece.color == targetPiece.color) {
      return true
    }
    return false;
  }

  drawMoves(moves) {
    for (let i = 0; i < moves.length; i++) {
      let targetSquareId = 'sq' + moves[i].targetSquare;
      let targetSquare = document.getElementById(targetSquareId);
      if (targetSquare.hasChildNodes()) {
        if (!this.isFriendPiece(moves[i].startSquare, targetSquare)) {
          targetSquare.classList.add('possibleCapture');
        }
      } else {
        targetSquare.classList.add('possibleMove');
      }
      targetSquare.addEventListener("dragover", this.allowDrop);
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

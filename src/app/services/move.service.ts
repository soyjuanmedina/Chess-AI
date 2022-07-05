import { Injectable } from '@angular/core';
import { Move } from "../interfaces/move.interface";
import { Piece } from '../interfaces/piece.interface';
import { AiMoveService } from './ai-move.service';
import { ResourcesService } from './resources.service';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  directionOffsets: Array<number> = [-8, 8, -1, 1, -7, 7, -9, 9];
  numSquaresToEdge = [[]];
  FEN: string = 'rnbqkbnr/8/8/8/8/8/8/RNBKQBNR w KQkq - 0 1';
  colorToMove = 'w';
  computerPlayBlack: boolean = true;
  isCheckPosition = false;

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
    let piece: Piece = this._resourcesService.getPiece(pieceId);
    let moves: Array<Move> = [];
    if (this.colorToMove == piece.color) {
      if (this._resourcesService.isSlidingPiece(piece)) {
        moves = this.generateSlideMovings(startSquareId, piece);
      } else if (piece.type == 'p') {
        moves = this.generatePawnMovings(startSquareId, piece);
      } else if (piece.type == 'n') {
        moves = this.generateKnightMovings(startSquareId, piece);
      } else if (piece.type == 'k') {
        moves = this.generateKingMovings(startSquareId, piece);
      }
    }
    return moves;
  }

  generateKingMovings(startSquareId, piece) {
    let moves: Array<Move> = [];
    let startSquare = parseInt(startSquareId.slice(2));
    for (let index = 0; index < this.numSquaresToEdge[startSquare].length; index++) {
      if (this.numSquaresToEdge[startSquare][index] > 0) {
        let targetSquare = startSquare + this.directionOffsets[index]
        let targetSquareId = 'sq' + targetSquare;
        let targetSquareDiv = document.getElementById(targetSquareId);
        if (targetSquareDiv.hasChildNodes() && this.isFriendPiece(startSquare, targetSquare)) {
          index++;
        } else {
          let move: Move = this.getMove(startSquare, targetSquare);
          moves.push(move);
        }
      }
    }
    return moves;
  }

  generateKnightMovings(startSquareId, piece) {
    let moves: Array<Move> = [];
    let possibleKnightMoves: Array<number> = [-17, -10, -15, -6, 6, 15, 10, 17];
    let startSquare = parseInt(startSquareId.slice(2));
    for (let index = 0; index < possibleKnightMoves.length; index++) {
      let targetSquare = startSquare + possibleKnightMoves[index]
      let move: Move = this.getMove(startSquare, targetSquare);
      moves.push(move);
    }
    if (startSquare % 8 == 0) {
      moves[2].targetSquare = 65;
      moves[3].targetSquare = 65;
      moves[6].targetSquare = 65;
      moves[7].targetSquare = 65;
    }
    if ((startSquare + 1) % 8 == 0) {
      moves[3].targetSquare = 65;
      moves[6].targetSquare = 65;
    }
    if ((startSquare - 1) % 8 == 0) {
      moves[0].targetSquare = 65;
      moves[1].targetSquare = 65;
      moves[4].targetSquare = 65;
      moves[5].targetSquare = 65;
    }
    if ((startSquare - 2) % 8 == 0) {
      moves[1].targetSquare = 65;
      moves[4].targetSquare = 65;
    }
    moves = moves.filter(move => move.targetSquare > 0 && move.targetSquare < 65)
    let finalMoves: Array<Move> = [];
    for (let index = 0; index < moves.length; index++) {
      let targetSquare = moves[index].targetSquare;
      let targetSquareId = 'sq' + moves[index].targetSquare;
      let targetSquareDiv = document.getElementById(targetSquareId);
      if (targetSquareDiv.hasChildNodes() && this.isFriendPiece(startSquare, targetSquare)) {
      } else {
        let move: Move = this.getMove(startSquare, moves[index].targetSquare);
        finalMoves.push(move);
      }

    }
    return finalMoves;
  }

  getMove(startSquare, targetSquare) {
    let move = {
      startSquare: startSquare,
      targetSquare: targetSquare
    }
    return move
  }

  generatePawnMovings(startSquareId, piece) {
    let moves: Array<Move> = [];
    let startSquare = parseInt(startSquareId.slice(2));
    let possiblesMoves = this.isPawnStartPosition(startSquare, piece) ? 2 : 1;
    let increment = piece.color == 'b' ? 8 : -8;
    let targetSquare = startSquare + increment - 1;
    for (let index = 0; index < 3; index++) {
      if (index == 1) {
        if (!this._resourcesService.squareHasPiece(targetSquare + index)) {
          let targetSquareId = 'sq' + (targetSquare + index);
          let targetSquareDiv = document.getElementById(targetSquareId);
          if (!targetSquareDiv.hasChildNodes()) {
            let move: Move = {
              startSquare: startSquare,
              targetSquare: targetSquare + index
            }
            moves.push(move);
          }
        }
      } else {
        if (this._resourcesService.squareHasPiece(targetSquare + index) && !this.isFriendPiece(startSquare, targetSquare + index)) {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare + index
          }
          moves.push(move);
        }
      }
    }
    if (possiblesMoves == 2) {
      let move: Move = {
        startSquare: startSquare,
        targetSquare: startSquare + increment * 2
      }
      moves.push(move);
    }

    return moves;
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
    let moves: Array<Move> = [];
    // let square = document.getElementById(startSquare);
    // square.classList.add('mark');
    for (let directionIndex = startIndex; directionIndex < endIndex; directionIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[startSquare][directionIndex]; n++) {
        let targetSquare = startSquare + this.directionOffsets[directionIndex] * (n + 1);
        let targetSquareId = 'sq' + targetSquare;
        let targetSquareDiv = document.getElementById(targetSquareId);
        if (targetSquareDiv.hasChildNodes()) {
          n = this.numSquaresToEdge[startSquare][directionIndex];
          if (!this.isFriendPiece(startSquare, targetSquare)) {
            let move: Move = {
              startSquare: startSquare,
              targetSquare: targetSquare
            }
            moves.push(move);
          }
        } else {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare
          }
          moves.push(move);
        }

      }
    }
    return moves;
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

  isFriendPiece(startSquare, targetSquare) {
    let targetSquareId = 'sq' + targetSquare;
    let startSquareId = 'sq' + startSquare;
    let startSquareDiv = document.getElementById(startSquareId);
    let targetSquareDiv = document.getElementById(targetSquareId);
    let startPieceId = startSquareDiv.getElementsByTagName('img')[0].id;
    let startPiece = this._resourcesService.getPiece(startPieceId);
    let targetPieceId = targetSquareDiv.getElementsByTagName('img')[0].id;
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
        let pieceId = targetSquare.getElementsByTagName('img')[0].id;
        let piece: Piece = this._resourcesService.getPiece(pieceId);
        targetSquare.classList.add('possibleCapture');
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
    if (this.isCheckPosition) {
      console.log('Estas en jaque');
    }
    let pieceId = ev.target.id;
    let squareId = ev.target.parentNode.id;
    ev.dataTransfer.setData("pieceId", pieceId);
    let moves: Array<Move> = this.generateMoves(squareId, pieceId);
    this.drawMoves(moves);
    this.getAllPossiblesMoves('w');
  }

  drop(ev) {
    if (this.isPossibleMove(ev.target)) {
      ev.preventDefault();
      let pieceId = ev.dataTransfer.getData("pieceId");
      let piece: Piece = this._resourcesService.getPiece(pieceId);
      let square = ev.target.getAttribute('id').slice(2);
      this.drawPiece(piece, square);
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

  drawPiece(piece: Piece, square: number,) {
    let pieceId = piece.color + piece.type + piece.position;
    if (document.getElementById(pieceId)) {
      document.getElementById(pieceId).remove();
      this.drawPiece(piece, square);
      this.colorToMove = this.colorToMove == 'w' ? 'b' : 'w';
      this.checkCheck(this.colorToMove);
      let audio = new Audio('assets/sounds/chess-move-on-alabaster.wav');
      audio.play();
      this._resourcesService.cleanClasses();
      if (this.colorToMove == 'b' && this.computerPlayBlack) {
        this.doNextMove();
      }
    }
    if (piece.type == 'p' && (square > 0 && square < 8) ||
      piece.type == 'p' && (square > 56 && square < 65)) {
      piece.type = 'q';
    }
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

  // Funciones AI


  doNextMove() {
    this.choosePiece();
  }

  choosePiece() {
    let randomSquare = Math.floor(Math.random() * 64) + 1
    let innerDiv = document.getElementById('sq' + randomSquare);
    if (innerDiv.hasChildNodes() && innerDiv.getElementsByTagName('img')[0].id.charAt(0) == 'b') {
      let pieceId = innerDiv.getElementsByTagName('img')[0].id;
      let piece: Piece = this._resourcesService.getPiece(pieceId);
      let squareId = 'sq' + piece.position;
      let moves: Array<Move> = this.generateMoves(squareId, pieceId);
      if (moves.length > 0) {
        let index = Math.floor(Math.random() * moves.length);
        let randomMove = moves[index];
        this.drawPiece(piece, randomMove.targetSquare);
      } else {
        this.choosePiece();
      }
    } else {
      this.choosePiece();
    }
  }


  getAllPossiblesMoves(color: string) {
    let allPossiblesMoves = [];
    for (let index = 1; index < 65; index++) {
      let targetSquare = document.getElementById('sq' + index);
      if (targetSquare.hasChildNodes() && targetSquare.getElementsByTagName('img')[0].id.charAt(0) == color) {
        let pieceId = targetSquare.getElementsByTagName('img')[0].id;
        let piece: Piece = this._resourcesService.getPiece(pieceId);
        let squareId = 'sq' + piece.position;
        let moves: Array<Move> = this.generateMoves(squareId, pieceId);
        allPossiblesMoves.push(...moves);
      }
    }
    return allPossiblesMoves;
  }

  checkCheck(color: string) {
    let allPossiblesMoves = this.getAllPossiblesMoves(color);
    for (let index = 0; index < allPossiblesMoves.length; index++) {
      let targetSquare = document.getElementById('sq' + allPossiblesMoves[index].targetSquare);
      if (targetSquare.hasChildNodes()) {
        let pieceId = targetSquare.getElementsByTagName('img')[0].id;
        let piece: Piece = this._resourcesService.getPiece(pieceId);
        if (piece.type == 'k' && piece.color != color) {
          targetSquare.classList.add('check');
          this.isCheckPosition = true;
        }
      }

    }
  }






}

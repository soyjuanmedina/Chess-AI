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
  startFEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  FEN: string = this.startFEN;
  // FEN: string = '8/8/8/8/8/1k3K2/4b3/8 b KQkq - 0 1';
  // FEN: string = '8/8/8/8/8/1k6/4b3/5K2 b KQkq - 0 1';
  colorToMove = 'w';
  computerPlayBlack: boolean = true;
  computerPlayWhite: boolean = true;
  isCheckPosition = false;
  isCheckmate = false;
  isPlaying = false;
  checkThreatMove: Move;
  enPassant: number;
  isTablas = false;

  // Para el enroque untoched blak king untouched black short rock
  ubk: boolean = true;
  ubsr: boolean = true;
  ublr: boolean = true;
  uwk: boolean = true;
  uwsr: boolean = true;
  uwlr: boolean = true;

  constructor(public _resourcesService: ResourcesService) {
    this.preComputedMoveData();
    if (this.FEN.charAt(0) != 'r') {
      this.ubk = false;
      this.ubsr = false;
      this.ublr = false;
      this.uwk = false;
      this.uwsr = false;
      this.uwlr = false;
    }
  }

  generateMoves(startSquareId, pieceId) {
    let piece: Piece = this._resourcesService.getPiece(pieceId);
    let moves: Array<Move> = [];
    if (this._resourcesService.isSlidingPiece(piece)) {
      moves = this.generateSlideMovings(startSquareId, piece);
    } else if (piece.type == 'p') {
      moves = this.generatePawnMovings(startSquareId, piece);
    } else if (piece.type == 'n') {
      moves = this.generateKnightMovings(startSquareId);
    } else if (piece.type == 'k') {
      moves = this.generateKingMovings(startSquareId, piece);
    }
    return moves;
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

  generateKingMovings(startSquareId: string, piece: Piece) {
    let moves: Array<Move> = [];
    let startSquareNum = parseInt(startSquareId.slice(2));
    for (let index = 0; index < this.numSquaresToEdge[startSquareNum].length; index++) {
      if (this.numSquaresToEdge[startSquareNum][index] > 0) {
        let targetSquareNum = startSquareNum + this.directionOffsets[index];
        let targetSquareId = 'sq' + targetSquareNum;
        let targetSquareDiv = document.getElementById(targetSquareId);
        if (targetSquareDiv.hasChildNodes() && this.isFriendPiece(startSquareNum, targetSquareNum)) {
        } else {
          let attackColor = piece.color == 'w' ? 'b' : 'w';
          if (!this.itsSquareUnderThret(targetSquareNum, attackColor)) {
            let move: Move = this.getMove(startSquareNum, targetSquareNum);
            moves.push(move);
          }
        }
      }
    }
    if (this.itsPossibleShortCastling(piece.color)) {
      let targetSquare = piece.color == 'b' ? 7 : 63;
      let move: Move = this.getMove(startSquareNum, targetSquare);
      moves.push(move);
    }
    if (this.itsPossibleLongCastling(piece.color)) {
      let targetSquare = piece.color == 'b' ? 3 : 59;
      let move: Move = this.getMove(startSquareNum, targetSquare);
      moves.push(move);
    }
    return moves;
  }

  itsPossibleShortCastling(color) {
    let solution = false
    if (color == 'b' && !document.getElementById('sq6').hasChildNodes()
      && !document.getElementById('sq7').hasChildNodes() && this.ubsr) {
      solution = true;
    } else if (color == 'w' && !document.getElementById('sq62').hasChildNodes()
      && !document.getElementById('sq63').hasChildNodes() && this.uwsr) {
      solution = true;
    }
    return solution;
  }

  itsPossibleLongCastling(color) {
    let solution = false
    if (color == 'b' && !document.getElementById('sq4').hasChildNodes()
      && !document.getElementById('sq3').hasChildNodes()
      && !document.getElementById('sq2').hasChildNodes() && this.ublr) {
      solution = true;
    } else if (color == 'w' && !document.getElementById('sq60').hasChildNodes()
      && !document.getElementById('sq59').hasChildNodes()
      && !document.getElementById('sq58').hasChildNodes() && this.uwlr) {
      solution = true;
    }
    return solution;
  }

  itsSquareUnderThret(targetSquareNum: number, attackColor: string) {
    if (this.itsAttackKingNear(targetSquareNum, attackColor)) {
      return true
    }
    // Borramos el rey para que no afecte a las casillas amenazadas tras él 
    let kingColor = attackColor == 'w' ? 'b' : 'w';
    let kingSrc = "assets/pieces/" + kingColor + "k.png"
    let kingPlace: any = document.querySelectorAll('img[src="' + kingSrc + '"]');
    let kingId = kingPlace[0].id;
    let kingDiv = kingPlace[0].parentNode;
    let kingNode = document.getElementById(kingId)
    document.getElementById(kingId).remove();
    let possiblesAttacks = this.getAllPossiblesMovesExceptKing(attackColor);
    kingDiv.appendChild(kingNode);
    let attacks = possiblesAttacks.filter(possibleAttack => possibleAttack.targetSquare == targetSquareNum);
    if (attacks.length > 0) {
      return true
    }
    return false;
  }

  itsAttackKingNear(targetSquareNum: number, attackColor: string) {
    for (let index = 0; index < this.directionOffsets.length; index++) {
      let newtargetSquareNum = targetSquareNum + this.directionOffsets[index];
      let newTargetSquareId = 'sq' + newtargetSquareNum;
      let newTargetSquareDiv = document.getElementById(newTargetSquareId);
      if (newTargetSquareDiv && newTargetSquareDiv.hasChildNodes()) {
        let pieceId = newTargetSquareDiv.getElementsByTagName('img')[0].id;
        let piece = this._resourcesService.getPiece(pieceId);
        if (piece.type == 'k' && piece.color == attackColor) {
          return true;
        }
      }
    }
    if (0) {
      return true
    }
    return false;
  }

  /*   isKingInChek(piece: Piece) {
      console.log('isKingInChek',);
      let kingSrc = "assets/pieces/" + piece.color + "k.png"
      let kingPlace: any = document.querySelectorAll('img[src="' + kingSrc + '"]');
      let kingSquare = kingPlace[0].parentNode.id;
      let moves = this.generateKingMovings(kingSquare, piece);
      if (moves.length > 0) {
      }
      let KnigthMoves = this.generateKnightMovings(kingSquare);
      return false;
    } */

  generateKnightMovings(startSquareId) {
    let moves: Array<Move> = [];
    let possibleKnightMoves: Array<number> = [-17, -10, -15, -6, 6, 15, 10, 17];
    let startSquareNum = parseInt(startSquareId.slice(2));
    for (let index = 0; index < possibleKnightMoves.length; index++) {
      let targetSquareNum = startSquareNum + possibleKnightMoves[index]
      let move: Move = this.getMove(startSquareNum, targetSquareNum);
      let targetSquareId = 'sq' + targetSquareNum;
      let targetSquareDiv = document.getElementById(targetSquareId);
      if (targetSquareDiv && targetSquareDiv.hasChildNodes() && this.isFriendPiece(startSquareNum, targetSquareNum)) {
        move.targetSquare = 65;
      }
      moves.push(move);
    }
    if (startSquareNum % 8 == 0) {
      moves[2].targetSquare = 65;
      moves[3].targetSquare = 65;
      moves[6].targetSquare = 65;
      moves[7].targetSquare = 65;
    }
    if ((startSquareNum + 1) % 8 == 0) {
      moves[3].targetSquare = 65;
      moves[6].targetSquare = 65;
    }
    if ((startSquareNum - 1) % 8 == 0) {
      moves[0].targetSquare = 65;
      moves[1].targetSquare = 65;
      moves[4].targetSquare = 65;
      moves[5].targetSquare = 65;
    }
    if ((startSquareNum - 2) % 8 == 0) {
      moves[1].targetSquare = 65;
      moves[4].targetSquare = 65;
    }
    moves = moves.filter(move => move.targetSquare > 0 && move.targetSquare < 65)
    return moves;
  }

  getMove(startSquareNum, targetSquareNum) {
    let move = {
      startSquare: startSquareNum,
      targetSquare: targetSquareNum
    }
    return move
  }

  generatePawnMovings(startSquareId, piece) {
    let moves: Array<Move> = [];
    let startSquare = parseInt(startSquareId.slice(2));
    let startIndex = this.numSquaresToEdge[startSquare][2] == 0 ? 1 : 0;
    let endIndex = this.numSquaresToEdge[startSquare][3] == 0 ? 2 : 3;
    let possiblesMoves = this.isPawnStartPosition(startSquare, piece) ? 2 : 1;
    let increment = piece.color == 'b' ? 8 : -8;
    let targetSquare = startSquare + increment - 1;
    for (let index = startIndex; index < endIndex; index++) {
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
        if (this._resourcesService.squareHasPiece(targetSquare + index) &&
          !this.isFriendPiece(startSquare, targetSquare + index)) {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare + index
          }
          moves.push(move);
        } else if (this.enPassant && this.enPassant + increment == targetSquare + index) {
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare + index
          }
          moves.push(move);
        }
      }
    }
    if (possiblesMoves == 2 && !this._resourcesService.squareHasPiece(startSquare + increment)
      && !this._resourcesService.squareHasPiece(startSquare + increment * 2)) {
      let move: Move = {
        startSquare: startSquare,
        targetSquare: startSquare + increment * 2
      }
      moves.push(move);
    }
    return moves;
  }

  generatePawnThreats(startSquareId, piece) {
    let threats: Array<Move> = [];
    let startSquare = parseInt(startSquareId.slice(2));
    let startIndex = this.numSquaresToEdge[startSquare][2] == 0 ? 1 : 0;
    let endIndex = this.numSquaresToEdge[startSquare][3] == 0 ? 2 : 3;
    let possiblesMoves = this.isPawnStartPosition(startSquare, piece) ? 2 : 1;
    let increment = piece.color == 'w' ? -8 : 8;
    let targetSquare = startSquare + increment - 1;
    for (let index = startIndex; index < endIndex; index++) {
      if (index == 0 || index == 2) {
        let move: Move = {
          startSquare: startSquare,
          targetSquare: targetSquare + index
        }
        threats.push(move);
      }
    }
    return threats;
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
          let move: Move = {
            startSquare: startSquare,
            targetSquare: targetSquare
          }
          moves.push(move);
          n = this.numSquaresToEdge[startSquare][directionIndex];
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

  removeFriendsMoves(moves) {
    let finalMoves: Array<Move> = [];
    for (let index = 0; index < moves.length; index++) {
      let targetSquare = moves[index].targetSquare;
      let targetSquareId = 'sq' + moves[index].targetSquare;
      let targetSquareDiv = document.getElementById(targetSquareId);
      if (targetSquareDiv.hasChildNodes() && this.isFriendPiece(moves[index].startSquare, targetSquare)) {
      } else {
        let move: Move = this.getMove(moves[index].startSquare, moves[index].targetSquare);
        finalMoves.push(move);
      }
    }
    return finalMoves;

  }

  drawMoves(moves) {
    // Eliminamos de las casillas con piezas amigas
    let finalMoves: Array<Move> = this.removeFriendsMoves(moves);
    // Ponemos las clasess de posible movimiento y posible captura
    for (let i = 0; i < finalMoves.length; i++) {
      let targetSquareId = 'sq' + finalMoves[i].targetSquare;
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

  checkIfMate(squareId, pieceId) {
    let color = pieceId.charAt(0);
    let king = this._resourcesService.getPiece(pieceId);
    let getAllPossiblesMovesExceptKing = this.getAllPossiblesMovesExceptKing(color);
    let allKingPossiblesMoves = this.generateKingMovings(squareId, king);
    let allPossiblesMoves = getAllPossiblesMovesExceptKing.concat(allKingPossiblesMoves);
    let moves = allPossiblesMoves.filter((move) =>
      this.moveSolveCheck(move,
        this._resourcesService.getPiece(document.getElementById('sq' + move.startSquare).getElementsByTagName('img')[0].id)));
    if (!moves.length) {
      this.isCheckmate = true
    } else {
      return moves
    }
  }

  protecKing(moves: Array<Move>, pieceType: string) {
    let kingSrc = "assets/pieces/" + this.colorToMove + "k.png"
    let kingPlace: any = document.querySelectorAll('img[src="' + kingSrc + '"]');
    let kingId = kingPlace[0].id;
    let kingDiv = kingPlace[0].parentNode;
    let kingNode = document.getElementById(kingId)
    let pieceNum = moves[0].startSquare;
    let kingNum = kingId.slice(2);
    let bigger = pieceNum > kingNum ? pieceNum : kingNum
    let smaller = pieceNum < kingNum ? pieceNum : kingNum
    let threat = false;
    if (pieceType == 'n') {
    } else {
      if ((bigger - smaller) % 8 == 0) {
        for (let index = 0; index < moves.length; index++) {
          if ((moves[index].targetSquare - smaller) % 8 == 0) {
            let innerDiv = document.getElementById('sq' + moves[index].targetSquare);
            if (innerDiv.hasChildNodes()) {
              let pieceImg = innerDiv.getElementsByTagName('img')[0];
              let piece: Piece = this._resourcesService.getPiece(pieceImg.id);
              let pieceIsThreat = true ? piece.type == 'q' || piece.type == 'r' : false
              if (!this.isFriendPiece(pieceNum, piece.position) && pieceIsThreat) {
                threat = true;
              }
            }
          }
        }
        if (threat) {
          moves = moves.filter(move => (move.targetSquare - smaller) % 8 == 0)
        }
      } else if ((bigger - smaller) % 7 == 0) {
        for (let index = 0; index < moves.length; index++) {
          if ((moves[index].targetSquare - smaller) % 7 == 0) {
            let innerDiv = document.getElementById('sq' + moves[index].targetSquare);
            if (innerDiv.hasChildNodes()) {
              let pieceImg = innerDiv.getElementsByTagName('img')[0];
              let piece: Piece = this._resourcesService.getPiece(pieceImg.id);
              let pieceIsThreat = true ? piece.type == 'q' || piece.type == 'b' : false
              if (!this.isFriendPiece(pieceNum, piece.position) && pieceIsThreat) {
                threat = true;
              }
            }
          }
        }
        if (threat) {
          moves = moves.filter(move => (move.targetSquare - smaller) % 7 == 0)
        }
      } else if ((bigger - smaller) % 9 == 0) {

        for (let index = 0; index < moves.length; index++) {
          if ((moves[index].targetSquare - smaller) % 9 == 0) {
            let innerDiv = document.getElementById('sq' + moves[index].targetSquare);
            if (innerDiv.hasChildNodes()) {
              let pieceImg = innerDiv.getElementsByTagName('img')[0];
              let piece: Piece = this._resourcesService.getPiece(pieceImg.id);
              let pieceIsThreat = true ? piece.type == 'q' || piece.type == 'b' : false
              if (!this.isFriendPiece(pieceNum, piece.position) && pieceIsThreat) {
                threat = true;
              }
            }
          }
        }
        if (threat) {
          moves = moves.filter(move => (move.targetSquare - smaller) % 9 == 0)
        }
      }
      else if ((bigger - smaller) < 9) {
        for (let index = 0; index < moves.length; index++) {
          if ((moves[index].targetSquare - smaller) < 9) {
            let innerDiv = document.getElementById('sq' + moves[index].targetSquare);
            if (innerDiv.hasChildNodes()) {
              let pieceImg = innerDiv.getElementsByTagName('img')[0];
              let piece: Piece = this._resourcesService.getPiece(pieceImg.id);
              let pieceIsThreat = true ? piece.type == 'q' || piece.type == 'r' : false
              if (!this.isFriendPiece(pieceNum, piece.position) && pieceIsThreat) {
                threat = true;
              }
            }
          }
        }
        if (threat) {
          moves = moves.filter(move => (move.targetSquare - smaller) < 9)
        }
      }

    }
    return moves
  }

  checkWithOutPiece(pieceId: string) {
    let pieceNode = document.getElementById(pieceId);
    let color = pieceId.charAt(0) == 'b' ? 'w' : 'b';
    let pieceDiv = pieceNode.parentNode;
    document.getElementById(pieceId).remove();
    let solution = this.isCheck(color);
    pieceDiv.appendChild(pieceNode);
    this._resourcesService.cleanClasses(['check'])
    return solution;
  }

  drag(ev) {
    let pieceId = ev.target.id;
    let squareId = ev.target.parentNode.id;
    ev.dataTransfer.setData("pieceId", pieceId);
    let piece: Piece = this._resourcesService.getPiece(pieceId);
    if (piece.type == 'n' && this.checkWithOutPiece(pieceId)) {
    } else {
      let moves: Array<Move> = this.generateMoves(squareId, pieceId);
      if ((this.colorToMove == piece.color)) {
        if (this.isCheckPosition) {
          moves = moves.filter(move => this.moveSolveCheck(move, piece));
        } else if (piece.type != 'k') {
          moves = this.protecKing(moves, piece.type)
        }
        this.drawMoves(moves);
      }
    }

  }

  drop(ev) {
    if (this.isPossibleMove(ev.target)) {
      ev.preventDefault();
      let pieceId = ev.dataTransfer.getData("pieceId");
      let piece: Piece = this._resourcesService.getPiece(pieceId);
      let square = ev.target.getAttribute('id').slice(2);
      let increment = piece.color == 'b' ? 8 : -8;
      if (this.enPassant) {
        if (this.enPassant + increment == square) {
          let innerDiv = document.getElementById('sq' + this.enPassant);
          innerDiv.removeChild(innerDiv.firstChild);
        }
      }
      if (this.isPawnStartPosition(piece.position, piece) && square != piece.position + increment) {
        this.enPassant = parseInt(square);
      } else {
        delete this.enPassant
      }
      this.drawPiece(piece, square);
      this.touchPiece(piece);
      if (piece.type == 'k' && this.isCastlingMove(piece.position, square)) {
        if (square == 7) {
          let rock: Piece = this._resourcesService.getPiece('br8');
          this.drawPiece(rock, 6);
        } else if (square == 63) {
          let rock: Piece = this._resourcesService.getPiece('wr64');
          this.drawPiece(rock, 62);
        } else if (square == 3) {
          let rock: Piece = this._resourcesService.getPiece('br1');
          this.drawPiece(rock, 4);
        } else if (square == 59) {
          let rock: Piece = this._resourcesService.getPiece('wr57');
          this.drawPiece(rock, 60);
        }
        this.drawPiece(piece, square);

      }
      setTimeout(() => {
        if (this.colorToMove == 'b' && this.computerPlayBlack && this.isPlaying && !this.isCheckmate && !this.isTablas) {
          this.doNextMove('b');
        } else if (this.colorToMove == 'w' && this.computerPlayWhite && this.isPlaying && !this.isCheckmate && !this.isTablas) {
          this.doNextMove('w');
        }
      }
        , 200);
    }
    if (this.isReyAhogado(this.colorToMove)) {
      this.isTablas = true;
    }
    this._resourcesService.cleanClasses(['possibleMove', 'possibleCapture']);
  }

  checkTablas() {
    let solution = false;
    let count = 0;
    for (let index = 1; index < 65; index++) {
      let targetSquare = document.getElementById('sq' + index);
      if (targetSquare.hasChildNodes()) {
        count++;
      }
    }
    if (count < 3) {
      solution = true;
    }
    return solution;
  }

  isReyAhogado(color) {
    let kingSrc = "assets/pieces/" + color + "k.png"
    let kingPlace: any = document.querySelectorAll('img[src="' + kingSrc + '"]');
    let kingId = kingPlace[0].id;
    let kingDiv = kingPlace[0].parentNode;
    let kingNode = document.getElementById(kingId);
    let king = this._resourcesService.getPiece(kingId);
    let getAllPossiblesMovesExceptKing = this.getAllPossiblesMovesExceptKing(color);
    let allKingPossiblesMoves = this.generateKingMovings('sq' + king.position, king);
    if (getAllPossiblesMovesExceptKing.length + allKingPossiblesMoves.length < 1) {
      return true
    }
    return false;
  }

  isCastlingMove(piecePosition, square) {
    if (piecePosition - square != 1) {
      return true;
    }
    return false;

  }

  touchPiece(piece) {
    if (piece == { type: 'r', color: 'w', position: 57 }) {
      this.uwlr = false
    } else if (piece == { type: 'r', color: 'w', position: 64 }) {
      this.uwsr = false
    } else if (piece == { type: 'k', color: 'w', position: 61 }) {
      this.uwk = false
    } else if (piece == { type: 'r', color: 'b', position: 1 }) {
      this.ublr = false
    } else if (piece == { type: 'r', color: 'b', position: 8 }) {
      this.ubsr = false
    } else if (piece == { type: 'k', color: 'b', position: 61 }) {
      this.ubk = false
    }
  }

  isPossibleMove(node) {
    if (node.getAttribute('class').includes('possibleMove') ||
      node.parentNode.getAttribute('class').includes('possibleCapture')) {
      return true;
    }
    return false;
  }

  drawPiece(piece: Piece, square: number,) {
    this.colorToMove = piece.color == 'w' ? 'b' : 'w';
    let pieceId = piece.color + piece.type + piece.position;
    if (document.getElementById(pieceId)) {
      document.getElementById(pieceId).remove();
      this.drawPiece(piece, square);
      let audio = new Audio('assets/sounds/chess-move-on-alabaster.wav');
      audio.play();
      this._resourcesService.cleanClasses(['possibleMove', 'possibleCapture']);
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
    if (this.isCheck(piece.color)) {
      this.isCheckPosition = true;
    } else {
      this.isCheckPosition = false;
    }
  }

  // Funciones AI


  doNextMove(color: string) {
    if (this.isCheckPosition) {
      let kingNode = document.getElementsByClassName('check')[0];
      if (kingNode && kingNode.hasChildNodes()) {
        let kingImg = kingNode.getElementsByTagName('img')[0];
        let kingPiece: Piece = this._resourcesService.getPiece(kingImg.id);
        let possibleMoves = this.checkIfMate(kingNode.id, kingImg.id);
        let index = Math.floor(Math.random() * possibleMoves.length);
        let randomMove = possibleMoves[index];
        let pieceNode = document.getElementById('sq' + randomMove.startSquare);
        let pieceImg = pieceNode.getElementsByTagName('img')[0];
        let piece: Piece = this._resourcesService.getPiece(pieceImg.id);
        this.drawPiece(piece, randomMove.targetSquare);
      }
    } else {
      this.choosePiece(color);
    }
    setTimeout(() => {
      if (this.colorToMove == 'b' && this.computerPlayBlack && this.isPlaying && !this.isCheckmate && !this.isTablas) {
        this.doNextMove('b');
      } else if (this.colorToMove == 'w' && this.computerPlayWhite && this.isPlaying && !this.isCheckmate && !this.isTablas) {
        this.doNextMove('w');
      }
    }
      , 200);
    if (this.checkTablas()) {
      this.isTablas = true;
    }
  }

  choosePiece(color: string) {
    let randomSquare = Math.floor(Math.random() * 64) + 1
    let innerDiv = document.getElementById('sq' + randomSquare);
    if (innerDiv.hasChildNodes() && innerDiv.getElementsByTagName('img')[0].id.charAt(0) == color) {
      let pieceId = innerDiv.getElementsByTagName('img')[0].id;
      let piece: Piece = this._resourcesService.getPiece(pieceId);
      let squareId = 'sq' + piece.position;
      let moves: Array<Move> = this.generateMoves(squareId, pieceId);
      moves.forEach(move => {
        let moveDiv = document.getElementById('sq' + move.targetSquare);
        if (moveDiv.hasChildNodes() && moveDiv.getElementsByTagName('img')[0].id.charAt(0) == color) {
          move.startSquare = 65;
        }
      });
      moves = moves.filter(move => move.startSquare > 0 && move.startSquare < 65)
      if (moves.length > 0) {
        let index = Math.floor(Math.random() * moves.length);
        let randomMove = moves[index];
        this.drawPiece(piece, randomMove.targetSquare);
        let pieceInnerDiv = document.getElementById('sq' + randomMove.targetSquare);
        pieceInnerDiv.classList.add('blink');
      } else {
        this.choosePiece(color);
      }
    } else {
      this.choosePiece(color);
    }
  }


  getAllPossiblesMovesExceptKing(color: string) {
    let allPossiblesMoves = [];
    for (let index = 1; index < 65; index++) {
      let targetSquare = document.getElementById('sq' + index);
      if (targetSquare.hasChildNodes() && targetSquare.getElementsByTagName('img')[0].id.charAt(0) == color) {
        let pieceId = targetSquare.getElementsByTagName('img')[0].id;
        let piece: Piece = this._resourcesService.getPiece(pieceId);
        if (piece.type != 'k') {
          let moves: Array<Move>;
          let squareId = 'sq' + piece.position;
          // if (piece.type == 'p') {
          if (this.isCheckPosition && piece.type == 'p') {
            moves = this.generatePawnThreats(squareId, this._resourcesService.getPiece(pieceId));
          } else {
            moves = this.generateMoves(squareId, pieceId);
          }
          allPossiblesMoves.push(...moves);
        }
      }
    }
    return allPossiblesMoves;
  }

  isCheck(color: string) {
    this._resourcesService.cleanClasses(['check'])
    let allPossiblesMoves = this.getAllPossiblesMovesExceptKing(color);
    for (let index = 0; index < allPossiblesMoves.length; index++) {
      let targetSquare = document.getElementById('sq' + allPossiblesMoves[index].targetSquare);
      if (targetSquare.hasChildNodes()) {
        let pieceId = targetSquare.getElementsByTagName('img')[0].id;
        let piece: Piece = this._resourcesService.getPiece(pieceId);
        if (piece.type == 'k' && piece.color != color) {
          targetSquare.classList.add('check');
          this.checkThreatMove = allPossiblesMoves[index];
          this.checkIfMate(targetSquare.id, pieceId);
          return true;
        }
      }
    }
    return false
  }

  moveSolveCheck(move: Move, piece: Piece) {
    let attackSquare = document.getElementById('sq' + this.checkThreatMove.startSquare);
    let pieceId = attackSquare.getElementsByTagName('img')[0].id;
    let attackPiece: Piece = this._resourcesService.getPiece(pieceId);
    if (piece.type == 'k') {
      return true;
    } else if (move.targetSquare == this.checkThreatMove.startSquare) {
      return true;
    } else if (this._resourcesService.isSlidingPiece(attackPiece)) {
      let inBetweenSquares = [];
      let bigger = this.checkThreatMove.startSquare > this.checkThreatMove.targetSquare ? this.checkThreatMove.startSquare : this.checkThreatMove.targetSquare
      let smaller = this.checkThreatMove.startSquare < this.checkThreatMove.targetSquare ? this.checkThreatMove.startSquare : this.checkThreatMove.targetSquare
      if ((bigger - smaller) % 8 == 0) {
        for (let index = smaller + 8; index < bigger; index = index + 8) {
          inBetweenSquares.push(index);
        }
      } else if ((bigger - smaller) % 7 == 0) {
        for (let index = smaller + 7; index < bigger; index = index + 7) {
          inBetweenSquares.push(index);
        }
      } else if ((bigger - smaller) % 9 == 0) {
        for (let index = smaller + 9; index < bigger; index = index + 9) {
          inBetweenSquares.push(index);
        }
      }
      else if ((bigger - smaller) < 9) {
        for (let index = smaller + 1; index < bigger; index++) {
          inBetweenSquares.push(index);
        }
      }
      if (inBetweenSquares.includes(move.targetSquare)) {
        return true;
      }
    }
    return false;
  }




}

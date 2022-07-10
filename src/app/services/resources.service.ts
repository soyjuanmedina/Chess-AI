import { Injectable } from '@angular/core';
import { Piece } from '../interfaces/piece.interface';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  constructor() { }

  getPiece(pieceId: string) {
    let piece: Piece = {
      type: pieceId.charAt(1),
      color: pieceId.charAt(0),
      position: parseInt(pieceId.slice(2))
    };
    return piece;
  }

  isSlidingPiece(piece: Piece) {
    if (piece.type == 'q' || piece.type == 'r' || piece.type == 'b') {
      return true;
    }
    return false;
  }

  cleanClasses() {
    var section = document.querySelector('#board');
    section.querySelectorAll(".square").forEach(e =>
      e.classList.remove("possibleMove", "possibleCapture"));
  }

  clearBoard() {
    for (var i = document.images.length; i-- > 0;)
      document.images[i].parentNode.removeChild(document.images[i]);
  }

  squareHasPiece(square: number) {
    if (square < 1 || square > 64) {
      return false
    }
    let innerDiv = document.getElementById('sq' + square);
    if (innerDiv.hasChildNodes()) {
      return true;
    }
    return false;
  }

  delay(milliseconds) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }

}

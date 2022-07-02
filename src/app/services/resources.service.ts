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
      color: pieceId.charAt(0)
    };
    return piece;
  }

  isSlidingPiece(piece: Piece) {
    return true;
  }

  cleanClasses() {
    var section = document.querySelector('#board');
    section.querySelectorAll(".square").forEach(e =>
      e.classList.remove("posibleMove", "posibleCapture"));
  }
}

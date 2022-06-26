import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Ajedrez';
  startFEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  squareSize: number = 75;
  lightSquare: string = '#842A0D';
  darkSquare: string = '#F1CDC1';
  canvas;
  ctx;
  isDragging=false;


  ngOnInit() {
    // this.canvas = <HTMLCanvasElement>document.getElementById('board');
    // this.ctx = this.canvas.getContext('2d');
    // this.ctx.beginPath();
    // for (let file = 0; file < 8; file++) {
    //   for (let rank = 0; rank < 8; rank++) {
    //     this.drawSquare(this.getSquareColor(file, rank), file * this.squareSize, rank * this.squareSize);
    //   }
    // }
    // this.loadPositionFromFem(this.startFEN);
  }

  loadPositionFromFem(fen: string) {
    let fenBoard: string = fen.split(' ')[0];
    let x: number = 0;
    let y: number = 0;
    [...fenBoard].forEach(symbol => {
      if(symbol == '/'){ 
        x = 0;
        y ++;
      } else{
        if(symbol >= '0' && symbol <= '9'){
          x = x + parseInt(symbol);
        } else{
          let color: string = 'w';
          if (symbol == symbol.toLowerCase()) {
            color = 'b';
          }
          let piece = symbol.toLowerCase();
          // this.drawPiece(color, symbol.toLowerCase(), x * this.squareSize, y * this.squareSize);
          this.drawHTMLPiece(color, piece, x, y);
          x ++;
        }
      }

    });
  }

  drawPiece(color: string, piece: string, x: number, y: number){
    let piece_image = new Image();
    piece_image.src = 'assets/pieces/' + color + piece + '.png';
    piece_image.onload = () => {
      this.ctx.drawImage(piece_image, x, y, this.squareSize, this.squareSize);
    }
  }

  drawSquare(color, file, rank) {
    this.ctx.beginPath();
    this.ctx.rect(file, rank, this.squareSize, this.squareSize);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
  }



  getSquareColor(file, rank) {
    if ((file + rank) % 2 == 0) {
      return this.lightSquare;
    } else {
      return this.darkSquare;
    }

  }

  drawHTMLBoard(){
    var section = document.querySelector('#board');
    for (var x = 0; x <= 7; x++) {
      var row = document.createElement("div"); // Para aplicar saltos de línea separamos las filas
      section.appendChild(row);
      for (var y = 0; y <= 7; y++) { // La misma iteración pero pintando los cuadrados indivualmente
        var element = document.createElement("div");
        row.appendChild(element);
        let position = String.fromCharCode(97 + x) + (y+1);
        element.setAttribute("id", position);
        // element.addEventListener("dragenter", this.dragenter);
        // element.addEventListener("dragleave", this.dragleave);
        element.addEventListener("dragover", this.allowDrop);
        element.addEventListener("drop", this.drop.bind(this));
        if (x % 2 == 0) {
          if (y % 2 == 0) {
            element.classList.add('dark');
          } else {
            element.classList.add('ligth');
          }
        } else {
          if (y % 2 != 0) {
            element.classList.add('dark');
          } else {
            element.classList.add('ligth');
          }
        }

      }
    }
    
  }

  drawHTMLPiece(color, piece, x, y){
    let position = String.fromCharCode(97 + x) + (y+1);
    let innerDiv = document.getElementById(position);
    let img: HTMLImageElement = document.createElement("img");
    img.src = 'assets/pieces/' + color + piece + '.png';
    img.style.width = "50px";
    img.style.height = "50px";
    img.setAttribute("id", color + piece + position);
    img.setAttribute("draggable", "true");
    img.addEventListener('dragstart', this.drag);
    innerDiv.appendChild(img);
  }

  ngAfterViewInit(): void {
    this.drawHTMLBoard();
    this.loadPositionFromFem(this.startFEN);
  }
  
  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    ev.dataTransfer.setData("piece", ev.target.id);
  }

  drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("piece");
    ev.target.appendChild(document.getElementById(data));
  }

}

import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Ajedrez';
  squareSize = 75
  lightSquare = '#842A0D';
  darkSquare = '#F1CDC1';
  canvas;
  ctx;


  ngOnInit() {
    this.canvas = <HTMLCanvasElement>document.getElementById('board');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.beginPath();
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        this.drawSquare(this.getSquareColor(file, rank), file * this.squareSize, rank * this.squareSize);
      }
    }
  }

  drawSquare(color, file, rank) {
    console.log(color, file, rank);
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

  ngAfterViewInit(): void {
    var section = document.querySelector('#board');
    for (var i = 0; i <= 7; i++) {
      var fila = document.createElement("div"); // Para aplicar saltos de línea separamos las filas
      section.appendChild(fila);
      for (var j = 0; j <= 7; j++) { // La misma iteración pero pintando los cuadrados indivualmente
        var element = document.createElement("div");
        fila.appendChild(element);
        if (i % 2 == 0) {
          if (j % 2 == 0) {
            element.classList.add('dark');
            // element.classList.add('addBorder');
          } else {
            element.classList.add('ligth');
          }
        } else {
          if (j % 2 != 0) {
            element.classList.add('dark');
          } else {
            element.classList.add('ligth');
          }
        }

      }
    }

    // El bucle iterará 8 veces (de 0 a 7), que son las filas que tiene un tablero de ajedrez, 
    // y por cada iteración en una fila se efectuarán las iteración por columnas que este tiene (8)
    /* for (var i = 0; i <= 7; i++) {  // Iteración por "fila"

      var fila = document.createElement("div"); // Para aplicar saltos de línea separamos las filas
      section.appendChild(fila);

      for (var j = 0; j <= 7; j++) { // La misma iteración pero pintando los cuadrados indivualmente

        var element = document.createElement("div");
        fila.appendChild(element);

        if (i % 2 == 0 && j % 2 != 0 || i % 2 != 0 && j % 2 == 0) { // Aquí vemos si la relación fila-columna es par o impar, de esta manera implementaremos de manera alternada una clase para aplicarle por css un background distinto y hacer el efecto de tablero de ajedrez
          element.classList.add('oscuro');
        }
      }
      section.appendChild(fila);
    } */
  }

}

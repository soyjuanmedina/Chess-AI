import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigurationService } from './services/configuration.service';
import { MoveService } from './services/move.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'Ajedrez';
  startFEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  squareSize: number = 75;
  isConfiguring: boolean = false;
  editItem: string = null;

  boardConfiguration: FormGroup;

  constructor(public _configurationService: ConfigurationService, public _moveService: MoveService) {
    this.boardConfiguration = new FormGroup({
      ligthColor: new FormControl(),
      darkColor: new FormControl(),
      squareSize: new FormControl()
    })
    this.boardConfiguration.disable();
  }

  setConfiguring() {
    this.isConfiguring = !this.isConfiguring;
  }

  loadPositionFromFem(fen: string) {
    let fenBoard: string = fen.split(' ')[0];
    let square: number = 1;
    [...fenBoard].forEach(symbol => {
      if (symbol == '/') {

      } else {
        if (symbol >= '0' && symbol <= '9') {
          square = square + parseInt(symbol);
        } else {
          let color: string = 'w';
          if (symbol == symbol.toLowerCase()) {
            color = 'b';
          }
          let piece = symbol.toLowerCase();
          this.drawPiece(color, piece, square);
          square++;
        }
      }
    });
  }

  drawBoard() {
    let i = 1
    var section = document.querySelector('#board');
    for (var y = 0; y <= 7; y++) {
      var row = document.createElement("div");
      section.appendChild(row);
      row.classList.add('row');
      for (var x = 0; x <= 7; x++) {
        var square = document.createElement("div");
        row.appendChild(square);
        square.setAttribute("id", 'sq' + i);
        square.classList.add('square');
        square.addEventListener("dragover", this.allowDrop);
        square.addEventListener("drop", this.drop.bind(this));
        if (x % 2 == 0) {
          if (y % 2 == 0) {
            square.classList.add('ligth');
          } else {
            square.classList.add('dark');
          }
        } else {
          if (y % 2 != 0) {
            square.classList.add('ligth');
          } else {
            square.classList.add('dark');
          }
        }
        i++;
      }
    }
  }

  drawBoard2() {
    var section = document.querySelector('#board');
    for (var x = 0; x <= 7; x++) {
      var row = document.createElement("div");
      section.appendChild(row);
      for (var y = 0; y <= 7; y++) {
        var element = document.createElement("div");
        row.appendChild(element);
        let position = String.fromCharCode(97 + x) + (y + 1);
        element.setAttribute("id", position);
        element.classList.add('square');
        element.addEventListener("dragover", this.allowDrop);
        element.addEventListener("drop", this.drop.bind(this));
        if (x % 2 == 0) {
          if (y % 2 == 0) {
            element.classList.add('ligth');
          } else {
            element.classList.add('dark');
          }
        } else {
          if (y % 2 != 0) {
            element.classList.add('ligth');
          } else {
            element.classList.add('dark');
          }
        }
      }
    }

  }

  drawPiece(color, piece, square) {
    // let position = String.fromCharCode(97 + x) + (y + 1);
    let innerDiv = document.getElementById('sq' + square);
    let img: HTMLImageElement = document.createElement("img");
    img.src = 'assets/pieces/' + color + piece + '.png';
    img.classList.add('square');
    img.setAttribute("id", color + piece + square);
    img.setAttribute("draggable", "true");
    img.addEventListener('dragstart', this.drag.bind(this));
    innerDiv.appendChild(img);
  }

  ngOnInit() {
    this.drawBoard();
    this.loadPositionFromFem(this.startFEN);
  }

  // Funciones edición de la configuración

  edit(parameter) {
    this.boardConfiguration.controls[parameter].enable();
    this.editItem = parameter;
  }

  cancelEdit() {
    this.boardConfiguration.disable();
    delete this.editItem;
  }

  update(parameter) {
    let value = this.boardConfiguration.controls[parameter].value;
    this._configurationService.updateParameter(parameter, value);
    this.cancelEdit();
  }

  // Funciones Drag & Drop

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    let pieceId = ev.target.id;
    let pieceSrc = ev.target.src;
    let square =  ev.target.parentNode.id;
    ev.dataTransfer.setData("pieceId", pieceId);
    ev.dataTransfer.setData("pieceSrc", pieceSrc);
    this._moveService.generateSlideMovings(square, pieceId);
    /*     let audio = new Audio('assets/sounds/dragslide1.mp3');
        audio.play(); */
  }

  drop(ev) {
    ev.preventDefault();
    let pieceId = ev.dataTransfer.getData("pieceId");
    let pieceSrc = ev.dataTransfer.getData("pieceSrc");
    if (ev.target.getAttribute('src')) {
      ev.target.setAttribute('src', pieceSrc);
    }
    ev.target.appendChild(document.getElementById(pieceId));
    /*     let audio = new Audio('assets/sounds/chess-move-on-alabaster.wav');
        audio.play(); */
    // ev.target.removeChild(document.getElementById('wph7'));

  }

}

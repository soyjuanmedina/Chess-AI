import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigurationService } from './services/configuration.service';

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

  constructor(public _configurationService: ConfigurationService) {
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
    let x: number = 0;
    let y: number = 0;
    [...fenBoard].forEach(symbol => {
      if (symbol == '/') {
        x = 0;
        y++;
      } else {
        if (symbol >= '0' && symbol <= '9') {
          x = x + parseInt(symbol);
        } else {
          let color: string = 'w';
          if (symbol == symbol.toLowerCase()) {
            color = 'b';
          }
          let piece = symbol.toLowerCase();
          this.drawPiece(color, piece, x, y);
          x++;
        }
      }
    });
  }

  drawBoard() {
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

  drawPiece(color, piece, x, y) {
    let position = String.fromCharCode(97 + x) + (y + 1);
    let innerDiv = document.getElementById(position);
    let img: HTMLImageElement = document.createElement("img");
    img.src = 'assets/pieces/' + color + piece + '.png';
    img.classList.add('square');
    img.setAttribute("id", color + piece + position);
    img.setAttribute("draggable", "true");
    img.addEventListener('dragstart', this.drag);
    innerDiv.appendChild(img);
  }

  // Funciones Drag & Drop

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

}

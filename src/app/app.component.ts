import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Piece } from './interfaces/piece.interface';
import { ConfigurationService } from './services/configuration.service';
import { MoveService } from './services/move.service';
import { ResourcesService } from './services/resources.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'Ajedrez';
  squareSize: number = 75;
  isConfiguring: boolean = false;
  editItem: string = null;

  boardConfiguration: FormGroup;

  constructor(public _configurationService: ConfigurationService, public _moveService: MoveService,
    public _resourcesService: ResourcesService) {
    this.boardConfiguration = new FormGroup({
      ligthColor: new FormControl(),
      darkColor: new FormControl(),
      squareSize: new FormControl(),
      fenPosition: new FormControl()
    })
    this.boardConfiguration.disable();
    this.boardConfiguration.controls['fenPosition'].enable();
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
          let piece: Piece = {
            type: symbol.toLowerCase(),
            color: color
          };
          this._moveService.drawPiece(piece, square);
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
        square.addEventListener("dragover", this._moveService.allowDrop.bind(this._moveService));
        square.addEventListener("drop", this._moveService.drop.bind(this._moveService));
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



  ngOnInit() {
    this.drawBoard();
    this.loadPositionFromFem(this._moveService.FEN);
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

  loadFromFemPosition() {
    this._resourcesService.clearBoard()
    this.loadPositionFromFem(this.boardConfiguration.controls['fenPosition'].value);
  }

}

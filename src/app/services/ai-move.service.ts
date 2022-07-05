import { Injectable } from '@angular/core';
import { Move } from '../interfaces/move.interface';
import { Piece } from '../interfaces/piece.interface';
import { MoveService } from './move.service';
import { ResourcesService } from './resources.service';

@Injectable({
  providedIn: 'root'
})
export class AiMoveService {

  constructor(public _resourcesService: ResourcesService) { }


}

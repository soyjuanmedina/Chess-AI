import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Interfaces

import { DOCUMENT } from '@angular/common';

@Injectable()
export class ConfigurationService {

  configuration = {
    ligthColor: '#fdb958',
    darkColor: '#061374',
    squareSize: 50,
  };

  private themeWrapper = document.querySelector('body');

  constructor() {
    if (localStorage.boardConfiguration) {
      this.configuration = JSON.parse(localStorage.getItem('boardConfiguration'));
    }
    this.themeWrapper.style.setProperty('--ligthColor', this.configuration.ligthColor);
    this.themeWrapper.style.setProperty('--darkColor', this.configuration.darkColor);
    this.themeWrapper.style.setProperty('--squareSize', this.configuration.squareSize + 'px');
  }

  updateParameter(parameter, value) {
    this.configuration[parameter] = value;
    localStorage.setItem('boardConfiguration', JSON.stringify(this.configuration));
    if (parameter == 'squareSize') {
      value = value + 'px';
    }
    parameter = '--' + parameter;
    this.themeWrapper.style.setProperty(parameter, value);
  }

  getPortalParameters() {

  };

}

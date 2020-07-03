import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuStateService {
  public state$: Observable<void>;

  private _state = new Subject<any>();

  constructor() {
    this.state$ = this._state.asObservable();
  }

  public clearMenu(): void {
    this._state.next();
  }
}

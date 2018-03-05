import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class InputService {
  private inputSubject$ = new BehaviorSubject<String>('');
  constructor() { }

  changeInput(term) {
    this.inputSubject$.next(term);
  }

  getInput(): Observable<String> {
    return this.inputSubject$.asObservable();
  }
}

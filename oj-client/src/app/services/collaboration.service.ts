import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

declare var io: any; // io is already imported in angular.cli.json

@Injectable()
export class CollaborationService {
  collaborationSocket: any;
  private _userSource = new Subject<string>();
  constructor() { }

  init(editor: any, sessionId: string): Observable<string> {
    // send to server
    this.collaborationSocket = io(window.location.origin, {query: 'sessionId=' + sessionId});
    // //wait for 'message' event from server
    // this.collaborationSocket.on("message", (message) => {
    //   console.log('message received from the server: ' + message);
    // })
    
    // handle the changes from server
    this.collaborationSocket.on('change', (delta: string) => {
      console.log('collaboration: editor changes by ' + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      // apply the changes on editor
      editor.getSession().getDocument().applyDeltas([delta]);
    });
    // handle user changes
    this.collaborationSocket.on('userchange', (users: string[]) => {
      console.log('user changed: ' + users);
      this._userSource.next(users.toString());
    })

    return this._userSource.asObservable();
  }

  // emit event to make changes and inform server and other collaborators
  change(delta: string): void {
    // emit "change" event
    this.collaborationSocket.emit('change', delta);
  }

  restoreBuffer(): void {
    // let the server handle the event
    this.collaborationSocket.emit('restoreBuffer');
  }
}

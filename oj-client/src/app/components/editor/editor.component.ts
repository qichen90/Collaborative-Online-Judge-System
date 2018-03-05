import { Component, OnInit } from '@angular/core';
import { CollaborationService } from '../../services/collaboration.service';
import { ActivatedRoute, Params } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs/Subscription';

declare var ace: any;// must be declared
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  editor: any;

  defaultContent = {
    'Java': `public class Solution{
      public static void main(String[] args){
        // Please type your code here...
      }
    }`,
    'Python': `class Solution:
      def example():
        # Please type your code here...
    `,
    'C++':`int main(){
        /* Please type your code here... */
      }`
  }

  languages: string[] = ['Java', 'Python', 'C++'];
  language: string = 'Java';
  sessionId: string;

  output: string;

  users: string;
  subscriptionUsers: Subscription;

  // inject route service and collaborationService
  constructor(private collaboration: CollaborationService,
              private route: ActivatedRoute,
              private dataService: DataService) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
        this.collaboration.restoreBuffer();
    });
  }

  resetEditor(): void {
    this.editor.setValue(this.defaultContent[this.language]);
    this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());    
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  submit(): void {
    let user_code = this.editor.getValue();
    console.log(user_code);

    const data = {
      code: user_code,
      lang: this.language.toLocaleLowerCase()
    };

    this.dataService.buildAndRun(data)
      .then(res => this.output = res);
  }

  initEditor(): void {
    // editor basic setting
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");
    this.resetEditor();

    // initialize collaborationService
    this.subscriptionUsers = this.collaboration.init(this.editor, this.sessionId)
      .subscribe(users => this.users = users);
    this.editor.lastAppliedChange = null;

    // register change callback
    this.editor.on("change", e => {
      console.log('editor changes: ' + JSON.stringify(e));
      // if the change is the same as the last one, then skip
      if(this.editor.lastAppliedChange != e){
        this.collaboration.change(JSON.stringify(e));
      }
    }); 
  }
}

import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';

const DEFAULT_PROBLEM: Problem = Object.freeze({
  id: 0,
  name: '',
  desc: '',
  difficulty: 'easy'
})

@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})
export class NewProblemComponent implements OnInit {
  // create a shadow copy of problem and assign it to newProblem
  // Object.assign() copies property values. If the source value is a reference to an object, it only copies that reference value.
  newProblem: Problem = Object.assign({}, DEFAULT_PROBLEM);
  difficulties: string[] = ['easy', 'medium', 'hard', 'super'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }
  
  addProblem(){
    this.dataService.addProblem(this.newProblem);
    // assign newProblem a new problem instance
    // Otherwise newProblem have same reference as the one we added to the list
    // then when next time add new problem, it will override the problem we have already add into the problem list.
    this.newProblem = Object.assign({}, DEFAULT_PROBLEM);
  }
}

import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs/Subscription';
import { InputService } from '../../services/input.service';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {
  problems: Problem[];
  subcriptionProblems: Subscription;
  // for navbar
  searchTerm: String = '';
  subscriptionInput: Subscription;

  constructor(private dataService: DataService,
    private inputService: InputService) { }

  ngOnInit() {
    this.getProblems();
    this.getSearchTerm();
  }
  ngOnDestroy() {
    this.subcriptionProblems.unsubscribe();
  }
  
  getProblems() {
    this.subcriptionProblems = this.dataService.getProblems()
    .subscribe(problems => {
      this.problems = problems;
    });
  }

  getSearchTerm(): void { 
    this.subscriptionInput = this.inputService.getInput()
        .subscribe(term => this.searchTerm = term);
  }
}

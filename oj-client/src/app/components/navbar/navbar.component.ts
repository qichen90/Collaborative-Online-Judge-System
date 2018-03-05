import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { InputService } from '../../services/input.service';
import 'rxjs/add/operator/debounceTime'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  title = 'LabCode';
  searchBox: FormControl = new FormControl();
  subscription: Subscription;

  constructor(private inputService: InputService,
              private router: Router) { }

  ngOnInit() {
    this.subscription = this.searchBox
                        .valueChanges
                        .debounceTime(200)
                        .subscribe(term => {this.inputService.changeInput(term)});
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  searchProblem(): void {
    this.router.navigate(['/problems']);
  }
} 

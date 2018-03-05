import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class DataService {
  private _problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private httpClient: HttpClient) { }
  
  // return a list of problems
  getProblems(): Observable<Problem[]> {
    this.httpClient.get('api/v1/problems')
      .toPromise()
      .then((res: any) => {
        this._problemSource.next(res);
      })
      .catch(this.handleError);
    return this._problemSource.asObservable();

  }
  //use subscribe
  // getProblems(): Observable<Problem[]> {
  //   this.httpClient.get('api/v1/problems')
  //     .subscribe((res:any) => this._problemSource.next(res));
  //   return this._problemSource.asObservable();

  // }

  // return a problem by id
  getProblem(id: number): Promise<Problem> {
    return this.httpClient.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: any) => res)
      .catch(this.handleError);
  }

  // add problem
  addProblem(problem: Problem){
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/problems', problem, options)
      .toPromise()
      .then((res: any) => {
        this.getProblems();
        return res;
      })
      .catch(this.handleError);
  }

  // build and run: POST
  buildAndRun(data): Promise<any>{
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/build_and_run', data, options)
      .toPromise()
      .then(res => {
        console.log(res);
        return res;
      })
      .catch(this.handleError);
  }

  // // modify problem
  // editProblem(problem: Problem) {
  //   const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  //   return this.httpClient.post('api/v1/problems', problem, options)
  //     .toPromise()
  //     .
  // }

  // handle errors
  private handleError(error: any): Promise<any>{
    console.error('Error reference', error);
    return Promise.reject(error.body || error);
  }
}

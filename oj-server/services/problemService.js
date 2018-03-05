const ProblemModel = require('../models/problemModel');

const getProblems = function(){
  // in the callback function, the first argument is error 
  // do not forget to handle error
  return new Promise((resolve, reject) => {
    ProblemModel.find({}, (err, problems) => {
        if(err) {
          reject(err);
        }else {
          resolve(problems);
        }
      });
  });
};

const getProblem = function(id){
  return new Promise((resolve, reject) => {
  ProblemModel.findOne({id: id}, (err, problem) => {
      if(err) {
        reject(err);
      }else {
        resolve(problem);
      }
    });
  });
};

const addProblem = function(newProblem){
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({name: newProblem.name}, (err, problem) => {
        //if problem already exists
        if(problem) {
          reject("Problem name already exists!");
        }else {
        ProblemModel.count({}, (err, num) => {
            if(err){
              reject(err);
            }
            newProblem.id = num + 1;
            // create mongodb object
            let mongoProblem = new ProblemModel(newProblem);
            mongoProblem.save();
            resolve(mongoProblem);
        });
      }
    });
  });
};

// modify problem
const editProblem = function(editedProblem){
  return new Promise((resolve, reject) => {
    ProblemModel.update({name: editedProblem.name}, (err, problem) => {
      if(!problem){
        reject('No problem exists!');
      }else{
        resolve(problem);
      }
    });
  });
};

module.exports = {
  getProblems,
  getProblem,
  addProblem,
  editProblem
};
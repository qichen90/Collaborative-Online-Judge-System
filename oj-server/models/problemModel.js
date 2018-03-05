const mongoose = require('mongoose');
// Capitalize Number, String.
const ProblemSchema = mongoose.Schema({
    id: Number,
    name: String,
    desc: String,
    difficulty: String
});

const ProblemModel = mongoose.model('ProblemModel', ProblemSchema);

module.exports = ProblemModel;
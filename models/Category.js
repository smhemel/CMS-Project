const moongose = require('mongoose')
const Schema = moongose.Schema;


const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    }
});



module.exports = moongose.model('categories', CategorySchema);
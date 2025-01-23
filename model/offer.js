const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const offerSchema = new Schema ({
    amount: {type: Number, min: [0.01, 'value should be greater than 0,01'], required: true},
    status: {type: String, enum:['pending', 'rejected', 'accepted'], required: true, default: 'pending'},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    item: {type: Schema.Types.ObjectId, ref: 'Item'}


})

module.exports = mongoose.model('Offer', offerSchema);
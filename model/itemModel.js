const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: { type: String, required: [true, 'title is required'] },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    condition: {
        type: String,
        required: [true, 'condition is required'],
        enum: {
            values: ['new', 'like-new', 'good','fair', 'acceptable'],
         
            message: '{VALUE} is not a valid condition'
            
        }
    },
    price: {
        type: Number,
        required: [true, 'price is required'],
        min: [0.01, 'price must be at least 0.01']
    },
    details: { type: String, required: [true, 'details are required'] },
    image: { type: String, required: [true, 'image is required'] },
    active: { type: Boolean, default: true },
    totalOffers: {type: Number, default:0}, 
    highestOffer: {type: Number, default: 0},
    offers: [{ type: Schema.Types.ObjectId, ref: 'Offer' }]
});

// Export model
module.exports = mongoose.model('Item', itemSchema);

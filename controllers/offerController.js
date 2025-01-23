const offer = require('../models/offer'); 
const Item = require('../models/itemModel'); 

exports.makeOffer = (req, res, next) => {
    const userId = req.session.user; 
    const amount = parseFloat(req.body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
        req.flash('error', 'Invalid offer amount');
        return res.redirect(`/items/${req.params.id}`);
    }

    Item.findById(req.params.id)
        .then(item => {
            if (!item) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            if (item.seller.toString() === userId) {
                const error = new Error('You cannot make an offer on your own item');
                error.status = 401;
                return next(error);
            }

            const newOffer = new offer({
                amount: amount,
                status: 'pending',
                user: userId,
                item: item._id, 
            });

            return newOffer.save()
                .then(offer => {
                    item.offers.push(offer._id);
                    item.totalOffers += 1;
                    item.highestOffer = Math.max(item.highestOffer, amount);
                    return item.save();
                })
                .then(() => {
                    req.flash('success', 'Offer submitted successfully');
                    res.redirect(`/items/${req.params.id}`);
                });
        })
        .catch(err => next(err));
};



exports.viewOffers = (req, res, next) => {
    const itemId = req.params.id; 
    const userId = req.session.user; 

    Item.findById(itemId)
        .populate('seller', 'firstName lastName') 
        .populate({
            path: 'offers',
            populate: { path: 'user', select: 'firstName lastName' } 
        })
        .then(item => {
            if (!item) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }
            

            res.render('./offer/offers', { offers: item.offers, item });
        })
        .catch(err => next(err));
};





exports.acceptOffer = (req, res, next) => {
    const itemId = req.params.id; 
    const offerId = req.params.offerId;
    const userId = req.session.user; 

    Item.findById(itemId)
        .populate('offers') 
        .then(item => {
            if (!item) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }
           

           
            const acceptedOffer = item.offers.find(offer => offer._id.toString() === offerId);
            if (!acceptedOffer) {
                const error = new Error('Offer not found');
                error.status = 404;
                return next(error);
            }
            //set item to inactive
            item.active = false;

            
            const updateOffers = item.offers.map(offer => {
                if (offer._id.toString() === offerId) {
                    offer.status = 'accepted';
                } else {
                    offer.status = 'rejected';
                }
                return offer.save();
            });

            
            return Promise.all(updateOffers)
                .then(() => item.save()) 
                .then(() => {
                    res.redirect(`/items/${itemId}/offers`); 
                });
        })
        .catch(err => next(err));
};

var express = require('express');
var router = express.Router();

var dataBike =[{name:"BIKO45", price:679, url:"./images/bike-1.jpg"},
{name:"ZOOK7", price:799, url:"./images/bike-2.jpg"},
{name:"LIKO89", price:839, url:"./images/bike-3.jpg"},
{name:"CEWO", price:1089, url:"./images/bike-4.jpg"},
{name:"TITAN", price:1399, url:"./images/bike-5.jpg"},
{name:"ANGEL99", price:1999, url:"./images/bike-6.jpg"}]


//STRIPE is required with my personnal key
const stripe = require('stripe')('sk_test_wpi6z8KBu6lc5tJgG0e4cYQ0');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.dataCardBike==undefined){
    req.session.dataCardBike = []
  }
  res.render('index', { title: 'Express', dataBike});
});


router.get('/shop', function(req, res, next) {
  res.render('shop', { title: 'Express', dataCardBike:req.session.dataCardBike});
});


router.post('/shop', function(req, res, next) {
  var mustbeupdated= false;
//Here we make sure if the same bike is added twice it only changes the quantity and does not add the same bike on a newline
  for (var i = 0; i<req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name===req.body.nameFront){
      req.session.dataCardBike[i].quantity++;
      mustbeupdated =true
    }
  }
  if(mustbeupdated==false){
    req.session.dataCardBike.push({name: req.body.nameFront, price: req.body.priceFront, url: req.body.urlFront, quantity: req.body.quantityFront})
  }
  res.render('shop', { title: 'Express', dataCardBike: req.session.dataCardBike});
});


router.post('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.body.position,1)
  res.render('shop', { title: 'Express', dataCardBike: req.session.dataCardBike});
});

router.post('/update-shop', function(req, res, next) {
  req.session.dataCardBike[req.body.position].quantity= req.body.quantity;
  res.render('shop', { title: 'Express', dataCardBike: req.session.dataCardBike});
});

router.post('/checkout', function(req, res, next) {
  const token = req.body.stripeToken;

  var totalCmdFromBackEnd = 0;
  var ordersReferences = [];
// we count the total price here to prevent any frontend "hacking"
  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmdFromBackEnd = totalCmdFromBackEnd + (req.session.dataCardBike[i].quantity * req.session.dataCardBike[i].price);
    ordersReferences.push(req.session.dataCardBike[i].name)
  };

  var name = req.body.stripeShippingName + " | ";
  var fullAddress = req.body.stripeShippingAddressLine1 + " - " + req.body.stripeShippingAddressZip + " - " + req.body.stripeShippingAddressCity + " | ";
  var ordersList = "Ref: "+ ordersReferences.join(' - ');
  //Here are the stripe options to create a charge
  const charge = stripe.charges.create({
    amount: totalCmdFromBackEnd*100,
    currency: 'eur',
    description: name + fullAddress + ordersList,
    source: token,
  }).then(req.session.dataCardBike = []);

  res.render('index', { title: 'Express', dataBike});
});
module.exports = router;

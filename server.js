//cd live/PayIdMobile/PayidWallet

//importing libraries
var express = require("express");
var http = require('http');
const { Wallet,XpringClient, XrpClient, XrpPayIdClient, XrplNetwork,TransactionStatus } = require("xpring-js");



//creating express app
var app = express();
    app.set('port', process.env.PORT || 3000);



//selecting xrp network
const network = XrplNetwork.Test

// Build an XrpClient
const rippledUrl = 'test.xrp.xpring.io:50051';
const xrpClient = new XrpClient(rippledUrl, network);

// Build a PayIdClient
const payIdClient = new XrpPayIdClient(network);

// XpringClient combines functionality from XRP and PayID
const xpringClient = new XpringClient(payIdClient, xrpClient);

// A wallet with some balance on TestNet.
const wallet1 = Wallet.generateWalletFromSeed('shFtJcbthmp81z1PqECgPLgGeW8Uk');
const wallet2 = Wallet.generateWalletFromSeed('snYP7oArxKepd3GPDcrjMsJYiJeJB');

async function walet_balance(wallet2) {
	
	const balance_new = await xrpClient.getBalance(wallet2.getAddress());
    //console.log("Balance remiter: "+balance_new)
	//return balance_new
	return balance_new;
	
}

async function send_xrp(send_amount, payId, wallet) {
	
	// Send XRP to the given PayID.
    const transactionHash = await xpringClient.send(send_amount, payId, wallet);
	const status = await xrpClient.getPaymentStatus(transactionHash);
	const result = statusCodeToString(status);
	
	//get balance
	const balance_new = await xrpClient.getBalance(wallet.getAddress())
	
	//r=[result,balance_new];
	
	return result;
	
}

function statusCodeToString(status) {
    switch (status) {
      case TransactionStatus.Succeeded:
        return "SUCCEEDED"
      case TransactionStatus.Failed: 
        return "FAILED"
      case TransactionStatus.Pending:
        return "PENDING"
      case TransactionStatus.Unknown:
      default:
        return "UNKNOWN"
    }
}

 //test api
app.get('/', (req, res) => {
  res.send('HEY!')
 })


//get balance
app.get("/api/get_balance", (req, res, next) => {
	
	//validate variables
    if (!req.param) {
        return res.status(400).send({
            message: "User  can not be empty payid address"
        });
    }
    
	//Extract variables
    var wallet_Seed = req.param('Seed');
	
	//creating wallet using seed
	const wallet = Wallet.generateWalletFromSeed(wallet_Seed);
	
	
	//do some thing
	function feedback(value){
	   var myArray = {"balance": value};
	       res.json(myArray);	
		
	}
	
	walet_balance(wallet).then((value) => feedback(value));
   
});

//send money
app.post('/api/send_money', function (req, res) {
   
    //validate variables
    if (!req.param) {
        return res.status(400).send({
            message: "User  can not be empty"
        });
    }
    
	//Extract variables
    var amount = req.param('send_amount');
    var payId = req.param('payId');
	var wallet_Seed = req.param('wallet_Seed');

	//creating wallet using seed
	const wallet = Wallet.generateWalletFromSeed(wallet_Seed);

	// Amount of XRP to send
    const send_amount = BigInt(amount);

    //do some thing with variable
	function feedback(value){
	
     res.json([value]);	
		
	}
	
	//send_xrp(send_amount, payId, wallet);
	send_xrp(send_amount, payId, wallet).then((value) => feedback(value));
 
});


// Listen to port
app.listen(app.get('port'), function () {
  console.log('App is listening on port ' + app.get('port'));
});








/*
http://localhost:3000/api/sum/2/3
http://localhost:3000/api/get_balance
http://localhost:3000/api/send_money
app.listen(3000, () => {
 console.log("Server running on port 3000");
});
*/
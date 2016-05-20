var http = require('http');

exports.signup = function(req, res) {
	var nano = require('nano')('http://couch-db-lb-1005347954.us-west-2.elb.amazonaws.com:5984/');
	console.log("signup Called");
	var name = req.body.name;
	var id = req.body.id;

	var test = nano.use('test');
/*
	http.get({
		'host' : 'api.ipify.org',
		'port' : 80,
		'path' : '/'
	}, function(resp) {
		resp.on('data', function(ip) {
			console.log("My public IP address is: " + ip);
		});
	});*/

	//test db stores the IP address
	var ip;
	test.get("IP", function(err,body){
		if(err)
		{
			console.log('[test.get] ', err.message);
		}
		else
		{
			console.log("Result: "+JSON.stringify(body));
			ip="http://" +body.IPaddress+":5984/";
			console.log("IP:" +ip);
			var nano2 = require('nano')(ip);
			
			//user is the actual database
			var user= nano2.use('user');
			user.insert({"Name" : name,"ID" : id},'',
					function(err, body, header) {
						if (err) {
							console.log('[test.insert] ', err.message);
						} else {
							nano2.db.replicate('user','http://52.40.31.236:5984/user',
											{
												create_target : true
											},
											function(err, body) {
												if (err) {
													console.log("Server 1 : Fail"+ err);
												} else {
													console.log("Server 1: Update Success" +body);
													}
											});
							nano2.db.replicate('user','http://52.37.144.96:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 2 : Fail"+ err);
										} else {
											console.log("Server 2: Update Success" +body);
										}
									});
							nano2.db.replicate('user','http://52.27.41.16:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 3 : Fail"+ err);
										} else {
											console.log("Server 3: Update Success" +body);
										}
									});
							res.render("index", {title:"Express",Message : "Welcome " + name + " " + id});
						}
					});
		}
	});
	

};
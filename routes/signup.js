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
			console.log("Request received at" +body.IPaddress);
			var nano2 = require('nano')(ip);
			
			//user is the actual database
			var user= nano2.use('user');
			
			var instance1="http://52.27.82.49:5984/";
			var instance2="http://52.37.241.178:5984/";
			var instance3="http://52.38.89.244:5984/";
			
			if(ip==instance1)
			{
				user.insert({"Name" : name,"ID" : id},'',
					function(err, body, header) {
						if (err) {
							console.log('[test.insert] ', err.message);
						} else {
							
							nano2.db.replicate('user','http://52.37.241.178:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 2 : Partition present, Replication Failed"+ err);
										} else {
											console.log("Server 2: Replication Success" +body);
										}
									});
							nano2.db.replicate('user','http://52.38.89.244:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 3 : Partition present, Replication Failed"+ err);
										} else {
											console.log("Server 3: Replication Success" +body);
										}
									});
							res.render("index", {title:"Express",Message : "Welcome " + name + " " + id});
						}
					});
		}
			//Request at 2:
			else if(ip==instance2)
			{
				user.insert({"Name" : name,"ID" : id},'',
					function(err, body, header) {
						if (err) {
							console.log('[test.insert] ', err.message);
						} else {
							nano2.db.replicate('user','http://52.27.82.49:5984/user',
											{
												create_target : true
											},
											function(err, body) {
												if (err) {
													console.log("Server 1 : Partition present, Replication Failed"+ err);
												} else {
													console.log("Server 1: Replication Success" +body);
													}
											});
						
							nano2.db.replicate('user','http://52.38.89.244:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 3 : Partition present, Replication Failed"+ err);
										} else {
											console.log("Server 3: Replication Success" +body);
										}
									});
							res.render("index", {title:"Express",Message : "Welcome " + name + " " + id});
						}
					});
		}
			//Request at 3
			else
		{
			user.insert({"Name" : name,"ID" : id},'',
					function(err, body, header) {
						if (err) {
							console.log('[test.insert] ', err.message);
						} else {
							nano2.db.replicate('user','http://52.27.82.49:5984/user',
											{
												create_target : true
											},
											function(err, body) {
												if (err) {
													console.log("Server 1 : Partition present, Replication Failed"+ err);
												} else {
													console.log("Server 1: Replication Success" +body);
													}
											});
							nano2.db.replicate('user','http://52.37.241.178:5984/user',
									{
										create_target : true
									},
									function(err,body) {
										if (err) {
											console.log("Server 2 : Partition present, Replication Failed"+ err);
										} else {
											console.log("Server 2: Replication Success" +body);
										}
									});
						
							res.render("index", {title:"Express",Message : "Welcome " + name + " " + id});
						}
					});
		}
		}
	});
	

};
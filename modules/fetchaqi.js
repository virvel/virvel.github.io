'use strict';


var token = "f11e6112c981db7216f667c3a8d56bd9d08487c0";

function fetch(uid)
{
	var url ="http://api.waqi.info/feed/@" + uid + "/?token=" + token;
	sendRequest(url, callback);
}

function sendRequest(url, callback) {
	
	var req = new XMLHttpRequest();
	
	req.open("GET", url);
	req.onreadystatechange = function() {
		console.log(req.status);
    	if (req.readyState == 4 && req.status == 200) {
        	callback(req.response);
    	}
	};
	
	req.onerror = function(evt) {
			console.log(evt);
	};
	
	req.send();
}

function callback(response)
{
	if (JSON.parse(response).status == "ok")
	{
	console.log(JSON.stringify(JSON.parse(response)));

	}
	else
	{
	post("Ingen data, prova igen!");
	}
}


export {fetch};
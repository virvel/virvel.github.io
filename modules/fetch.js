'use strict';

var token = "f11e6112c981db7216f667c3a8d56bd9d08487c0";

function search(nwlat, nwlong, selat, selong, callback)
{
	var url ="https://api.waqi.info/map/bounds/?latlng=" + nwlat + "," + nwlong + "," + selat + "," + selong + "&token=" + token;
	sendRequest(url, callback);
}

function sendRequest(url, callback) {
	
	var req = new XMLHttpRequest();
	req.open("GET", url);
	req.onreadystatechange = function() {
    	if (req.readyState === 4 && req.status === 200) {
        	return callback(req.response);
    	}
	};
	req.onerror = function(evt) {
			console.log(evt);
	};
	req.send();

}

export {search};

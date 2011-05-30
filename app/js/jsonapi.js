function JSONAPI (obj) {
	this.host = obj.host;
	this.port = obj.port || 20059;
	this.salt = obj.salt;
	this.username = obj.username;
	this.password = obj.password;
	this.urlFormats = {
		"call" : "http://%s:%s/api/call?method=%s&args=%s&key=%s&callback=?",
		"callMultiple" : "http://%s:%s/api/call-multiple?method=%s&args=%s&key=%s&callback=?"
	};

	var that = this;

	var sprintf=function(){function b(a,b){for(var c=[];b>0;c[--b]=a);return c.join("")}function a(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}var c=function(){c.cache.hasOwnProperty(arguments[0])||(c.cache[arguments[0]]=c.parse(arguments[0]));return c.format.call(null,c.cache[arguments[0]],arguments)};c.format=function(c,d){var e=1,f=c.length,g="",h,i=[],j,k,l,m,n,o;for(j=0;j<f;j++){g=a(c[j]);if(g==="string")i.push(c[j]);else if(g==="array"){l=c[j];if(l[2]){h=d[e];for(k=0;k<l[2].length;k++){if(!h.hasOwnProperty(l[2][k]))throw sprintf('[sprintf] property "%s" does not exist',l[2][k]);h=h[l[2][k]]}}else l[1]?h=d[l[1]]:h=d[e++];if(/[^s]/.test(l[8])&&a(h)!="number")throw sprintf("[sprintf] expecting number but found %s",a(h));switch(l[8]){case"b":h=h.toString(2);break;case"c":h=String.fromCharCode(h);break;case"d":h=parseInt(h,10);break;case"e":h=l[7]?h.toExponential(l[7]):h.toExponential();break;case"f":h=l[7]?parseFloat(h).toFixed(l[7]):parseFloat(h);break;case"o":h=h.toString(8);break;case"s":h=(h=String(h))&&l[7]?h.substring(0,l[7]):h;break;case"u":h=Math.abs(h);break;case"x":h=h.toString(16);break;case"X":h=h.toString(16).toUpperCase()}h=/[def]/.test(l[8])&&l[3]&&h>=0?"+"+h:h,n=l[4]?l[4]=="0"?"0":l[4].charAt(1):" ",o=l[6]-String(h).length,m=l[6]?b(n,o):"",i.push(l[5]?h+m:m+h)}}return i.join("")},c.cache={},c.parse=function(a){var b=a,c=[],d=[],e=0;while(b){if((c=/^[^\x25]+/.exec(b))!==null)d.push(c[0]);else if((c=/^\x25{2}/.exec(b))!==null)d.push("%");else{if((c=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(b))===null)throw"[sprintf] huh?";if(c[2]){e|=1;var f=[],g=c[2],h=[];if((h=/^([a-z_][a-z_\d]*)/i.exec(g))===null)throw"[sprintf] huh?";f.push(h[1]);while((g=g.substring(h[0].length))!=="")if((h=/^\.([a-z_][a-z_\d]*)/i.exec(g))!==null)f.push(h[1]);else if((h=/^\[(\d+)\]/.exec(g))!==null)f.push(h[1]);else throw"[sprintf] huh?";c[2]=f}else e|=2;if(e===3)throw"[sprintf] mixing positional and named placeholders is not (yet) supported";d.push(c)}b=b.substring(c[0].length)}return d};return c}(),vsprintf=function(a,b){b.unshift(a);return sprintf.apply(null,b)}
	function rawurlencode(a){a=(a+"").toString();return encodeURIComponent(a).replace(/!/g,"%21").replace(/'/g,"%27").replace(/\(/g,"%28").replace(/\)/g,"%29").replace(/\*/g,"%2A")}

	/**
	 * Generates the proper SHA256 based key from the given method suitable for use as the key GET parameter in a JSONAPI API call.
	 *
	 * @param string method The name of the JSONAPI API method to generate the key for.
	 * @return string The SHA256 key suitable for use as the key GET parameter in a JSONAPI API call.
	 */
	this.createKey = function (method) {
		if(typeof method == "object") {
			method = JSON.stringify(method);
		}
		return SHA256(that.username + method + that.password + that.salt);
	};

	/**
	 * Generates the proper URL for a standard API call the given method and arguments.
	 *
	 * @param string method The name of the JSONAPI API method to generate the URL for.
	 * @param array args An array of arguments that are to be passed in the URL.
	 * @return string A proper standard JSONAPI API call URL. Example: "http://localhost:20059/api/call?method=methodName&args=jsonEncodedArgsArray&key=validKey".
	 */
	this.makeURL = function (method, args) {
		return sprintf(that.urlFormats["call"], that.host, that.port, rawurlencode(method), rawurlencode(JSON.stringify(args || [])), that.createKey(method));
	};

	/**
	 * Generates the proper URL for a multiple API call the given method and arguments.
	 *
	 * @param array methods An array of strings, where each string is the name of the JSONAPI API method to generate the URL for.
	 * @param array args An array of arrays, where each array contains the arguments that are to be passed in the URL.
	 * @return string A proper multiple JSONAPI API call URL. Example: "http://localhost:20059/api/call-multiple?method=[methodName,methodName2]&args=jsonEncodedArrayOfArgsArrays&key=validKey".
	 */
	this.makeURLMultiple = function (methods, args) {
		return sprintf(that.urlFormats["callMultiple"], that.host, that.port, rawurlencode(JSON.stringify(methods)), rawurlencode(JSON.stringify(args || [])), that.createKey(methods));
	};

	/**
	 * Calls the single given JSONAPI API method with the given args.
	 *
	 * @param string method The name of the JSONAPI API method to call.
	 * @param array args An array of arguments that are to be passed.
	 * @param function onComplete The function to be called when the request is complete. The only argument passed is the returned JSON.
	 * @return array An associative array representing the JSON that was returned.
	 */
	this.call = function (method, args, onComplete) {
		if(typeof args == "function") {
			onComplete = args;
			args = [];
		}

		args = args || [];
		if(typeof method == "object") {
			that.callMultiple(method, args);
		}

		for(var i = 0; i < args.length; i++) {
			var v = args[i];
			if(!isNaN(parseInt(v))) {
				args[i] = parseInt(v);
			}
		}

		var url = that.makeURL(method, args);

		that.curl(url, onComplete);

		return that;
	};

	this.curl = function (url, cb) {
		jQuery.getJSON(url, cb);
	};

	/**
	 * Calls the given JSONAPI API methods with the given args.
	 *
	 * @param array methods An array strings, where each string is the name of a JSONAPI API method to call.
	 * @param array args An array of arrays of arguments that are to be passed.
	 * @param function onComplete The function to be called when the request is complete. The only argument passed is the returned JSON.
	 * @throws Exception When the length of the methods array and the args array are different, an exception is thrown.
	 * @return array An array of associative arrays representing the JSON that was returned.
	 */
	this.callMultiple = function (methods, args, onComplete) {
		if(typeof args == "function") {
			onComplete = args;
			args = [];
		}

		args = args || [];
		if(methods.length !== args.length) {
			throw "The length of the arrays \$methods and \$args are different! You need an array of arguments for each method!";
		}

		for(var i = 0; i < args.length; i++) {
			for(var x = 0; x < args[i].length; x++) {
				var v = args[i][x];
				if(!isNaN(parseInt(v))) {
					args[i][x] = parseInt(v);
				}
			}
		}

		var url = that.makeURLMultiple(methods, args);

		that.curl(url, onComplete);

		return that;
	};
}
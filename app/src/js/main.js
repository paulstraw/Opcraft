$(document).ready(function(){
	var win = window,
		scroller,
		user,
		pass,
		salt,
		host,
		port = 20059,
		wsPort,
		jsonApi,
		localStorage = win.localStorage,
		lists = {
			players: [],
			messages: []
		},
		apiSocket,
		items = [{special:"restricted",value:0,name:"Air"},{value:1,name:"Stone"},{special:"restricted",value:2,name:"Grass"},{value:3,name:"Dirt"},{value:4,name:"Cobblestone"},{value:5,name:"Wooden Plank"},{value:6,name:"Sapling",damage:0},{value:6,name:"Spruce Sapling",damage:1},{value:6,name:"Birch Sapling",damage:2},{special:"restricted",value:7,name:"Bedrock"},{special:"restricted",value:8,name:"Water"},{special:"restricted",value:9,name:"Stationary water"},{special:"restricted",value:10,name:"Lava"},{special:"restricted",value:11,name:"Stationary lava "},{value:12,name:"Sand"},{value:13,name:"Gravel"},{value:14,name:"Gold Ore"},{value:15,name:"Iron Ore"},{special:"restricted",value:16,name:"Coal Ore"},{value:17,name:"Wood",damage:0},{value:17,name:"Spruce Wood",damage:1},{value:17,name:"Birch Wood",damage:2},{special:"restricted",value:18,name:"Leaves",damage:0},{special:"restricted",value:18,name:"Spruce Leaves",damage:1},{special:"restricted",value:18,name:"Birch Leaves",damage:2},{special:"removed",value:19,name:"Sponge"},{value:20,name:"Glass"},{special:"restricted",value:21,name:"Lapis Lazuli Ore"},{value:22,name:"Lapis Lazuli Block"},{value:23,name:"Dispenser"},{value:24,name:"Sandstone"},{value:25,name:"Note Block"},{special:"restricted",value:26,name:"Bed"},{value:27,name:"Powered Rail"},{value:28,name:"Detector Rail"},{special:"restricted",value:30,name:"Web"},{value:35,name:"White Wool",damage:0},{value:35,name:"Orange Wool",damage:1},{value:35,name:"Magenta Wool",damage:2},{value:35,name:"Light Blue Wool",damage:3},{value:35,name:"Yellow Wool",damage:4},{value:35,name:"Light Green Wool",damage:5},{value:35,name:"Pink Wool",damage:6},{value:35,name:"Gray Wool",damage:7},{value:35,name:"Light Gray Wool",damage:8},{value:35,name:"Cyan Wool",damage:9},{value:35,name:"Purple Wool",damage:10},{value:35,name:"Blue Wool",damage:11},{value:35,name:"Brown Wool",damage:12},{value:35,name:"Dark Green Wool",damage:13},{value:35,name:"Red Wool",damage:14},{value:35,name:"Black Wool",damage:15},{value:37,name:"Yellow Flower"},{value:38,name:"Red Rose"},{value:39,name:"Brown Mushroom"},{value:40,name:"Red Mushroom"},{value:41,name:"Gold Block"},{value:42,name:"Iron Block"},{special:"restricted",value:43,name:"Double Stone Slab",damage:0},{special:"restricted",value:43,name:"Double Sandstone Slab",damage:1},{special:"restricted",value:43,name:"Double Wooden Slab",damage:2},{special:"restricted",value:43,name:"Double Cobblestone Slab",damage:3},{value:44,name:"Stone Slab",damage:0},{value:44,name:"Sandstone Slab",damage:1},{value:44,name:"Wooden Slab",damage:2},{value:44,name:"Cobblestone Slab",damage:3},{value:45,name:"Brick Block"},{value:46,name:"TNT"},{value:47,name:"Bookshelf"},{value:48,name:"Moss Stone"},{value:49,name:"Obsidian"},{value:50,name:"Torch"},{special:"restricted",value:51,name:"Fire"},{special:"restricted",value:52,name:"Monster Spawner"},{value:53,name:"Wooden Stairs"},{value:54,name:"Chest"},{special:"restricted",value:55,name:"Redstone Wire"},{special:"restricted",value:56,name:"Diamond Ore"},{value:57,name:"Diamond Block"},{value:58,name:"Crafting Table"},{special:"restricted",value:59,name:"Crops "},{special:"restricted",value:60,name:"Farmland "},{value:61,name:"Furnace "},{special:"restricted",value:62,name:"Burning Furnace"},{special:"restricted",value:63,name:"Sign Post"},{special:"restricted",value:64,name:"Wooden Door"},{value:65,name:"Ladder"},{value:66,name:"Rails"},{value:67,name:"Cobblestone Stairs"},{special:"restricted",value:68,name:"Wall Sign"},{value:69,name:"Lever"},{value:70,name:"Stone Pressure Plate"},{special:"restricted",value:71,name:"Iron Door"},{value:72,name:"Wooden Pressure Plate"},{special:"restricted",value:73,name:"Redstone Ore"},{special:"restricted",value:74,name:"Glowing Redstone Ore"},{special:"restricted",value:75,name:"Redstone Torch (Off)"},{value:76,name:"Redstone Torch (On)"},{value:77,name:"Stone Button"},{special:"restricted",value:78,name:"Snow"},{special:"restricted",value:79,name:"Ice"},{value:80,name:"Snow Block"},{value:81,name:"Cactus"},{value:82,name:"Clay Block"},{special:"restricted",value:83,name:"Sugar Cane"},{value:84,name:"Jukebox"},{value:85,name:"Fence"},{value:86,name:"Pumpkin"},{value:87,name:"Netherrack"},{value:88,name:"Soul Sand"},{value:89,name:"Glowstone Block"},{special:"restricted",value:90,name:"Portal"},{value:91,name:"Jack-O-Lantern"},{special:"restricted",value:92,name:"Cake Block"},{special:"restricted",value:93,name:"Redstone Repeater (Off)"},{special:"restricted",value:94,name:"Redstone Repeater (On)"},{special:"removed",value:95,name:"Locked Chest"},{value:256,name:"Iron Shovel"},{value:257,name:"Iron Pickaxe"},{value:258,name:"Iron Axe"},{value:259,name:"Flint and Steel"},{value:260,name:"Apple"},{value:261,name:"Bow"},{value:262,name:"Arrow"},{value:263,name:"Coal",damage:0},{value:263,name:"Charcoal",damage:1},{value:264,name:"Diamond"},{value:265,name:"Iron Ingot"},{value:266,name:"Gold Ingot"},{value:267,name:"Iron Sword"},{value:268,name:"Wooden Sword"},{value:269,name:"Wooden Shovel"},{value:270,name:"Wooden Pickaxe"},{value:271,name:"Wooden Axe"},{value:272,name:"Stone Sword"},{value:273,name:"Stone Shovel"},{value:274,name:"Stone Pickaxe"},{value:275,name:"Stone Axe"},{value:276,name:"Diamond Sword"},{value:277,name:"Diamond Shovel"},{value:278,name:"Diamond Pickaxe"},{value:279,name:"Diamond Axe"},{value:280,name:"Stick"},{value:281,name:"Bowl"},{value:282,name:"Mushroom Soup"},{value:283,name:"Gold Sword"},{value:284,name:"Gold Shovel"},{value:285,name:"Gold Pickaxe"},{value:286,name:"Gold Axe"},{value:287,name:"String"},{value:288,name:"Feather"},{value:289,name:"Gunpowder"},{value:290,name:"Wooden Hoe"},{value:291,name:"Stone Hoe"},{value:292,name:"Iron Hoe"},{value:293,name:"Diamond Hoe"},{value:294,name:"Gold Hoe"},{value:295,name:"Seeds"},{value:296,name:"Wheat"},{value:297,name:"Bread"},{value:298,name:"Leather Helmet"},{value:299,name:"Leather Chestplate"},{value:300,name:"Leather Leggings"},{value:301,name:"Leather Boots"},{special:"restricted",value:302,name:"Chainmail Helmet"},{special:"restricted",value:303,name:"Chainmail Chestplate"},{special:"restricted",value:304,name:"Chainmail Leggings"},{special:"restricted",value:305,name:"Chainmail Boots"},{value:306,name:"Iron Helmet"},{value:307,name:"Iron Chestplate"},{value:308,name:"Iron Leggings"},{value:309,name:"Iron Boots"},{value:310,name:"Diamond Helmet"},{value:311,name:"Diamond Chestplate"},{value:312,name:"Diamond Leggings"},{value:313,name:"Diamond Boots"},{value:314,name:"Gold Helmet"},{value:315,name:"Gold Chestplate"},{value:316,name:"Gold Leggings"},{value:317,name:"Gold Boots"},{value:318,name:"Flint"},{value:319,name:"Raw Porkchop"},{value:320,name:"Cooked Porkchop"},{value:321,name:"Paintings"},{value:322,name:"Golden Apple"},{value:323,name:"Sign"},{value:324,name:"Wooden Door"},{value:325,name:"Bucket"},{value:326,name:"Water bucket"},{value:327,name:"Lava Bucket"},{value:328,name:"Minecart"},{value:329,name:"Saddle"},{value:330,name:"Iron Door"},{value:331,name:"Redstone"},{value:332,name:"Snowball"},{value:333,name:"Boat"},{value:334,name:"Leather"},{value:335,name:"Milk"},{value:336,name:"Clay Brick"},{value:337,name:"Clay Balls"},{value:338,name:"Sugar Cane"},{value:339,name:"Paper"},{value:340,name:"Book"},{value:341,name:"Slimeball"},{value:342,name:"Storage Minecart"},{value:343,name:"Powered Minecart"},{value:344,name:"Egg"},{value:345,name:"Compass"},{value:346,name:"Fishing Rod"},{value:347,name:"Clock"},{value:348,name:"Glowstone Dust"},{value:349,name:"Raw Fish"},{value:350,name:"Cooked Fish"},{value:351,name:"Ink Sac",damage:0},{value:351,name:"Rose Red",damage:1},{value:351,name:"Cactus Green",damage:2},{value:351,name:"Cocoa Beans",damage:3},{value:351,name:"Lapis Lazuli",damage:4},{value:351,name:"Purple Dye",damage:5},{value:351,name:"Cyan Dye",damage:6},{value:351,name:"Light Gray Dye",damage:7},{value:351,name:"Gray Dye",damage:8},{value:351,name:"Pink Dye",damage:9},{value:351,name:"Lime Dye",damage:10},{value:351,name:"Dandelion Yellow",damage:11},{value:351,name:"Light Blue Dye",damage:12},{value:351,name:"Magenta Dye",damage:13},{value:351,name:"Orange Dye",damage:14},{value:351,name:"Bone Meal",damage:15},{value:352,name:"Bone"},{value:353,name:"Sugar"},{value:354,name:"Cake"},{value:355,name:"Bed"},{value:356,name:"Redstone Repeater"},{value:357,name:"Cookie"},{value:2256,name:"Gold Music Disc",damage:1},{value:2257,name:"Green Music Disc",damage:2}];

	$(lists).bind({
		addPlayer: function(e, playerName) {
			jsonApi.call('getPlayer', [playerName], function(playerData) {
				var playerInfo = playerData.success,
					playerInList;
				if (!playerInfo) return;

				playerInList = _.detect(lists.players, function(player) {
					return player.name == playerInfo.name;
				});

				if (!playerInList) {

					lists.players.push(playerInfo);

					$(lists).trigger('renderPlayer', [playerName]);
				}
			});
		},

		removePlayer: function(e, playerName) {
			lists.players = _.reject(playerList, function(player) {
					return player.name == playerName;
				});

			$(lists).trigger('unrenderPlayer', [playerName]);
		},

		renderPlayer: function(e, playerName) {
			if (!$('#content[data-section=Players]').length) return;

			var playerTmpl = _.template($('#tmplPlayer').html()),
				playerObj = _.detect(playerList, function(player) {
						return player.name == playerName;
					});;

			$('#scroller ul').append(playerTmpl({player: playerObj}));
			scroller.refresh();

			createMinecraftHead(playerName, function(head, playerName) {
				$('#scroller ul [data-playername=' + playerName + '] .canvasHolder').append(resizeImage(head, 32));
			});
		},

		unrenderPlayer: function(e, playerName) {
			if (!$('#content[data-section=Players]').length) return;

			$('#scroller ul').find('li[data-playername=' + playerName + ']').remove();
		},

		addMessage: function(e, message) {
			lists.messages.push(message);

			$(lists).trigger('renderMessage', [message]);
		},

		renderMessage: function(e, message) {
			if (!$('#content[data-section=Chat]').length) return;

			$('<li />').html(message).prependTo('#chatHistory');
			scroller.refresh();
		}
	});

	function generateKey(method) {
		return SHA256(user + method + pass);
	}

	function resizeImage(img,size) {
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var ctx = canvas.getContext('2d');
		blitImage(ctx, img, 0,0,img.width,img.height, 0,0,size,size);
		return canvas;
	}

	function blitImage(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh) {
		var x, y;
		for (x=0;x<dw;x++) {
			for (y=0;y<dh;y++) {
				ctx.drawImage(image,Math.floor(sx+x*(sw/dw)),Math.floor(sy+y*(sw/dw)),1,1,dx+x,dy+y,1,1);
			}
		}
	}

	function createMinecraftHead(player,completed,failed) {
		var skinImage = new Image();
		skinImage.onload = function() {
			var headCanvas = document.createElement('canvas');
			headCanvas.width = 8;
			headCanvas.height = 8;
			var headContext = headCanvas.getContext('2d');
			blitImage(headContext, skinImage, 8,8,8,8, 0,0,8,8);
			blitImage(headContext, skinImage, 40,8,8,8, 0,0,8,8);
			completed(headCanvas, player);
		};
		skinImage.onerror = function() {
			skinImage.src == '//www.minecraft.net/img/char.png' ?
				failed() :
				skinImage.src = '//www.minecraft.net/img/char.png';
		};
		skinImage.src = '//s3.amazonaws.com/MinecraftSkins/' + player + '.png';
	}

	function showPrompt(html, submitFunction) {
		$.fancybox(html, {
			modal: true
		});

		function close() {
			$('form').unbind('submit');
			$.fancybox.close();

			return false;
		}

		$('#closeButton').one('click', close)

		$('form').bind('submit', function(e) {
			e.preventDefault();
			var done = submitFunction(e);

			if (done) close();
		});
	}

	function showDialog(text, autoClose) {
		if (autoClose) {
			setTimeout(function() {
				$.fancybox.close();
			}, 900);
		} else {
			text = '<strong>Error:</strong><br>' + text + '<button id="closeDialog">ok</button>';
		}

		text = $('<div />').addClass('fancy').html(text)[0].outerHTML;

		$.fancybox(text, {
			modal: true
		});

		if (!autoClose) {
			$('#closeDialog').one('click', function() {
				$.fancybox.close();
			});
		}
	}

	function loadSection(title) {
		var tmpl = _.template($('#tmpl' + title).html());

		//set titles and such:
		$('h1').text(title);
		$('footer .' + title).addClass('active').siblings().removeClass('active');

		//get rid of current scroller, if it exists:
		if (scroller) {
			scroller.destroy();
			scroller = null;
		}

		//undelegate all click events from list items:
		//TODO MESSY
		$('#content').undelegate('li', 'click');

		function updateContent(newHtml, scrollable) {
			$('#content').attr('data-section', title).html(newHtml);

			if (scrollable) {
				scroller = new iScroll('scroller', {
						hScrollbar: false,
						vScrollbar: false
					});
				scroller.refresh();
			}
		}

		switch (title) {
			case 'Give':
				updateContent(tmpl({items: items}), true);

				var list = $('#scroller li'),
					scrollerDiv = $('#scroller');

				scrollerDiv.height(scrollerDiv.parent().height() - $('.filter').outerHeight());

				function filter() {
					var filter = $(this).val(),
						count = 0;

					list.each(function(i, el) {
						$(el).text().search(new RegExp(filter, 'i')) < 0 ?
							$(el).hide() :
							$(el).show();
					});

					scroller.refresh();
				}

				$('input[type=search]').bind({
					keyup: filter,
					click: filter
				});

				$('#content').delegate('li', 'click', function() {
					var tmpl = _.template($('#tmplGivePrompt').html()),
						dv = parseInt($(this).attr('data-value')),
						dd = parseInt($(this).attr('data-damage')),
						itemName = $(this).text(),
						player,
						amount;

					showPrompt(tmpl({itemName: itemName, players: playerList}), function(e) {
						player = $('#giveToWho').val();
						amount = $('#howMany').val();
						console.log(e);

						jsonApi.call('givePlayerItemWithData', [player, dv, amount, dd], function(data) {
							if (data.error) {
								showDialog('There was a problem giving that item to the specified player.');
							} else {
								$('#repeatGive').attr('data-opts', [player, dv, amount, dd].join('|'));
								showDialog('success!', true);

								return true;
							}
						});
					});
				});
				break;
			case 'Players':
				updateContent(tmpl(), true);

				for (player in lists.players) {
					$(lists).trigger('renderPlayer', [lists.players[player].name]);
				}
				break;
			case 'Chat':
				updateContent(tmpl(), true);

				var scrollerDiv = $('#scroller');

				scrollerDiv.height(scrollerDiv.parent().height() - $('#chatBox').outerHeight());

				$('#chatBox input').bind('keydown', function(e) {
					if (e.which != 13) return;

					var t = $(this),
						msg = t.val();

					function clearInput() {
						t.val('');
					}

					msg.charAt(0) == '/' ?
						jsonApi.call('runConsoleCommand', [msg.substring(1)], clearInput) :
						jsonApi.call('broadcastWithName', [msg, user], clearInput);
				});

				for (msg in lists.messages) {
					$(lists).trigger('renderMessage', [lists.messages[msg]]);
				}
				break;
			case 'Server':
				jsonApi.call('getServerVersion', [], function(versionNumber) {
					versionNumber = versionNumber.success;
					updateContent(tmpl({version: versionNumber}));
				});
				break;
		}
	}

	function login() {
		var savedHost = localStorage.mcApiHost,
			savedUser = localStorage.mcApiUser,
			savedPass = localStorage.mcApiPass,
			savedSalt = localStorage.mcApiSalt,
			savedPort = localStorage.mcApiPort;

		//TODO validate user/pass and give option to enter credentials again if 403

		if (savedUser && savedPass && savedHost) {
			host = savedHost;
			user = savedUser;
			pass = savedPass;
			salt = savedSalt;
			port = savedPort;
			wsPort = parseInt(port, 10) + 2;

			init();
		} else {
			showPrompt($('#tmplLoginForm').html(), function() {
				var newHost = $('#host').val(),
					newUser = $('#user').val(),
					newPass = $('#pass').val(),
					newSalt = $('#salt').val(),
					newPort = parseInt($('#port').val(), 10) || 20059;

				if (!newHost || !newUser || !newPass) {
					return false;
				}

				host = localStorage.mcApiHost = newHost;
				user = localStorage.mcApiUser = newUser;
				pass = localStorage.mcApiPass = newPass;
				salt = localStorage.mcApiSalt = newSalt;
				port = localStorage.mcApiPort = newPort;
				wsPort = parseInt(port, 10) + 2;

				init();

				return true;
			});
		}
	}

	function init() {
		jsonApi = new JSONAPI({
			host: host,
			username: user,
			password: pass,
			port: port,
			salt: salt || ''
		});

		//init playerList:
		jsonApi.call('getPlayers', [], function(playerData) {
			var players = playerData.success;

			playerList = players ?
				players :
				[];
		});

		//apiSocket setup:
		apiSocket = new WebSocket('ws://' + host + ':' + wsPort);

		$(apiSocket).bind({
			open: function() {
				apiSocket.send('/api/subscribe?source=all&key=' + generateKey('all'));
			},

			message: function(e) {
				var data = JSON.parse(e.originalEvent.data),
					message;

				if (data.result != 'success') {
					showDialog('There was a WebSocket issue. Try reloading and see if it works.');
					return;
				}

				result = data.success;

				switch (data.source) {
					case 'connections':
						if (result.action == 'disconnected') {
							//remove player from playerList:
							$(lists).trigger('removePlayer', [result.player]);
						} else if (result.action == 'connected') {
							//add player to playerList:
							$(lists).trigger('addPlayer', [result.player]);
						}
						break;
					case 'chat':
						message = '&lt;' + result.player + '&gt ' + result.message;

						$(lists).trigger('addMessage', [message]);
						break;
					case 'console':
						if (~result.line.search(/<\w+>/g)) return; //if this is a chat log, don't worry about it

						message = result.line;

						$(lists).trigger('addMessage', [message]);
						break;
				}
			}
		});

		window.onbeforeunload = function() {
			apiSocket.close();
		};

		$('#content').delegate('button', 'click', function(e) {
			var $t = $(this),
				opts = $t.attr('data-opts'),
				method = $t.attr('data-method'),
				command = $t.attr('data-command'),
				args = [];

			if (opts) opts = opts.split('|');

			switch (method) {
				case 'runConsoleCommand':
					if (!command) return;

					switch (command) {
						case 'setTime':
							args.push('time set ' + $('#newTime').val());
							break;
					}
					break;
				case 'reloadServer':
					var confirmed = confirm('Are you sure you want to reload the server?');
					if (!confirmed) return;
					break;
				case 'opPlayer':
				case 'deopPlayer':
					args.push(opts[0]);
					break;
				case 'kickPlayer':
					args.push(opts[0], '');
					break;
				case 'teleport':
					var to = prompt('Who do you want to teleport this player to?');
					if (!to) return;

					args.push(opts[0], to);
					break;
				case 'givePlayerItemWithData':
					if (!opts) {
						alert('No give to repeat.');
						return;
					}

					args = opts;
					break;
				case 'clearCredentials':
					var credentials = [
							'mcApiUser',
							'mcApiPass',
							'mcApiSalt',
							'mcApiHost',
							'mcApiPort'
						];

					for (var i = credentials.length - 1; i >= 0; i--) {
						delete localStorage[credentials[i]];
					};

					login();
					return;
			}

			jsonApi.call(method, args, function(data) {
				data.error ?
					showDialog(data.error) :
					showDialog('success!', true);
			});
		});

		loadSection('Server');
	}

	//kickoff:
	(function() {
		if (typeof localStorage == 'undefined') {
			document.write('Your browser doesn\'t support localStorage (which is required by Crafty). You should upgrade to something like <a href="http://google.com/chrome">Google Chrome</a>');
			return;
		} else if (!window.WebSocket) {
			document.write('Your browser doesn\'t support webSockets (which are required by Crafty). You should upgrade to something like <a href="http://google.com/chrome">Google Chrome</a>');
			return;
		}

		$('footer').delegate('li', 'click', function() {
			loadSection($(this).text());
		});

		function resizeContent() {
			$('#content').css({
				height: $(window).height() - 89
			});

			if (scroller) scroller.refresh();
		}
		resizeContent();

		$(window).bind({
			resize: resizeContent,
			//TODO this because of a bug in JSONAPI and i'll remove it once that gets updated:
			beforeunload: function(e) {
				socket.close();
			}
		});

		$(document).bind('touchmove', function(e) {
			e.preventDefault();
		});

		login();
	})();
});
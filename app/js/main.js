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
		playerList,
		messageList = [],
		apiSocket;

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
			if (skinImage.src == '//www.minecraft.net/img/char.png') {
				failed();
			} else {
				skinImage.src = '//www.minecraft.net/img/char.png';
			}
		};
		skinImage.src = '//s3.amazonaws.com/MinecraftSkins/' + player + '.png';
	}

	function showPrompt(html, submitFunction) {
		$.fancybox(html, {
			modal: true
		});

		function close() {
			$('form').unbind('submit');
			$('#closeButton').unbind('click');
			$.fancybox.close();

			return false;
		}

		$('#closeButton').bind('click', close)

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
			text = '<strong>Error:</strong><br>' + text + '<button id="close">ok</button>';
		}

		text = $('<div />').addClass('fancy').html(text)[0].outerHTML;

		$.fancybox(text, {
			modal: true
		});

		if (!autoClose) {
			$('#close').bind('click', function() {
				$('#close').unbind('click');
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
		$('#content').undelegate('li', 'click').unbind('addPlayer removePlayer addMessage');

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
				$.ajax({
					url: 'js/items.json',
					dataType: 'json',
					success: function(itemData) {
						updateContent(tmpl({items: itemData}), true);

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
					}
				});
				break;
			case 'Players':
				function addPlayer(playerName) {
					var playerTmpl = _.template($('#tmplPlayer').html()),
						playerObj = _.detect(playerList, function(player) {
								return player.name == playerName;
							});;

					$('#scroller ul').append(playerTmpl({player: playerObj}));
					scroller.refresh();

					createMinecraftHead(playerName, function(head, playerName) {
						$('#scroller ul [data-playername=' + playerName + '] .canvasHolder').append(resizeImage(head, 32));
					});
				}

				function removePlayer(playerName) {
					$('#scroller ul').find('li[data-playername=' + playerName + ']').remove();
				}

				updateContent(tmpl(), true);

				//TODO MESSY
				$('#content').bind({
					addPlayer: function(e, playerName) {
						addPlayer(playerName);
					},
					removePlayer: function(e, playerName) {
						removePlayer(playerName);
					},
				});

				for (player in playerList) {
					var playerName = playerList[player].name;
					addPlayer(playerName);
				}
				break;
			case 'Chat':
				updateContent(tmpl(), true);

				var scrollerDiv = $('#scroller');

				scrollerDiv.height(scrollerDiv.parent().height() - $('#chatBox').outerHeight());

				function addMessage(message) {
					$('<li />').html(message).prependTo('#chatHistory');
					scroller.refresh();
				}

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

				$('#content').bind({
					addMessage: function(e, message) {
						addMessage(message);
					}
				});

				for (message in messageList) {
					addMessage(messageList[message]);
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
			wsPort = parseInt(port) + 2;

			init();
		} else {
			showPrompt($('#tmplLoginForm').html(), function() {
				var newHost = $('#host').val(),
					newUser = $('#user').val(),
					newPass = $('#pass').val(),
					newSalt = $('#salt').val(),
					newPort = parseInt($('#port').val()) || 20059;

				if (!newHost || !newUser || !newPass) {
					return false;
				}

				host = localStorage.mcApiHost = newHost;
				user = localStorage.mcApiUser = newUser;
				pass = localStorage.mcApiPass = newPass;
				salt = localStorage.mcApiSalt = newSalt;
				port = localStorage.mcApiPort = newPort;
				wsPort = parseInt(port) + 2;

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
				apiSocket.send('/api/subscribe?source=console&key=' + generateKey('console'));
				apiSocket.send('/api/subscribe?source=chat&key=' + generateKey('chat'));
				apiSocket.send('/api/subscribe?source=connections&key=' + generateKey('connections'));
			},
			message: function(e) {
				var data = JSON.parse(e.originalEvent.data),
					message;

				if (data.result != 'success') {
					showDialog('WS problem blahhhhh');
					return;
				}

				result = data.success;

				switch (data.source) {
					case 'connections':
						if (result.action == 'disconnected') {
							//remove player from playerList:
							playerList = _.reject(playerList, function(player) {
								return player.name == result.player;
							});

							//TODO MESSY
							if ($('#content[data-section=Players]').length) $('#content').trigger('removePlayer', [result.player]);
						} else if (result.action == 'connected') {
							//add player to playerList:
							jsonApi.call('getPlayer', [result.player], function(playerData) {
								var playerData = playerData.success,
									playerInList;
								if (!playerData) return;

								playerInList = _.detect(playerList, function(player) {
									return player.name == playerData.name;
								});

								if (!playerInList) {
									playerList.push(playerData);

									//TODO MESSY
									if ($('#content[data-section=Players]').length) $('#content').trigger('addPlayer', [result.player]);
								}
							});
						}
						break;
					case 'chat':
						var message = '&lt;' + result.player + '&gt ' + result.message;

						messageList.push(message);

						if ($('#content[data-section=Chat]').length) $('#content').trigger('addMessage', [message]);
						break;
					case 'console':
						if (~result.line.search(/\<\w+\>/g)) return; //if this is a chat log, don't worry about it

						var message = result.line;

						messageList.push(message);

						if ($('#content[data-section=Chat]').length) $('#content').trigger('addMessage', [message]);
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
					break;
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

			if (scroller) a
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
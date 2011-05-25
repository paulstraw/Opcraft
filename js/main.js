$(document).ready(function(){
	var apiUrl = 'http://livingroommini.local:20059/api/call?',
		scroller,
		user,
		pass,
		socket = new WebSocket('ws://livingroommini.local:20061');

		socket.onopen = function() {
			socket.send('/api/subscribe?source=all&key=' + generateKey('all'));
		};

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
			completed(headCanvas);
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

	function generateKey(method) {
		return SHA256(user + method + pass);
	}

	function generateArgs(args) {
		return escape(JSON.stringify(args));
	}

	function generateUrl(method, args) {
		args = args || '%5B%5D'
		return apiUrl + 'method=' + method + '&args=' + args + '&key=' + generateKey(method);
	}

	function loadSection(title) {
		var tmpl = _.template($('#' + title).html());

		//set titles and such:
		$('h1').text(title);
		$('footer .' + title).addClass('active').siblings().removeClass('active');

		//get rid of current scroller, if it exists:
		if (scroller) {
			scroller.destroy();
			scroller = null;
		}

		//undelegate all click events from list items:
		$('#content').undelegate('li', 'click');

		function updateContent(newHtml, scrollable) {
			$('#content').attr('data-section', title).html(newHtml);

			if (scrollable) {
				scroller = new iScroll('scroller');
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

						var list = $('#content li:not(:first-child)');

						$('input[type=search]').keyup(function() {
							var filter = $(this).val(),
								count = 0;

							list.each(function(i, el) {
								$(el).text().search(new RegExp(filter, 'i')) < 0 ?
									$(el).hide() :
									$(el).show();
							});

							scroller.refresh();
						});

						$('#content').delegate('li', 'click', function() {
							if ($(this).is(':first-child')) return;

							var dv = parseInt($(this).attr('data-value')),
								dd = parseInt($(this).attr('data-damage')),
								player,
								amount;

							player = prompt('Which player do you want to give this to?');
							if (!player) return;

							amount = parseInt(prompt('How many do you want to give?'));
							if (!amount) return;

							$.ajax({
								url: generateUrl('givePlayerItemWithData', generateArgs([player, dv, amount, dd])),
								dataType: 'jsonp',
								success: function(data) {
									if (data.error) {
										alert('There was a problem giving that item to the specified player.');
									} else {
										$('#repeatGive').attr('data-opts', ['repeatGive', player, dv, amount, dd].join('|'));
										alert('Successfully given!');
									}
								}
							});
						});
					}
				});
				break;
			case 'Players':
				$.ajax({
					url: generateUrl('getPlayers'),
					dataType: 'jsonp',
					success: function(playerData) {
						var players = playerData.success;

						for (player in players) {
							createMinecraftHead(players[player].name, function(head) {
								$('.player[data-playername=' + players[player].name + '] .canvasHolder').append(resizeImage(head, 32));
							});
						}

						updateContent(tmpl({players: players}), true);
					}
				});
				break;
			case 'Chat':
				if (!window.WebSocket) {
					alert('Your browser doesn\'t support WebSockets, you should upgrade to something like Chrome');
					break;
				}

				updateContent(tmpl());

				socket.onmessage = function(e) {
					var data = JSON.parse(e.data),
						msg = data.success;

					if (msg) {
						console.log(msg);
						if (msg.player) {
							$('<li />').html('&lt;' + msg.player + '&gt ' + msg.message).appendTo('#chatHistory');
						} else if (msg.line && msg.line.search(/<.+>/) == -1) {
							$('<li />').html(msg.line).appendTo('#chatHistory');
						}
					}
				};
				break;
			case 'Server':
				$.ajax({
					url: generateUrl('getServerVersion'),
					dataType: 'jsonp',
					success: function(versionNumber) {
						versionNumber = versionNumber.success;
						updateContent(tmpl({version: versionNumber}));
					}
				});
				break;
		}
	}

	//initialization
	(function() {
		//a little messy, but it's short:
		user = localStorage.mcApiUser = localStorage.mcApiUser || prompt('Enter your API username and click ok:');
		pass = localStorage.mcApiPass = localStorage.mcApiPass || prompt('Enter your API password and click ok:');

		loadSection('Chat');

		$('#content').delegate('button', 'click', function(e) {
			var opts = $(this).attr('data-opts'),
				method = $(this).attr('data-method'),
				args = [];

			if (opts) {
				opts = opts.split('|');

				switch (opts[0]) {
					case 'setTime':
						args = [
							'time set ' + $('#newTime').val()
						];
						break;
					case 'restartServer':
						var confirmed = confirm('Are you sure you want to stop the server?');
						if (!confirmed) return;

						args = [
							'stop'
						];
						break;
					case 'op':
					case 'deop':
						args = [
							opts[1]
						];
						break;
					case 'kick':
						args = [
							opts[1],
							''
						];
						break;
					case 'teleport':
						var to = prompt('Who do you want to teleport this player to?');

						if (!to) return;

						args = [
							opts[1],
							to
						];
						break;
					case 'repeatGive':
						if (!opts[4]) {
							alert('No give to repeat.');
							return;
						}

						args = [
							opts[1],
							opts[2],
							opts[3],
							opts[4]
						];
						break;
				}
			}

			args = generateArgs(args);

			$.ajax({
				url: generateUrl(method, args),
				dataType: 'jsonp',
				success: function(data) {
					if (data.error) {
						alert('Uh oh, there was an error:\n\n' + data.error);
					} else {
						alert('Success!');
					}
				}
			});
		});

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
			beforeunload: function(e) {
				socket.close();
				alert(socket.readyState);
			}
		});

		$(document).bind('touchmove', function(e) {
			e.preventDefault();
		});
	})();
});
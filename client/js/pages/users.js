import '../../less/users.less';
import '../../node_modules/jquery-contextmenu/dist/jquery.contextMenu.css';

import 'jquery-contextmenu';
import idleJs from 'idle-js';
import default_emus from '../app/default_emus';

export default function ($target) {
	var displayed_users_once = false; // for mobile

	get_page('users', function (page) {
		$target.replaceWith(page.$container);

		var update_user_list_style = function () {
			page.$("#users_list .user").each(function () {
				var $user = $(this);

				var user_colors = {
					bg_color: 'white',
					fg_color: 'black',
					font_family: 'Verdana',
					font_size: '1.25em'
				};

				var user = $user.prop('user');
				var extend_from = app.world.user_settings[user.username] && app.world.user_settings[user.username].outfit && app.world.user_settings[user.username].outfit.user;

				$.extend(user_colors, extend_from);
				$user.css({
					background: user_colors.bg_color,
					color: user_colors.fg_color,
					fontFamily: user_colors.font_family,
					fontSize: user_colors.font_size + 'px'
				})
			});
		};

		page.listen('user_settings', function (data) {
			if (data.user_settings[app.profile.username] && data.user_settings[app.profile.username].outfit && data.user_settings[app.profile.username].outfit.holy_cow) {
				app.holy_cow = data.user_settings[app.profile.username].outfit.holy_cow;
			} else {
				app.holy_cow = default_emus;
			}

			app.world.user_settings = data.user_settings;
			update_user_list_style();
		});

		page.user_list_data = null;
		app.render_users_list = function (data) {
			if (data != null) {
				page.user_list_data = data;
			} else if (page.user_list_data == null) {
				return;
			} else {
				data = page.user_list_data;
			}

			var $users = page.$("#users_list").empty();
			var users = data.users_and_rooms.users;

			users.sort(function (a, b) {
				var rank_a = a.rocket_league_rank || 0;
				var rank_b = b.rocket_league_rank || 0;

				return rank_b - rank_a;
			});

			var rooms = data.users_and_rooms.rooms;

			users.filter(function (user) {
				var room_id = app.get_active_room(true);

				var in_room = rooms[room_id] && rooms[room_id].users.some(function (room_user) {
					return room_user.username == user.username;
				});


				return in_room;
			}).map(function (user) {
				var nice_username = user.username.toLowerCase();
				// var display_name = user.username;
				var display_name = user.username;
				var $user = $('<div class="user"><span class="username">' + display_name + '</span></div>');

				if (user.idle == true) {
					var duration = (user.idle_duration + (5000 * 60)) / 1000;
					var unit = "s";

					if (duration >= 60) {
						duration /= 60;
						unit = "m";
					}

					if (duration >= 60) {
						duration /= 60;
						unit = "h";
					}

					duration = duration.toFixed(0);

					var $away = $('<div class="away">' + "Idle: " + duration + unit + "</div>");
					$user.append($away);
				}

				var ping = '';
				if (user.ping != null) {
					ping = user.ping + ' ms';
				}

				var $ping = $('<div class="ping">' + ping + '</div>');
				$user.append($ping);

				$user.prop('user', user);
				$user.attr('title', user.username);

				var $status = $('<div class="status">' + (user.status || 'Ni!') + '</div>');
				$user.append($status);

				if (user.idle) {
					$user.addClass('idle');
				}

				var $star = $('<div class="woah_star rl_rank"><div/></div>');

				if (user.rocket_league_rank != null) {
					$star.find('div').addClass('rank_' + user.rocket_league_rank)
				} else {
					$star.find('div').addClass('radish')
				}

				$user.prepend($star);

				if (user.warning_level > 0) {
					var $warn_bar = $("<progress title='Warning Level: " + user.warning_level + "%' class='warn_bar' max='100'/>");
					$warn_bar.attr('value', user.warning_level);
					$user.append($warn_bar);
				}

				$users.append($user);
			});

			update_user_list_style();
			page.$("#users_list").append($users);

			$users.contextMenu({
				selector: '.user',
				zIndex: 2001,
				build: function ($trigger, e) {
					var username = $trigger.find('.username').text();
					var user = $trigger.prop('user');

					return {
						callback: function (key, options) {
							switch (key) {
								case 'set_status':
									page.prompt("Set Status", "What are you humans even doing?", "", function (status) {
										if (status) {
											status = status.trim();

											// Maybe do that.
											if (status.length > 0) {
												page.send('set_status', {
													status: status
												});
											}
										}
									});
									break;
								case 'warn':
									page.send('warn', {
										username: username
									});
									break;

								case 'super_warn':
									page.send('warn', {
										username: username,
										super_warn: true
									});
									break;

								case 'view_rl_page':
									window.open('https://rocketleague.tracker.network/profile/steam/' + user.steam_id, '_blank');
									break;

								case 'boom_boom':
									page.prompt("New Room", "With name", "cowsmoke", function (room_name) {
										if (room_name) {
											room_name = room_name.trim();
											var invite_user;

											if (user.username != app.profile.username) {
												invite_user = user.username;
											}

											// Maybe do that.
											if (room_name.length > 0) {
												page.send('create_room', {
													name: room_name,
													invite: invite_user
												}, {
													page_name: 'chatterbox'
												});
											}
										}
									});
									break;

								case 'sorry_jimmy':
									page.prompt("Game Name", "Game Name", "cowsmoke", function (val) {
										if (val && val.trim().length > 0) {

											var invite_user = null;
											if (username != app.profile.username) {
												invite_user = username;
											}

											var usernames = [];
											if (page.user_list_data) {
												// usernames = page.user_list_data.users_and_rooms.users.filter(u => u.username != app.profile.username).map(u => u.username);
												usernames = []; // TODO
											}
											var instance_id = app.toolio.generate_id();
											var popup = window.open('index.html?wup=yownet', '_blank', 'width=1300,height=830,left=200,top=100');
											popup.woboy = {
												game_name: val,
												invite_user: invite_user,
												instance_id: instance_id,
												usernames: usernames
											};

											page.ws.register_popup({
												page_key: 'yownet',
												room_id: null,
												instance_id: instance_id,
												popup: popup
											});
										}
									});

									break;

								default:
									break;
							}

						},
						items: {
							set_status: {
								name: "Set Status...",
								icon: "fa-bathtub"
							},
							warn: {
								name: "Warn " + username,
								icon: "fa-exclamation-triangle"
							},
							super_warn: {
								name: "REALLY warn " + username,
								icon: "fa-bomb"
							},
							view_rl_page: {
								name: 'View Rocket League Tracker',
								icon: 'fa-rocket',
								disabled: function () {
									return user.steam_id == null;
								}
							},
							boom_boom: {
								name: "Boom boom " + username,
								icon: "fa-user-plus"
							},
							sorry_jimmy: {
								name: "Sorry, Jimmy",
								icon: "fa-beer"
							}
						}
					};
				}
			});

			if (app.is_mobile && !displayed_users_once) {
				displayed_users_once = true;
				var woboy_users = data.users_and_rooms.users.map(function (user) {
					return user.username;
				}).join(', ');

				app.append_system("Users logged in: " + woboy_users, {
					color: 'green'
				});
			}
		};

		page.listen('users_list', function (data) {
			app.render_users_list(data);
		});

		app.idleTracker = new idleJs({
			idle: 60 * 1000 * 5, // idle time in ms 
			events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter 
			onIdle: function () {
				page.send('idle', {
					idle: true
				});
			}, // callback function to be executed after idle time 
			onActive: function () {
				page.send('idle', {
					idle: false
				});
			}, // callback function to be executed after back form idleness 

			keepTracking: true, // set it to false of you want to track only once 
			startAtIdle: true // set it to true if you want to start in the idle state 
		});

		app.idleTracker.start();

		app.event_bus.on('users_pane_loaded', function () {
			if (localStorage.fast_crab) {
				var usernames = [];
				if (page.user_list_data) {
					// usernames = page.user_list_data.users_and_rooms.users.filter(u => u.username != app.profile.username).map(u => u.username);
					usernames = []; // TODO
				}
				var instance_id = app.toolio.generate_id();
				var popup = window.open('index.html?wup=yownet', '_blank', 'width=1300,height=830,left=200,top=100');
				popup.woboy = {
					game_name: "Fast Crab",
					instance_id: instance_id,
					usernames: usernames
				};

				page.ws.register_popup({
					page_key: 'yownet',
					room_id: null,
					instance_id: instance_id,
					popup: popup
				});
			}
		});

		// I'm sure this is fine!
		var wait_for_app = setInterval(function () {
			if (app.ready) {
				page.send('sync', {
					room_id: app.get_active_room(true),
					mobile: app.is_mobile
				});
				clearInterval(wait_for_app);
				app.event_bus.emit('users_pane_loaded', {});
			}
		}, 50);

		page.$("#leave_room").button().on('click.leave_room', function () {
			page.send('leave_room', {
				room_id: app.get_active_room(true)
			})
		});

		page.$("#invite").button().on('click.invite', function () {
			var $users = $('<table><tbody></tbody></table>');
			var $user = $('<tr><td id="username"></td><td><button>Invite?</button></td></tr>');

			$users.on('click', 'button', function () {
				var username = $(this).prop('username');
				$(this).button('disable');

				page.send('invite_to_room', {
					username: username,
					room_id: app.get_active_room(true)
				}, {
					page_name: 'chatterbox'
				});
			});

			if (page.user_list_data) {
				page.user_list_data.users_and_rooms.users.map(function (entry) {
					return entry.username;
				}).filter(function (username) {
					return app.profile.username != username;
				}).forEach(function (username) {
					$user.find('#username').text(username);
					$user.find('button').prop('username', username);
					$users.find('tbody').append($user);
					$user = $user.clone();
				});
			}

			$users.find('button').button();

			$users.dialog({
				title: 'Invite Users!',
				modal: true,
				buttons: {
					'Close': function () {
						$(this).dialog('close');
					}
				}
			})
		});

	});

	return {};
};
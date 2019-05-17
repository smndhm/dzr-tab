/**
 * Tab
 */

var Tab = {

	$: {
		logo: document.querySelector('#logo'),
		track: document.querySelector('#track')
	},

	browser: Utils.browser(),

	init: function () {

		Tab.$.logo.href = Tab.__link(Tab.$.logo.href);

		Tab.browser.storage.sync.get(['api_call', 'last_call', 'uuid'], function (storage) {

			var storage_api_call = storage.api_call || 0;
			var storage_last_call = storage.last_call || null;
			var storage_uuid = storage.uuid || null;
			var date = new Date();
			var timestamp = date.getTime();
			var refresh_data = !storage_last_call || !localStorage.dzData || (timestamp - storage_last_call) > Conf.store.time;

			Utils.analytics('settings', 'api_call', Conf.calls[storage_api_call].title);
			Utils.analytics('refresh_data', refresh_data ? 'true' : 'false');

			if (!storage_uuid) {

				var UUID = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();

				Tab.browser.storage.sync.set({
					uuid: UUID
				}, function () {
					localStorage.uuid = UUID;
				});

			}

			if (refresh_data) {

				Utils.getJson(Conf.urls.api + Conf.calls[storage_api_call].url + '?limit=' + Conf.limit, function (response) {

					if (response.data && response.data.length) {

						var data_type = response.data[0].type;

						if (data_type == 'playlist' || data_type == 'album') {

							response.data = response.data.slice(0, 5);

							Utils.getJson(Conf.urls.api + 'playlist/' + Utils.random(response.data).id + '/tracks?limit=' + Conf.limit, function (response) {
								if (response.data && response.data.length) {
									Tab.storeTracks(response.data, timestamp);
								} else {
									Tab.setTrack();
								}
							});

						} else if (data_type == 'track') {
							Tab.storeTracks(response.data, timestamp);
						}

					} else {
						Tab.setTrack();
					}

				});

			} else {
				Tab.setTrack();
			}

		});

	},

	storeTracks: function (data, timestamp) {

		Tab.browser.storage.sync.set({
			last_call: parseInt(timestamp)
		}, function () {
			localStorage.dzData = JSON.stringify(data);
			Tab.setTrack();

		});

	},

	setTrack: function () {

		var dzData = JSON.parse(localStorage.dzData);
		var dzMedia = Utils.random(dzData);

		Utils.analytics('media', dzMedia.type, dzMedia.id + '');

		//background url
		var backgroundUrl = dzMedia.album.cover_big || 'https://api.deezer.com/album/' + dzMedia.album.id + '/image?size=500'

		//background color
		var imgCanvas = new Image();
		imgCanvas.crossOrigin = 'Anonymous';
		imgCanvas.onload = function () {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(imgCanvas, 0, 0, 1, 1);
			var pixel = ctx.getImageData(0, 0, 1, 1);
			var data = pixel.data;
			var rgba = 'rgba(' + data[0] + ', ' + data[1] +	', ' + data[2] + ', ' + (data[3] / 255) + ')';
			document.body.style.background = rgba;
		};
		imgCanvas.src = backgroundUrl;



		//cover
		var coverA = Tab.$.track.querySelector('.track-cover a');
		coverA.href = Tab.__link(dzMedia.link);
		coverA.querySelector('img').src = backgroundUrl;

		//h2
		var h2A = Tab.$.track.querySelector('.track-title a');
		h2A.href = Tab.__link(dzMedia.link);
		h2A.appendChild(document.createTextNode(dzMedia.title));

		//h3
		var h3A = Tab.$.track.querySelector('.track-artist a');
		h3A.href = Tab.__link(dzMedia.artist.link);
		h3A.appendChild(document.createTextNode(dzMedia.artist.name));

	},

	__link: function (link) {
		return link + (Conf && Conf.app_id != null ? '?app_id=' + Conf.app_id : '');
	}

};
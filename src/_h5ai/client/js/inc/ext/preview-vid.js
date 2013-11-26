
modulejs.define('ext/preview-vid', ['_', '$', 'core/settings', 'core/event', 'ext/preview'], function (_, $, allsettings, event, preview) {

	var settings = _.extend({
			enabled: false,
			types: []
		}, allsettings['preview-vid']),

		onEnter = function (items, idx) {

			var currentItems = items,
				currentIdx = idx,
				currentItem = items[idx],

				onAdjustSize = function () {

					var $content = $('#pv-content'),
						$vid = $('#pv-vid-video');

					if ($vid.length) {

						$vid.css({
							'left': '' + (($content.width()-$vid.width())*0.5) + 'px',
							'top': '' + (($content.height()-$vid.height())*0.5) + 'px'
						});
						
						var labels = [ currentItem.label ];
						
						if ($vid[0].videoWidth && $vid[0].videoHeight) {
							labels.push('' + $vid[0].videoWidth + 'x' + $vid[0].videoHeight);
							labels.push('' + (100 * $vid.width() / $vid[0].videoWidth).toFixed(0) + '%');
						}
						
						preview.setLabels(labels);
					}
				},

				onIdxChange = function (rel) {

					currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
					currentItem = currentItems[currentIdx];

					var $video = $("<video />")
						.attr("src", currentItem.absHref)
						.attr("controls", true)
						.attr("autoplay", true)
						.on("resize loadedmetadata", onAdjustSize);

					$('#pv-content').fadeOut(100, function () {
						$('#pv-content').empty().append($video.attr('id', 'pv-vid-video')).fadeIn(200);
						
						// small timeout, so $video is visible and therefore $video.width is available
						setTimeout(function () {
							onAdjustSize();

							preview.setIndex(currentIdx + 1, currentItems.length);
							preview.setRawLink(currentItem.absHref);
						}, 10);
					});
				};

			onIdxChange(0);
			preview.setOnIndexChange(onIdxChange);
			preview.setOnAdjustSize(onAdjustSize);
			preview.enter();
		},

		initItem = function (item) {

			if (item.$view && _.indexOf(settings.types, item.type) >= 0) {
				item.$view.find('a').on('click', function (event) {

					event.preventDefault();

					var matchedEntries = _.compact(_.map($('#items .item'), function (item) {

						item = $(item).data('item');
						return _.indexOf(settings.types, item.type) >= 0 ? item : null;
					}));

					onEnter(matchedEntries, _.indexOf(matchedEntries, item));
				});
			}
		},

		onLocationChanged = function (item) {

			_.each(item.content, initItem);
		},

		onLocationRefreshed = function (item, added, removed) {

			_.each(added, initItem);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);
		};

	init();
});

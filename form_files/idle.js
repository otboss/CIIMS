///////////////////////////////////////////////////////////////////////////
// Implements the timeout feature of the portal using HTML localStorage  //
///////////////////////////////////////////////////////////////////////////

$(document).ready(function() {

	var ONE_SECOND = 1000;
	var ONE_MINUTE = 60 * ONE_SECOND;

	var TIME_TO_WATCH = 10 * ONE_MINUTE;	// Using 10 minutes for testing purposes
	var COUNT_DOWN_TIME = 9000;
	var watchTimer = null;
	var countdownTimer = null;
	var countDownTimeLeft = -1;
	var LAST_ACTIVITY_TIME = 'last_activity_time'
	var COUNT_DOWN_TIME_LEFT = 'count_down_time_left';
	var COUNTDOWN_STARTED = 'countdown_started';
	var CANCEL_COUNTDOWN = '--';

	function initializeTimer(seconds) {
		// Only initialize if the storage mechanism is available:
		if (store.enabled) {
			TIME_TO_WATCH = (seconds * 1000) || TIME_TO_WATCH;
			var now = new Date();
			var currentTime = now.getTime();
			store.set(LAST_ACTIVITY_TIME, currentTime);

			$(document).mousemove(function(event) {
				var now = new Date();
				var currentTime = now.getTime();
				store.set(LAST_ACTIVITY_TIME, currentTime);
			});

			poll(ONE_SECOND, function() {
				var now = new Date();
				var currentTime = now.getTime();
				var lastActivityTime = parseInt(store.get(LAST_ACTIVITY_TIME));
				var timeDelta = currentTime - lastActivityTime;
				if (timeDelta > TIME_TO_WATCH) {
					window.clearTimeout(watchTimer);
					showCountdown();
					return false;
				} else {
					return true;
				}
			});
		} else {
			console.log('Could not enable Idle timeout. Storage not available');
		}
	}

	function poll(interval, callback) {
		watchTimer = setTimeout(function() {
			var continuePoll = callback();
			if (continuePoll) {
				poll(interval, callback);
			}
		}, interval);
	}

	function startCountdown(countdownTime) {
		if (countdownTime < ONE_SECOND) {
			// just do the logout
			goToLogOut();
			return;
		}
		countdownTimer = setTimeout(countdownHelper, ONE_SECOND);
		countDownTimeLeft = countdownTime;
		store.set(COUNTDOWN_STARTED, true);
	}

	function countdownHelper() {
		var countDownStarted = store.get(COUNTDOWN_STARTED);
		if (!countDownStarted) {
			cancelCountdown();
			return;
		}

		if (countDownTimeLeft >= 0) {
			countdownTimer = setTimeout(countdownHelper, ONE_SECOND);
			console.log('Logging out in ... ' + countDownTimeLeft/ONE_SECOND);
			var secondsLeft = countDownTimeLeft/ONE_SECOND;
			$(".countdown-clock").html(secondsLeft);
			countDownTimeLeft = countDownTimeLeft - ONE_SECOND;
		} else {
			goToLogOut();
		}
	}

	function showCountdown() {
		console.log('Showing countdown');
		$(document).off('mousemove');
		$(".countdown-clock").html("-");
		$("#div-countdown-modal").modal('show');
		$(".countdown-dismiss").click(function() {
			cancelCountdown();
		});
		startCountdown(COUNT_DOWN_TIME);
	}

	function cancelCountdown() {
		store.set(COUNTDOWN_STARTED, false);
		window.clearTimeout(countdownTimer);
		$("#div-countdown-modal").modal('hide');
		initializeTimer();
	}

	function goToLogOut() {
		window.location = countryUrl + '/auth/logout/?reason=timeout';
	}

	// TODO: Handle "click to dismiss" event

	window.timer = {
		'initialize': initializeTimer
	}
});

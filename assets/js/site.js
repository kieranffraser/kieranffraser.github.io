(function () {
	'use strict';

	// Mobile nav trigger
	var trigger = document.querySelector('[data-nav-trigger]');
	var menu = document.querySelector('[data-nav-menu]');
	if (trigger && menu) {
		trigger.addEventListener('click', function () {
			var open = menu.hasAttribute('data-open');
			if (open) {
				menu.removeAttribute('data-open');
				trigger.setAttribute('aria-expanded', 'false');
			} else {
				menu.setAttribute('data-open', '');
				trigger.setAttribute('aria-expanded', 'true');
			}
		});
	}

	// Project rail prev/next buttons scroll by one card width.
	document.querySelectorAll('[data-rail]').forEach(function (rail) {
		var prev = rail.parentElement.querySelector('[data-rail-prev]');
		var next = rail.parentElement.querySelector('[data-rail-next]');
		var card = rail.querySelector('.project-card');
		var step = card ? card.getBoundingClientRect().width + 24 : 320;

		if (prev) {
			prev.addEventListener('click', function () {
				rail.scrollBy({ left: -step, behavior: 'smooth' });
			});
		}
		if (next) {
			next.addEventListener('click', function () {
				rail.scrollBy({ left: step, behavior: 'smooth' });
			});
		}
	});
})();

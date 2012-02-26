/*!
Deck JS - deck.print
Copyright (c) 2011 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module adds the methods and key binding to show and hide a print of all
slides in the deck. The deck print state is indicated by the presence of a class
on the deck container.
*/
(function($, deck, undefined) {
	var $d = $(document),
	rootSlides; // Array of top level slides
	
	/*
	Extends defaults/options.
	
	options.classes.print
		This class is added to the deck container when showing the slide print.
	
	options.keys.print
		The numeric keycode used to toggle between showing and hiding the slide
		print.
		
	options.touch.doubletapWindow
		Two consecutive touch events within this number of milliseconds will
		be considered a double tap, and will toggle the print on touch devices.
	*/
	$.extend(true, $[deck].defaults, {
		classes: {
			print: 'deck-print'
		},
		
		keys: {
			print: 84 // t
		},
		
		touch: {
			tripletapWindow: 400
		}
	});

	/*
	jQuery.deck('showMenu')
	
	Shows the slide print by adding the class specified by the print class option
	to the deck container.
	*/
	$[deck]('extend', 'showPrint', function() {
		var $c = $[deck]('getContainer'),
		opts = $[deck]('getOptions');
		
		if ($c.hasClass(opts.classes.print)) return;
		
		// Hide through loading class to short-circuit transitions (perf)
		$c.addClass([opts.classes.loading, opts.classes.print].join(' '));
		
		/* Forced to do this in JS until CSS learns second-grade math. Save old
		style value for restoration when print is hidden. */
		if (Modernizr.csstransforms) {
			$.each(rootSlides, function(i, $slide) {
				$slide.data('oldStyle', $slide.attr('style'));
				$slide.css({
					'position': 'absolute',
					'left': ((i % 4) * 25) + '%',
					'top': (Math.floor(i / 4) * 25) + '%'
				});
			});
		}
		
		// Need to ensure the loading class renders first, then remove
		window.setTimeout(function() {
			$c.removeClass(opts.classes.loading)
				.scrollTop($[deck]('getSlide').offset().top);
		}, 0);
	});

	/*
	jQuery.deck('hideMenu')
	
	Hides the slide print by removing the class specified by the print class
	option from the deck container.
	*/
	$[deck]('extend', 'hidePrint', function() {
		var $c = $[deck]('getContainer'),
		opts = $[deck]('getOptions');
		
		if (!$c.hasClass(opts.classes.print)) return;
		
		$c.removeClass(opts.classes.print);
		$c.addClass(opts.classes.loading);
		
		/* Restore old style value */
		if (Modernizr.csstransforms) {
			$.each(rootSlides, function(i, $slide) {
				var oldStyle = $slide.data('oldStyle');

				$slide.attr('style', oldStyle ? oldStyle : '');
			});
		}
		
		window.setTimeout(function() {
			$c.removeClass(opts.classes.loading).scrollTop(0);
		}, 0);
	});

	/*
	jQuery.deck('toggleMenu')
	
	Toggles between showing and hiding the slide print.
	*/
	$[deck]('extend', 'togglePrint', function() {
		$[deck]('getContainer').hasClass($[deck]('getOptions').classes.print) ?
		$[deck]('hidePrint') : $[deck]('showPrint');
	});

	$d.bind('deck.init', function() {
		var opts = $[deck]('getOptions'),
		touchEndTime = 0,
		currentSlide,
		slideTest = $.map([
			opts.classes.before,
			opts.classes.previous,
			opts.classes.current,
			opts.classes.next,
			opts.classes.after
		], function(el, i) {
			return '.' + el;
		}).join(', ');
		
		// Build top level slides array
		rootSlides = [];
		$.each($[deck]('getSlides'), function(i, $el) {
			if (!$el.parentsUntil(opts.selectors.container, slideTest).length) {
				rootSlides.push($el);
			}
		});
		
		// Bind key events
		$d.unbind('keydown.deckprint').bind('keydown.deckprint', function(e) {
			if (e.which === opts.keys.print|| $.inArray(e.which, opts.keys.print) > -1) {
				$[deck]('togglePrint');
				e.preventDefault();
			}
		});
		
		// Triple tap to toggle slide print for touch devices
		$[deck]('getContainer').unbind('touchstart.deckprint').bind('touchstart.deckprint', function(e) {
			currentSlide = $[deck]('getSlide');
		})
		.unbind('touchend.deckprint').bind('touchend.deckprint', function(e) {
			var now = Date.now();
			
			// Ignore this touch event if it caused a nav change (swipe)
			if (currentSlide !== $[deck]('getSlide')) return;
			
			if (now - touchEndTime < opts.touch.tripletapWindow) {
				$[deck]('togglePrint');
				e.preventDefault();
			}
			touchEndTime = now;
		});
		
		// Selecting slides from the print
		$.each($[deck]('getSlides'), function(i, $s) {
			$s.unbind('click.deckprint').bind('click.deckprint', function(e) {
				if (!$[deck]('getContainer').hasClass(opts.classes.print)) return;

				$[deck]('go', i);
				$[deck]('hidePrint');
				e.stopPropagation();
				e.preventDefault();
			});
		});
	})
	.bind('deck.change', function(e, from, to) {
		var container = $[deck]('getContainer');
		
		if (container.hasClass($[deck]('getOptions').classes.print)) {
			container.scrollTop($[deck]('getSlide', to).offset().top);
		}
	});
})(jQuery, 'deck');


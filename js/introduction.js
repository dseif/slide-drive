$(function() {
	// Deck initialization
  AudioJS.setup();
	$.deck('.slide');
	
	$('#style-themes').change(function() {
		$('#style-theme-link').attr('href', $(this).val());
	});
	
	$('#transition-themes').change(function() {
		$('#transition-theme-link').attr('href', $(this).val());
	});

  $(document).bind('deck.change', function(event, from, to) {
    var container = $( ".deck-container" )[ 0 ],
        slide = $.deck( "getSlide", to )[ 0 ];
    if( slide.offsetHeight > container.offsetHeight) {
      container.style.overflowY = "auto";
    } else {
      container.style.overflow = "hidden";
    }
  });

  var resize = function() {
    var elem = document.getElementById( "slideshow-transcript" );
    elem.style.height = (document.body.offsetHeight - elem.offsetTop - 3)   + "px";
    elem.style.maxWidth = (document.body.offsetWidth - 11)+ "px";
  };
  window.addEventListener( "resize", function( e ) {
    resize();
  }, false);
  window.addEventListener( "load", function( e ) {
    resize();
  }, false );

});


$(function() {
	// Deck initialization
  $("audio").mediaelementplayer({
    success: function( mediaElement, domObject ) {
      window.playerReady = true;
    }
  });
	$.deck('.slide');
  $.deck('enableScale');
	
  document.addEventListener( "keydown", function( e ) {
    if( e.keyCode === 80 ) {
      var elem = document.getElementById( "audio" );
      !elem.paused ? elem.pause() : elem.play();
    }
  }, false);

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
    elem.style.maxWidth = (document.body.offsetWidth)+ "px";
  };
  window.addEventListener( "resize", function( e ) {
    resize();
  }, false);
  window.addEventListener( "load", function( e ) {
    resize();
  }, false );

});


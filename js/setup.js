$(function() {
	// Deck initialization
  $("audio").mediaelementplayer({
    success: function( mediaElement, domObject ) {
      window.playerReady = true;
    }
  });

	$.deck(".slide");
  $.deck("enableScale");

  var showingPrintable = false,
      alreadyCalled = false;
	
  var resize = function() {
    var elem = document.getElementById( "slideshow-transcript" );
    elem.style.height = (document.body.offsetHeight - elem.offsetTop - 3)   + "px";
    elem.style.maxWidth = (document.body.offsetWidth)+ "px";
  };

  var openPrint = function() {
    alreadyCalled = true;
    var body = document.getElementById( "printable" ),
        bodyChildren = document.body.children[ 0 ].getElementsByTagName( "section" );

    for( var i = 0, l = bodyChildren.length; i < l; i++ ) {
      var slideContainer = document.createElement("slideContainer"),
          slide = document.createElement( "div" ),
          transcript = document.createElement( "div" );

      slideContainer.className = "printable-container";

      slide.className = "printable-slide";
      transcript.className = "printable-transcript";

      slide.appendChild( bodyChildren[ i ].cloneNode(true) );

      slide.children[ 0 ].className = "slide deck-child-current";

      if( slide.children[ 0 ] && slide.children[ 0 ].children[ 0 ] ) {

        var trans = slide.children[ 0 ].querySelectorAll(".transcript"),
            slides = slide.children[ 0 ].children[ 0 ].querySelectorAll(".slide"),
            innerTrans = "";

        if( slides.length > 0 ) {
          for( var j = 0, k = slides.length; j < k; j++ ) {
            slides[ j ].className = "slide deck-current";
          }
        }
        if( trans.length > 0 ) {
          for( var a = 0, s = trans.length; a < s; a++ ) {
           innerTrans += trans[ a ].innerHTML + "\n";
          } 
          transcript.innerHTML = innerTrans;
        }
      }

      
      slideContainer.appendChild( slide );
      slideContainer.appendChild( transcript );
      body.appendChild( slideContainer );
      (function( sl, tr ) {
        function resize() {
          var rect = sl.getBoundingClientRect();
          if( rect.height > 0 ) {
            tr.style.height = rect.height + "px";
          } else {
            setTimeout( resize, 100 );
          }
        }
        resize();
      })( slide, transcript );
    }
  };

  document.addEventListener( "keydown", function( e ) {
    if( e.keyCode === 80 ) {
      var elem = document.getElementById( "audio" );
      !elem.paused ? elem.pause() : elem.play();
    } else if( e.keyCode === 84 ) {
      if( !alreadyCalled ) {
        openPrint();
      }
      if( !showingPrintable ) {
        document.getElementById( "printable" ).style.display = "";
        document.getElementById( "main" ).style.display = "none";
      } else {
        document.getElementById( "printable" ).style.display = "none";
        document.getElementById( "main" ).style.display = "";
      }
      showingPrintable = !showingPrintable;
    }
  }, false);
  $(document).bind('deck.change', function(event, from, to) {
    var container = $( ".deck-container" )[ 0 ],
        slide = $.deck( "getSlide", to )[ 0 ];
    if( slide.offsetHeight > container.offsetHeight) {
      container.style.overflowY = "auto";
    } else {
      container.style.overflow = "hidden";
    }
  });
  window.addEventListener( "resize", function( e ) {
    resize();
  }, false);
  window.addEventListener( "load", function( e ) {
    resize();
  }, false );
});


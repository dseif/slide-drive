$(function() {
	// Deck initialization
  $("audio").mediaelementplayer({
    success: function( mediaElement, domObject ) {
      window.playerReady = true;
    }
  });

	$.deck(".slide");
  $.deck("enableScale");
	
  var resize = function() {
    var elem = document.getElementById( "slideshow-transcript" );
    elem.style.height = (document.body.offsetHeight - elem.offsetTop - 3)   + "px";
    elem.style.maxWidth = (document.body.offsetWidth)+ "px";
  };

  var openPrint = function() {
    var win = window.open(),
        head = win.document.head,
        body = win.document.body,
        bodyChildren = document.body.children[ 0 ].getElementsByTagName( "section" ),
        headChildren = document.head.children;

    for( var i = 0, l = headChildren.length; i < l; i++ ) {
      head.appendChild( headChildren[ i ].cloneNode(true) );
    }

    body.className = "deck-container";
    body.style.width = "100%";
    body.style.padding = "0 0px";

    for( var i = 0, l = bodyChildren.length; i < l; i++ ) {
      var slideContainer = document.createElement("slideContainer"),
          slide = document.createElement( "div" ),
          transcript = document.createElement( "div" );

      slideContainer.style.width = "100%";
      slideContainer.style.float = "left";

      slide.style.height = "100%";
      slide.style.width = "49%";
      slide.style.display = "inline-block";
      slide.style.border = "solid 1px black";

      transcript.style.height = "100%";
      transcript.style.width = "49%";
      transcript.className = "slide";
      transcript.style.float = "right";
      transcript.style.border = "solid 1px black";

      slide.appendChild( bodyChildren[ i ].cloneNode(true) );

      slide.children[ 0 ].className = "slide deck-child-current";

      if( slide.children[ 0 ] && slide.children[ 0 ].children[ 0 ] ) {
      var trans = slide.children[ 0 ].querySelectorAll(".transcript");
      var slides = slide.children[ 0 ].children[ 0 ].querySelectorAll(".slide"); 
      if( slides.length > 0 ) {
        for( var j = 0, k = slides.length; j < k; j++ ) {
          slides[ j ].className = "slide deck-current";
        }
      }
      var innerTrans = "";
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
    }
  };

  document.addEventListener( "keydown", function( e ) {
    if( e.keyCode === 80 ) {
      var elem = document.getElementById( "audio" );
      !elem.paused ? elem.pause() : elem.play();
    } else if( e.keyCode === 84 ) {
      openPrint();
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


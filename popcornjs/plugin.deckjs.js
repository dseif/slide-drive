(function ( Popcorn ) {
    var resize = function() {
      var elem = document.getElementById( "slideshow-transcript" );
      elem.style.height = document.body.offsetHeight - elem.offsetTop + 15  + "px";
    };
    window.addEventListener( "resize", function( e ) {
      resize();
    }, false);
    window.addEventListener( "load", function( e ) {
      resize();
    }, false );

  Popcorn.plugin( "deckjs" , {
      manifest: {
        about: {
          name: "Popcorn deckjs plugin",
          author: "David Seifried",
          website: "http://dseifried.wordpress.com/"
        },
        options:{
          start: {
            elem: "input",
            type: "number",
            label: "In"
          },
          end: {
            elem: "input",
            type: "number",
            label: "Out"
          },
          slide: {
            elem: "input",
            type: "text",
            label: "Slide"
          },
          target: "deckjs-container",
        }
      },
      _setup: function( options ) {
        $.deck( ".slide" );
      }, 
      start: function( event, options ) {
        $.deck( "go", +options.slide );
        document.getElementById( options.target ).className += " current-slide";
        document.getElementById( "slideshow-transcript" ).innerHTML = $( ".transcript" )[ +options.slide ].innerHTML;
      },
      end: function( event, options ) {
        document.getElementById( options.target ).className = "popcorn-slideshow";
        document.getElementById( "slideshow-transcript" ).innerHTML = "";
      },
    });
})( Popcorn );

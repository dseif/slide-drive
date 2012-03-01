(function ( Popcorn ) {
    
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
      }, 
      start: function( event, options ) {
        $.deck( "go", +options.slide );
        document.getElementById( "slideshow-transcript" ).innerHTML = $( ".transcript" )[ +options.slide ].innerHTML;
        document.getElementById( "slideshow-transcript" ).style.padding = "5px 5px 5px 5px";
      },
      end: function( event, options ) {
        document.getElementById( "slideshow-transcript" ).innerHTML = "";
      },
    });
})( Popcorn );

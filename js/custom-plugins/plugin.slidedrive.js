(function ( Popcorn ) {

  Popcorn.plugin( "slidedrive" , {
      manifest: {
        about: {
          name: "Slide Drive plugin",
          author: "David Seifried",
          website: "http://dseifried.wordpress.com/"
        },
        options: {
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
          slideId: {
            elem: "input",
            type: "text",
            label: "Slide (id)"
          },
          transcriptSource: {
            elem: "input",
            type: "text",
            label: "Transcript (HTML)"
          },
          target: "deckjs-container",
        }
      },
      _setup: function( options ) {
        
      }, 
      start: function( event, options ) {
        $.deck.__goingFromButter = true; // TODO anything less hacky than this. oh, and if we don't actually go this won't be cleared.
        $.deck( "go", options.slideId );

        document.getElementById( "slideshow-transcript" ).innerHTML = options.transcriptSource;
        document.getElementById( "slideshow-transcript" ).style.padding = "5px 5px 5px 5px";
      },
      end: function( event, options ) {
        document.getElementById( "slideshow-transcript" ).innerHTML = "";
      },
    });
})( Popcorn );

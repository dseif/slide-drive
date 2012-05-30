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
            elem: "textarea",
            type: "text",
            label: "Transcript (HTML)"
          },
          target: "audio"
        }
      },
      _setup: function( options ) {
        
      }, 
      start: function( event, options ) {
        console.log("Going to slide " + options.slideId);
        $.deck( "go", options.slideId );

        document.getElementById( "slideshow-transcript" ).innerHTML = options.transcriptSource;
        document.getElementById( "slideshow-transcript" ).style.padding = "5px 5px 5px 5px";
      },
      end: function( event, options ) {
        document.getElementById( "slideshow-transcript" ).innerHTML = "";
      },
    });
})( Popcorn );

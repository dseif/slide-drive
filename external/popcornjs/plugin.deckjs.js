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

        var transcriptSource = $( ".transcript" )[ +options.slide ];

        if ( transcriptSource.innerHTML != null ) {
          document.getElementById( "slideshow-transcript" ).innerHTML = transcriptSource.innerHTML;
        } else {
          // It's a non-HTML node. We'll treat its textContent *AS HTML*.
          // For example, <text x="0" y="0" class="transcript"><![CDATA[<b>This</b> is a transcript!]]></text>
          document.getElementById( "slideshow-transcript" ).innerHTML = transcriptSource.textContent;
        }

        document.getElementById( "slideshow-transcript" ).style.padding = "5px 5px 5px 5px";
      },
      end: function( event, options ) {
        document.getElementById( "slideshow-transcript" ).innerHTML = "";
      },
    });
})( Popcorn );

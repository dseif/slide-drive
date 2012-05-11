jQuery( function ( $ ) {
  "use strict";
  
  init();

  /*  Loads the template asynchronously, sets up drag-related event handlers
      and displays related messages to the user.
  */  
  function init () {
    $( "html" ).on( {
      "dragover.waiting": anticipateDrop,
      "dragenter.waiting": anticipateDrop,
      "drop.waiting": handleDrop,
      "dragleave.waiting": unanticipateDrop,
      "dragend.waiting": unanticipateDrop,
    } );
  }

  /* Highlight target and prepare for "copy" drop event.
  */  
  function anticipateDrop ( event ) {
    if ( event.preventDefault ) event.preventDefault();
    if ( event.stopPropagation ) event.stopPropagation();
    event.originalEvent.dataTransfer.dropEffect = "copy";
    event.originalEvent.dataTransfer.dropAllowed = "copy";
    $( "body" ).css( "opacity", 0.75 );
    return false;
  }

  /* Unhighlight target.
  */
  function unanticipateDrop ( event ) {
    $( "body" ).css( "opacity", 1.0 );
    return false;
  }
  
  /* Verifies that the right type of files were dropped, otherwise displays an error.
     If they have been then unbind the drop handlers, read the file and continue to handleDroppedSVG.
  */  
  function handleDrop ( event ) {
    if ( event.preventDefault ) event.preventDefault();
    if ( event.stopPropagation ) event.stopPropagation();
    
    unanticipateDrop();
    
    if ( event.originalEvent.dataTransfer.files.length !== 1 ) {
      console.log( "Please drop a single SVG file. You dropped " + event.originalEvent.dataTransfer.files.length + " files." );
      return false;
    }
    
    var file = event.originalEvent.dataTransfer.files[0],
        reader = new FileReader();
    
    if ( file.type != "image/svg+xml" ) {
      console.log( "Please drop an SVG file; you dropped a " + file.type + " file." );
      return false;
    }
    
    console.log( "Reading SVG..." );
    
    reader.readAsText(file, "UTF-8" );
    reader.onloadend = function () {
      if (reader.readyState != FileReader.DONE) {
        return;
      }
      
      var svgRoot = $( "<div>" ).html( reader.result ).children( "svg" )[ 0 ];
      
      handleDroppedSVG(svgRoot);
    };
    
    return false;
  }
  
  // Maps of lowercase known font names to list of fallback fnts.
  // The system copy will have top priority, followed by the embedded version, then the fallbacks.
  
  var knownFonts = {
    // We expect "safer" fonts or metrics-maching fallbacks to be present on ~90%+ of systems.
    safer: { 
      "arial": [ "Liberation Sans", "Helvetica", "Arimo", "sans-serif" ],
      "helvetica": [ "Liberation Sans", "Arial", "Arimo", "sans-serif" ],
      "liberation sans": [ "Helvetica", "Arial", "Arimo", "sans-serif" ],
      "arimo": [ "Liberation Sans", "Helvetica", "Arial", "sans-serif" ],

      "times new roman": [ "Liberation Serif", "Times", "Tinos", "serif" ],
      "times": [ "Times New Roman", "Liberation Serif", "Tinos", "serif" ],
      "liberation serif": [ "Times New Roman", "Times", "Tinos", "serif" ],
      "tinos": [ "Liberation Serif", "Times New Roman", "Times", "serif" ],

      "courier new": [ "Liberation Mono", "Cousine", "monospace" ],
      "liberation mono": [ "Courier New", "Cousine", "monospace" ],
      "cousine": [ "Liberation Mono", "Courier New", "monospace" ],
    
      "arial black": [ "sans-serif" ],
    
      "georgia": [ "serif" ],
    
      "impact": [ "sans-serif" ]
    },
    
    unsafe: {
      "arial narrow": [ "Liberation Sans Narrow", "sans-serif" ],
      "liberation sans narrow": [ "arial narrow", "sans-serif" ],

      "menlo": [ "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "monospace" ],
      "dejavu sans mono": [ "Bitstream Vera Sans Mono", "menlo", "monospace" ],
      "bitstream vera sans mono": [ "DejaVu Sans Mono", "menlo", "monospace" ],

      "courier": [ "monospace" ],

      "consolas": [ "monospace" ],
      
      "monaco": [ "monospace" ],
      
      "lucida console": [ "monospace" ]
    }
  };
  
  function makeFontStack( fontName ) {
    fontName = fontName.replace( / embedded$/, '' );
    
    var fontKey = fontName.toLowerCase(),
        fontNames = [ fontName, fontName + " embedded" ];
    
    if ( fontKey in knownFonts.safer ) {
      fontNames.push.apply( fontNames, knownFonts.safer[ fontKey ] );
    } else if ( fontKey in knownFonts.unsafe ) {
      fontNames.push.apply( fontNames, knownFonts.unsafe[ fontKey ] );
    }
    
    return fontNames.join( "," );
  }
  
  function stripWhitespaceNodes ( el ) {
    if ( el.nodeType === 3 ) {
      if ( /^\s*$/.test( el.textContent) ) {
        el.parentNode.removeChild( el )
      }
    } else {
      for ( var i = 0; i < el.childNodes.length; ++i ) {
        stripWhitespaceNodes( el.childNodes[ i ] );
      }
    }
  }
  
  /* Given the root of a loaded SVG element, proccess it and split into elements for each slide.
     Calls addSlide on each processed slide.
  */
  function handleDroppedSVG ( root ) {
    console.log( "Read SVG from file." );
    
    // Remove whitespace text nodes between <text> nodes.
    
    var textGroups = $.unique( $( "text", root ).map(function() { return $(this).closest("g")[0]; }).get() );
    textGroups.map(stripWhitespaceNodes);
    
    // Embedded fonts? Detach before cloning, then re-add to the first slide.
    
    var i, l, f, d;
    
    var fontUsage = {},
        fontUsers = $( "[font-family]", root );
    
    for ( i = 0, l = fontUsers.length; i < l; ++i ) {
      var element = fontUsers[ i ],
          fontFamily = element.getAttribute( "font-family" );
      
      fontFamily = fontFamily.replace( / embedded$/, '' ).toLowerCase();
      
      if ( !(fontFamily in fontUsage) ) {
        fontUsage[ fontFamily ] = [ element ];
      } else {
        fontUsage[ fontFamily ].push( element );
      }
      
      element.setAttribute( "font-family", makeFontStack( fontFamily ) );
    }
    
    $( ".Slide", root ).removeClass( "Slide" ).addClass( "libreoffice-slide" );
    
    // TODO - display this somewhere
    for ( var name in fontUsage ) {
      var status;
      if ( name in knownFonts.safer ) {
        status = "Safe";
      } else if ( name in knownFonts.unsafe ) {
        status = "Known, Unsafe";
      } else {
        status = "Unknown, Unsafe";
      }
    }
    
    var slideIds = $( ".libreoffice-slide", root ).map( function () {
      return $( this ).attr( "id" );
    } );
    
    var cumulativeDuration = +($( ".deck-container .slide" ).last().attr( "data-popcorn-slideshow" ) || 0) + 3;;
    
    slideIds.each(function ( index, id ) {
      var slide = $( root ).clone()[ 0 ];
      
      // We only want embedded fonts to be included in the first slide, because from there it will be
      // usable from the others, so we remove them from the root after the first slide is cloned.
      if ( index === 0 ) {
        $( "font, font-face, missing-glyph", root ).remove();
      }
      
      $( ".libreoffice-slide", slide ).each( function () {
        if ( $( this ).attr( "id" ) !== id ) {
          $( this ).remove();
        } else {
          $( this ).attr( "visibility", "visible" );
        }
      } );
      $( "[visible=hidden] ", this ).remove()
      
      var container = document.querySelector( ".deck-container" );
      
      var slideEl = document.createElement( "section" ),
          transEl = document.createElement( "div" );
      
      slideEl.setAttribute( "id", 
        slideEl.textContent.replace(/[^a-z0-9]/gi, '').substring(0, 8).toLowerCase() + "-"
        + (Math.random() * (1 << 30) | 0).toString(36));
      
      console.log("adding slide", slideEl.getAttribute( "id" ));
      
      slideEl.setAttribute( "class", "slide" );
      slideEl.setAttribute( "popcorn-slideshow", cumulativeDuration );
      
      transEl.setAttribute( "class", "transcript" );
      
      slideEl.appendChild( transEl );
      slideEl.appendChild( slide );
      
      container.appendChild( slideEl );
      
      butter.media[ 0 ].tracks[ 0 ].addTrackEvent({
        type: "slidedrive",
        popcornOptions: {
          get start: function() { 
            return +document.getElementById( this.slideId ).getAttribute( "data-popcorn-slideshow" );
          },
          set start: function( start ) {
            document.getElementById( this.slideId ).setAttribute( "data-popcorn-slideshow", start );
          },
          end: cumulativeDuration + 5,
          transcriptSource: "",
          slideId: slideEl.getAttribute( "id" )
        }
      });
      
      slideData.push({
        start: cumulativeDuration,
        end: cumulativeDuration + 5,
        id: slideEl.getAttribute( "id" )
      });
      
      cumulativeDuration += 5;
    });
    
    $.deck( ".slide" );
  }
} );

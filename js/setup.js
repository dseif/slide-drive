addEventListener( "DOMContentLoaded", function() {
  "use strict";
  
  var printableElement = null,
      showingPrintable = false,
      inButter         = !!window.Butter,
      butter           = null,
      fromButter       = !inButter && document.querySelector( "body" ).hasAttribute( "data-butter-crufted" ),
      popcorn          = null;
  
  init();
  
  window.SlideButterOptions = SlideButterOptions
  function SlideButterOptions ( elOrId ) {
    var _el;
    
    if ( typeof elOrId === "string" ) {
      _el = document.getElementById( elOrId );
      
      if (_el == null) {
        throw new Error( "There is no element with ID " + elOrId );
      }
    } else {  
      _el = elOrId;
      
      if ( !(_el && "nodeType" in _el) ) {
        throw new Error( "SlideButterOptions argument must be a DOM node or ID thereof.\nIt was " + _el );
      }
    }
    
    var existingInstance =  $( _el ).data( "slidedrive.butteroptions" );
    
    if ( existingInstance ) {
      return existingInstance;
    }
    
    if ( !(this instanceof SlideButterOptions) ) {
      return new SlideButterOptions( _el );
    }
    
    $( _el ).data( "slidedrive.butteroptions", this );
    
    Object.defineProperties( this, {
      start: {
        enumerable: true,
        get: function() {
          return +_el.getAttribute( "data-popcorn-slideshow" ) || 0;
        },
        set: function( start ) {
          _el.setAttribute( "data-popcorn-slideshow", start );
          
          var successor = null,
              parent = _el.parentNode,
              siblings = parent.childNodes,
              i, sib, sibStartAttr, sibStart;
          
          // Loop backwards through siblings to find the new new location for this element.
          for ( i = siblings.length - 1; i >= 0; --i ) {
            sib = siblings[ i ];
            if ( !("getAttribute" in sib) ) {
              continue; // not an element
            }
            
            sibStartAttr = sib.getAttribute( "data-popcorn-slideshow" );
            
            if ( sibStartAttr ) {
              sibStart = +sibStartAttr;
              
              if ( sibStart >= start ) {
                successor = sib;
              }
            }
          }
          
          if ( successor != _el ) {
            parent.removeChild( _el );
            
            if ( successor == null ) {
              parent.appendChild( _el );
            } else {
              parent.insertBefore( _el, successor );
            }
            
            $.deck( ".slide" );
          }
        }
      },
      
      slideId: {
        enumerable: true,
        get: function() {
          var slideId = _el.getAttribute( "id" );
          if ( !slideId ) {
            slideId = (_el.textContent.replace( /[^a-z0-9]/gi, '' ).substring( 0, 8 )
                        .toLowerCase() || "s") + "-" + ( Math.random() * (1 << 30) | 0 ).toString( 36 );
            _el.setAttribute( "id", slideId );
          }
          return slideId;
        }
      },
      
      transcriptSource: {
        enumerable: true,
        get: function() {
          var transcriptEl = _el.querySelector(".transcript");
          
          if ( transcriptEl == null ) {
            return "";
          } else {
            if ( transcriptEl.innerHTML != null ) {
              return transcriptEl.innerHTML;
            } else {
              return transcriptEl.innerText;
            }
          }
        },
        set: function ( transcriptSource ) {
          var transcriptEl = _el.querySelector(".transcript");
          
          if ( transcriptEl == null ) {
            if ( _el.innerHTML != null ) {
              transcriptEl = document.createElement( "div" );
              transcriptEl.innerHTML = transcriptSource;
            } else {
              transcriptEl = document.createElement( "text" );
              transcriptEl.innerText = transcriptSource;
            }
            transcriptEl.setAttribute( "class", "transcript" );
            _el.insertBefore( transcriptEl, _el.firstChild );
          } else {
            if ( transcriptEl.innerHTML != null ) {
              transcriptEl.innerHTML = transcriptSource;
            } else {
              transcriptEl.innerText = transcriptSource;
            }
          }
        }
      }
    });
    
    this.end = this.start + 1;
  }
  
  function init () {
    console.log( "Starting Slide Drive initialization." );
    
    if ( fromButter ) {
      // Butter adds <base> tag to our document to make sure the resouce paths are correct.
      // After loading, it will break our anchor links and have nasty side-effects.
      
      var base = document.querySelector( "base" );
      base.parentNode.removeChild( base );
      
    }
    
    if ( inButter ) {
      Butter({
        config: "/external_configs/butter/config.json",
        ready: function ( butter_ ) {
          butter = butter_;
          window.butter = butter; // TODO remove this after debugging
          initMediaAndWait();
        }
      });
    } else {
      initMediaAndWait();
    }
  }
  
  // Initializes the media player then waits for media to be ready.
  function initMediaAndWait () {
    console.log( "Initializing media player and waiting for it to be ready." );
    
    popcorn = Popcorn( "#audio", { frameAnimation: true });
    
    window.popcorn = popcorn; // TODO remove this after debugging
    
    var pollUntilReady;
    
    $("audio").mediaelementplayer({
      success: pollUntilReady = function () {
        console.log( "MediaElement ready, waiting for popcorn.readyState() >= 2 (currently " + popcorn.readyState() + ")" );
        
        if ( popcorn.readyState() >= 2 ) {
          console.log("ready...");
          
          if ( !inButter ) {
            initAfterMediaReady();
          } else {
            console.log( "butter.readyState() is ready, waiting for butter.media[ 0 ].onReady()." );
            
            butter.media[ 0 ].onReady(function () { 
              initAfterMediaReady();
            });
          }
        } else {
          console.log("waiting...");
          setTimeout( pollUntilReady, 250 );
        }
      }
    });
  }
  
  // Initialization to take place after media (and Butter)? is ready.
  function initAfterMediaReady () {
    console.log( "Media ready, continuing initialization." );
    
    if ( inButter ) {
      butter.page.listen( "getHTML", function ( e ) {
        var root = e.data;
        
        // Remove the rendered controls from around the audio element.
        var renderedContainer = root.querySelector( ".mejs-container" ),
            containedAudio = renderedContainer.querySelector( "audio" );
        
        renderedContainer.parentNode.replaceChild( containedAudio, renderedContainer );
        
        // We don't want Butter's copy of the popcorn events. They'll have been mirroed
        // back into the DOM, which we'll parse them back out of.
        // This will need a bit more nuance when other Popcorn events can be added.
        
        var pageScripts = root.querySelectorAll( "script" ),
            lastScript = pageScripts[ pageScripts.length - 1 ];
        
        // lastScript.parentNode.removeChild( lastScript );
      });
      
      // Bind file drop handling to each Butter track.
      butter.media[ 0 ].listen( "trackadded" , function( e ) {
        var track = e.data;
        track.view.listen( "filesdropped", function( e ) {
          onDroppedFilesOnTrack( e.data.files, e.data.track, e.data.start );
        });
      })
    }
    
    $.deck( ".slide" );
    
    // Parse slide data into live Popcorn events or Butter timeline events.
    var butterTrack,
        addEvent = inButter ? function ( options ) { butterTrack.addTrackEvent({ type: "slidedrive", popcornOptions: options }); }
                            : function ( options ) { popcorn.slidedrive( options ); }
    
    if ( inButter ) {
      butterTrack = butter.media[ 0 ].addTrack( "Slides" );
    }
    
    var slidesEls = document.querySelectorAll( ".slide" );
    
    for ( var i = 0; i < slidesEls.length; ++i ) {
      addEvent( SlideButterOptions( slidesEls[ i ] ) );
    }
    
    // $.deck.enableScale();
    
    initEvents();
    initTimelineTargets();
    
    window._slideDriveReady = true;
  }
  
  // Initialize keyboard shorcuts (disable Deck's if in Butter, else enable our own).
  // Oh, and Popcorn responses to Deck card changes, too!
  function initEvents () {
    if ( inButter ) {
      console.log( "Deactivating Deck.js keyboard shortcuts." );
      // You can define new key bindings, but removing existing ones doesn't seem to work.
      // Instead we'll explicitly unbind any listeners on document for keydown.deck*.
      
      var events = $( document ).data( "events" ).keydown,
          toRemove = [];
      
      for ( var i = 0; i < events.length; i++ ) {
        if ( /^deck/.test( events[i].namespace ) ) {
          toRemove.push( events[i].type + "." + events[i].namespace )
        }
      }
            
      for ( var i = 0; i < toRemove.length; i++ ) {
        $( document ).off( toRemove[ i ] );
      }
    } else {
      console.log( "Activating our keyboard shortcuts." );
      
      document.addEventListener( "keydown", function( e ) {
        if ( e.keyCode === 80 ) {
          var elem = document.getElementById( "audio" );
          !elem.paused ? elem.pause() : elem.play();
        } else if( e.keyCode === 84 ) {
          if( !printableElement ) {
            printableElement = initPrintable();
          }
          if( !showingPrintable ) {
            printableElement.style.display = "";
            document.getElementById( "main" ).style.display = "none";
          } else {
            printableElement.style.display = "none";
            document.getElementById( "main" ).style.display = "";
          }
          showingPrintable = !showingPrintable;
        }
      }, false);
    }
    
    window.addEventListener( "resize", function ( e ) {
      resizeTranscript();
    } );
    
    window.addEventListener( "load", function ( e ) {
      resizeTranscript();
    } );
    
    $(document).bind('deck.change', function(event, from, to) {
      if ( from === to ) {
        return;
      }
      
      var container = document.querySelector( ".deck-container" ),
          slide = document.querySelectorAll( ".slide" )[ to ],
          parentSlides = $( slide ).parents( ".slide" );
      
      // Size should be based on height of the current master slide, not sub-slide.
      if (parentSlides.length) {
        slide = parentSlides[ parentSlides.length - 1 ];
      }

      if( slide.offsetHeight > container.offsetHeight) {
        container.style.overflowY = "auto";
      } else {
        container.style.overflow = "hidden";
      }
      
      var toSlide = SlideButterOptions( slide );
      
      popcorn.currentTime( toSlide.start );
    });
    
  }
  
  function resizeTranscript () {
    var elem = document.getElementById( "slideshow-transcript" );
    elem.style.height = (document.body.offsetHeight - elem.offsetTop - 3)   + "px";
    elem.style.maxWidth = (document.body.offsetWidth)+ "px";
  }
  
  /* Verifies that the right type of files were dropped, otherwise displays an error.
     If they have been then unbind the drop handlers, read the file and continue to handleDroppedSVG.
  */  
  function onDroppedFilesOnTrack ( files, track, time ) {
    var i, l, file, reader;
    
    for ( i = 0, l = files.length; i < l; ++i ) {
      file = files[ i ];
      reader = new FileReader();
      
      if ( file.type != "image/svg+xml" ) {
        continue;
      }

      console.log( "Reading SVG..." );
      
      reader.readAsText(file, "UTF-8" );
      reader.onloadend = function () {
        if (this.readyState != FileReader.DONE) {
          return;
        }

        var tmpContainer = document.createElement( "div" ),
            svgRoot;
        
        tmpContainer.innerHTML = this.result;
        svgRoot = tmpContainer.querySelector( "svg" );

        handleDroppedSVG(svgRoot, track, time);
      };
    }
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
  
  function makeFontEmbedder ( root ) {
    var fontEls = $.map( root.querySelectorAll( "font-face" ), function( el ) {
      el.cloneNode( true );
    }),
        fonts = {},
        i, l;
    
    for ( i = 0, l = fontEls.length; i < l; ++i ) {
      var fontEl = fontEls[ i ],
          key = fontKey( fontEl.getAttribute( "font-family" ),
                         fontEl.getAttribute( "font-weight" ),
                         fontEl.getAttribute( "font-style" ) ),
          unitsPerEm = +(fontEl.getAttribute( "units-per-em" ) || 1000),
          glyphEls = fontEl.querySelectorAll( "glyph" ),
          font = fonts[ key ],
          j, m;
      
      if ( !font ) {
        fonts[ key ] = font = {};
      }
      
      for ( j = 0, m = glyphEls.length; j < m; ++j ) {
        font[ glyphEls[ i ].getAttribute( "unicode" ) ] = glyphEls[ i ].getAttribute( "d" );
      }
    }
    
    return embedFonts;
    
    function fontKey ( family, weight, style ) {
      return family + "\n" + (weight || "normal") + "\n" + (style || "normal");
    }
    
    function embedFonts ( el ) {
      var family = el.style.fontFamily,
          weight = el.style.fontWeight,
          style = el.style.fontStyle,
          key = fontKey( family, weigh, style )
          emSize = el.style.fontSize,
          emSizeUnitless,
          dummySizeEl = document.createElementNS( "http://www.w3.org/2000/svg", "g" ),
          text = el.textContent;
      
      dummySizeEl.style.height = emSize;
      dummySizeEl.height
    }
  }
  
  /* Given the root of a loaded SVG element, proccess it and split into elements for each slide.
     Calls addSlide on each processed slide.
  */
  function handleDroppedSVG ( root, track, start ) {
    console.log( "Read SVG from file." );
    
    // Remove whitespace text nodes between <text> nodes.
    
    var textGroups = $.unique( $( "text", root ).map(function() { return $(this).closest("g")[0]; }).get() );
    textGroups.map(stripWhitespaceNodes);
    
    // Embedded fonts? Detach before cloning, then re-add to the first slide.
    
    var i, l, f, d;
    
    var fontUsage = {},
        fontUsers = root.querySelector( "[font-family] ");
    
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
    
    var svgSlideSubtrees = root.querySelectorAll( ".Slide" ),
        svgSlideIds = $.map( svgSlideSubtrees, function( el ) {
          return el.getAttribute( "id" );
        });
    
    $( svgSlideSubtrees ).removeClass( "Slide" ).addClass( "libreoffice-slide" );
    
    var slides = document.querySelectorAll( ".deck-container .slide" );
    
    var cumulativeDuration = (slides[ slides.length - 1 ] && slides[ slides.length - 1 ].getAttribute( "data-popcorn-slideshow" ) || 0) + 3;
    
    i = 0;
    var addSlideInterval = setInterval(function() {
      if ( i >= svgSlideIds.length ) {
        clearInterval( addSlideInterval );
        return;
      }
      
      var svgSlideId = svgSlideIds[ i ],
          svgSlide = root.cloneNode( true );
      
      // We only want embedded fonts to be included in the first slide, because from there it will be
      // usable from the others, so we remove them from the root after the first slide is cloned.
      if ( i === 0 ) {
        $( "font, font-face, missing-glyph", root ).remove();
      }
      
      var j, candidate, cruftsAndSlide = svgSlide.querySelectorAll( ".libreoffice-slide" );
      
      for ( j = 0; j < cruftsAndSlide.length; j++ ) {
        candidate = cruftsAndSlide[ j ];
        
        if ( candidate.getAttribute( "id" ) !== svgSlideId ) {
          candidate.parentNode.removeChild( candidate );
        } else {
          candidate.setAttribute( "visibility", "visibile" );
        }
      }
      
      var hiddenElements = svgSlide.querySelectorAll( "[visible=hidden]" );
      
      // Remove hidden elements - they're of no interest to us.
      for ( j = 0; j < hiddenElements.length; j++ ) {
        hiddenElements[ j ].parentNode.removeChild( hiddenElements[ j ] );
      }
      
      var container = document.querySelector( ".deck-container" );
      
      var slideEl = document.createElement( "section" ),
          transEl = document.createElement( "div" );
      
      slideEl.setAttribute( "class", "slide" );
      slideEl.setAttribute( "data-popcorn-slideshow", start + i * 1 ); // TODO better start times
      
      transEl.setAttribute( "class", "transcript" );
      
      slideEl.appendChild( transEl );
      
      slideEl.appendChild( svgSlide );
      
      container.appendChild( slideEl );
      
      track.addTrackEvent({
        type: "slidedrive",
        popcornOptions: SlideButterOptions( slideEl )
      });
      
      cumulativeDuration += 5;
      
      var currentSlide = $.deck( "getSlide" )[0];
      $.deck( ".slide" );
      $.deck( "go", currentSlide );
      
      i++;
    }, 200);
  }

  
  function initPrintable () {
    var body = document.getElementById( "printable" ),
        bodyChildren = document.body.children[ 0 ].getElementsByTagName( "section" );

    for( var i = 0, l = bodyChildren.length; i < l; i++ ) {
      var slideContainer = document.createElement("slideContainer"),
          slide = document.createElement( "div" ),
          transcript = document.createElement( "div" ),
          gotoLink = document.createElement( "a" );

      slideContainer.className = "printable-container";

      slide.className = "printable-slide";
      transcript.className = "printable-transcript";
      gotoLink.href = "#" + bodyChildren[ i ].getAttribute( "id" );
      gotoLink.textContent = "Go to Slide";

      gotoLink.className = "print-nav-link";

      gotoLink.addEventListener( "click", function() {
        document.getElementById( "printable" ).style.display = "none";
        document.getElementById( "main" ).style.display = "";
        showingPrintable = false;
      }, false );

      slide.appendChild( bodyChildren[ i ].cloneNode(true) );
      slide.appendChild( gotoLink );

      slide.children[ 0 ].className = "slide deck-child-current";

      if( slide.children[ 0 ] && slide.children[ 0 ].children[ 0 ] ) {

        var trans = slide.children[ 0 ].querySelectorAll(".transcript"),
            slides = slide.children[ 0 ].querySelectorAll(".slide"),
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
    
    return document.getElementById("printable");
  }

  function initTimelineTargets () {

      var container,
          innerContainer = document.createElement( "span" ),
          userAgent = navigator.userAgent.split( " " ),
          trackEvents = [],
          prevTime = 0,
          count = 0,
          pixelsPerSecond,
          containerWidth,
          flag = false,
          eventDiv = document.getElementById( "events" );
      
      function createElement( times ) {
        var teDiv = document.createElement( "span" ),
            spacer = document.createElement( "span" ),
            slides = document.querySelectorAll( ".slide" ),
            lastSlideOptions = SlideButterOptions( slides[ times ] ),
            endTime = ( times + 1 ) > slides.length - 1 ? lastSlideOptions.start: lastSlideOptions.start,
            recurse = false;


        if( innerContainer.children.length === 0 ) {
          innerContainer.appendChild( teDiv );
          innerContainer.appendChild( spacer );
          teDiv.style.width = ( pixelsPerSecond * lastSlideOptions.start ) / ( container.offsetWidth / 100 ) + "%";
          teDiv.id = "popcorn-slideshow-div-startPadding";
          recurse = true;
        } else {
          innerContainer.appendChild( teDiv );
          innerContainer.appendChild( spacer );
          // such a gross block of code, must fix this
          if( userAgent[ userAgent.length - 1 ].split( "/" )[ 0 ] === "Firefox" ) {
            teDiv.style.width = ( pixelsPerSecond * ( endTime - lastSlideOptions.start ) ) / ( ( container.offsetWidth ) / 100 ) + "%";
          } else {
            teDiv.style.width = ( pixelsPerSecond * ( endTime - lastSlideOptions.start ) ) / ( ( container.offsetWidth - ( count ) ) / 100 ) + "%";
          }
          teDiv.id = "popcorn-slideshow-div-" + count;
        }

        teDiv.innerHTML = "<p><b></b></p>";
        teDiv.className = "popcorn-slideshow";

        spacer.className = "spacer";

       recurse && createElement( times );
      }
      
      container = document.querySelector( ".mejs-time-total" );
      containerWidth = container.offsetWidth;
      pixelsPerSecond = containerWidth / popcorn.duration();

      for( var i = 0, l = document.querySelectorAll( ".slide" ).length; i < l; i++ ) {
        createElement(i)
      }

      container.insertBefore( innerContainer, container.children[ 1 ] );
      container.removeChild( container.children[ 0 ] );
      innerContainer.className += " innerContainer";

      var div = document.createElement( "span" );
      innerContainer.appendChild( div );

      div.style.width = ( ( container.getBoundingClientRect().right - innerContainer.children[ innerContainer.children.length - 2 ].getBoundingClientRect().right ) / container.offsetWidth ) * 100 + "%";
      div.id = "popcorn-slideshow-div-endPadding";
      div.innerHTML = "<p><b></b></p>";
      div.className = "popcorn-slideshow";

  }
}, false );

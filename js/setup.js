jQuery(function ($) {
  "use strict"
  
  /*
    Three modes:
    - Standard
    - in Butter
      - Non-butter keyboard shortcuts disabled
      - Semantic interpretation targets Butter timeline
    - from Butter
      - Semantic interpretation disabled    
  */
  
  var printableElement = null,
      showingPrintable = false,
      inButter         = !!window.Butter,
      butter           = null,
      fromButter       = !inButter && $( "body" ).hasClass( "slide-drive-butter" ),
      popcorn          = null;
  
  window.slideData = null;
  
  init();
  
  /*
    Used as the Popcorn options object, and all kinds of other magic.
    I'll describe it once I'm actually sure what I'm doing with it.
  */
  
  // Now, this really need some tests.
  
  function SlideProxy ( elOrId ) {
    var _el;
    
    if ( typeof elOrId === "string" ) {
      _el = document.getElementById( elOrId );
      
      if (_el == null) {
        throw new Error( "There is no element with ID " + elOrId );
      }
    } else {  
      _el = elOrId;
      
      if ( !("nodeType" in _el) ) {
        throw new Error( "SlideProxy argument must be a DOM node or ID thereof." );
      }
    }
    
    Object.defineProperties( this, {
      start: {
        enumerable: true,
        get: function() {
          return +_el.getAttribute( "data-popcorn-slideshow" );
        },
        set: function( start ) {
          _el.setAttribute( "data-popcorn-slideshow", start );
          
          var successor = null,
              parent = _el.parentNode,
              siblings = (console.log(_el), parent.childNodes),
              i, sib, sibStartAttr, sibStart;
          
          // Loop backwards through siblings to find the new new location for this element.
          for ( i = siblings.length - 1; i >= 0; --i ) {
            sib = siblings[ i ];
            if ( !("getAttribute" in sib) ) {
              continue; // not an element
            }
            
            sibStartAttr = sib.getAttribute( "data-popcorn-slideshow" );
            
            if ( sibStartAttr != null ) {
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
            
            $.deck( ".slides" );
          }
        }
      },
      
      slideId: {
        enumerable: true,
        get: function() {
          var slideId = _el.getAttribute( "id" );
          if ( slideId == null ) {
            slideId = _el.textContent.replace( /[^a-z0-9]/gi, '' ).substring( 0, 8 )
                        .toLowerCase() + "-" + ( Math.random() * (1 << 30) | 0 ).toString( 36 );
            _el.setAttribute( "id", slideId );
          }
          return slideId;
        },
        set: function ( id ) { 
          var el = document.getElementById( id );
          if ( el == null ) {
            throw new Error( "Attempted to set slideId to non-existent ID." );
          }
          _el = el;
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
            if ( el.innerHTML != null ) {
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
              _el.innerHTML = transcriptSource;
            } else {
              _el.innerText = transcriptSource;
            }
          }
        }
      }
    });
    
    this.end = this.start + 1;
  }
  
  function init () {
    console.log( "Starting Slide Drive initialization." );
    
    initSlideIds();
    
    if ( fromButter ) {
      // Butter adds <base> tag to our document to make sure the resouce paths are correct,
      // that it will break our anchor links and have nasty side-effects.
      $( "base" ).first().remove();
    }
    
    if ( inButter ) {
      Butter({
        config: "butter.conf",
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
    
    if ( fromButter ) {
      popcorn = Popcorn.instances[0];
    } else {
      popcorn = Popcorn( "#audio", { frameAnimation: true });
    }
    
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
        $( ".mejs-container", root ).replaceWith( $( ".mejs-container audio", root ) );
        
        // We don't want Butter's copy of the popcorn events. They'll have been mirroed
        // back into the DOM, which we'll parse them back out of.
        // This will need a bit more nuance when other Popcorn events can be added.
        $( "script", root ).last().remove();
      });
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
      addEvent( new SlideProxy( slidesEls[ i ] ) );
    }
    
    // $.deck.enableScale();
    
    initEvents();
    initTimelineTargets();
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
      // TODO Detect if this move is in response to a Popcorn trigger or risk infinite loopage.
      // How do I do that?
      // Set a global in the plugin which is cleared by a handler that runs *after* this one.
      // Err... or, since we can be sure that this will run, we can clear it here.
      // Except we can't be sure because going to the current slide is a noop.
      
      var container = $( ".deck-container" )[ 0 ],
          slide = slideData[ 0 ].element,
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
      
      // The slide with the lower index gets priority -- specific isn't important but consistency is.
      
      // if ( popcorn.currentTime() < slideData[ to ].start || popcorn.currentTime() > slideData[ to ].end )
      
      var toSlide = slideData[ to ],
          fromSlide = slideData[ from ],
          currentTime = popcorn.currentTime();
      
      if( popcorn.currentTime() < slideData[ to ].start || popcorn.currentTime() > slideData[ to ].end ) {
        popcorn.currentTime( slideData[ to ].start );
      }
    });
    
  }
  
  // Iterates through all slides and adds a random "id" attribute to any without one.
  function initSlideIds () {
    var slideElements = $( ".slide" ),
        i,
        currentId;
    
    for ( var i = 0; i < slideElements.length; i++ ) {
      if ( !(slideElements[ i ].getAttribute( "id" )) ) {
        slideElements[ i ].setAttribute( "id", 
          slideElements[ i ].textContent.replace(/[^a-z0-9]/gi, '').substring(0, 8).toLowerCase() + "-"
          + (Math.random() * (1 << 30) | 0).toString(36));
      }
    }
  }
  
  // Returns an array with { element, transcript, start, end, id } for each slide in the document.
  function parseSlides ( slideElements ) {
    var slides = [],
        currentSlide,
        previousSlide = {};
  
    // Note the lack of sanity checking.
    
    for ( var i = 0; i < slideElements.length; i++ ) {
      currentSlide = {
        start: (i > 0) ? +slideElements[ i ].getAttribute( "data-popcorn-slideshow" ) : 0,
        element: slideElements[ i ],
        id: slideElements[ i ].getAttribute( "id" )
      };
      
      var transcriptElement = $( ".transcript", slideElements[ i ] )[0];
      if ( transcriptElement ) {
        if ( transcriptElement.innerHTML != null ) {
          currentSlide.transcriptSource = transcriptElement.innerHTML;
        } else {
          // If transcript is in a non-HTML (SVG) node, we interpret its textContent as HTML.
          currentSlide.transcriptSource = transcriptElement.textContent;
        }
      } else {
        currentSlide.transcriptSource = "";
      }
      
      slides.push( currentSlide );
      previousSlide.end = currentSlide.start;
      previousSlide = currentSlide;
    }
    
    // previousSlide.end = popcorn.duration();
    
    if ( previousSlide.end < previousSlide.start ) {
      console.warn( "Total slide duration exceeds audio duration." );
      previousSlide.end = previousSlide.start + 5;
    }
    
    return slides;
  }
  
  function resizeTranscript () {
    var elem = document.getElementById( "slideshow-transcript" );
    elem.style.height = (document.body.offsetHeight - elem.offsetTop - 3)   + "px";
    elem.style.maxWidth = (document.body.offsetWidth)+ "px";
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
            endTime = ( times + 1 ) > slideData.length - 1 ? +slideData[ times ].start: slideData[ times + 1 ].start,
            recurse = false;


        if( innerContainer.children.length === 0 ) {
          innerContainer.appendChild( teDiv );
          innerContainer.appendChild( spacer );
          teDiv.style.width = ( pixelsPerSecond * +slideData[ times ].start ) / ( container.offsetWidth / 100 ) + "%";
          teDiv.id = "popcorn-slideshow-div-startPadding";
          recurse = true;
        } else {
          innerContainer.appendChild( teDiv );
          innerContainer.appendChild( spacer );
          // such a gross block of code, must fix this
          if( userAgent[ userAgent.length - 1 ].split( "/" )[ 0 ] === "Firefox" ) {
            teDiv.style.width = ( pixelsPerSecond * ( endTime - +slideData[ times ].start ) ) / ( ( container.offsetWidth ) / 100 ) + "%";
          } else {
            teDiv.style.width = ( pixelsPerSecond * ( endTime - +slideData[ times ].start ) ) / ( ( container.offsetWidth - ( count ) ) / 100 ) + "%";
          }
          teDiv.id = "popcorn-slideshow-div-" + count;
        }

        teDiv.innerHTML = "<p><b></b></p>";
        teDiv.className = "popcorn-slideshow";

        spacer.className = "spacer";

       recurse && createElement( times );
      }
      
      container = $( ".mejs-time-total" )[ 0 ];
      containerWidth = container.offsetWidth;
      pixelsPerSecond = containerWidth / popcorn.duration();

      for( var i = 0, l = slideData.length; i < l; i++ ) {
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
});

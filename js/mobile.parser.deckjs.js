document.addEventListener( "DOMContentLoaded", function( event ) {

  var container,
      innerContainer = document.createElement( "span" ),
      slides,
      userAgent = navigator.userAgent.split( " " ),
      trackEvents = [],
      prevTime = 0,
      count = 0,
      pixelsPerSecond,
      containerWidth,
      popcorn = Popcorn( "#audio", { frameAnimation: true }),
      flag = false,
      eventDiv = document.getElementById( "events" );

  function createElement( times ) {
    var teDiv = document.createElement( "span" ),
        spacer = document.createElement( "span" ),
        endTime = ( times + 1 ) > trackEvents.length - 1 ? +trackEvents[ times ]: trackEvents[ times + 1 ],
        recurse = false;

 
    if( innerContainer.children.length === 0 ) {
      innerContainer.appendChild( teDiv );
      innerContainer.appendChild( spacer );
      teDiv.style.width = ( pixelsPerSecond * +trackEvents[ times ] ) / ( container.offsetWidth / 100 ) + "%";
      teDiv.id = "popcorn-slideshow-div-startPadding";
      recurse = true;
    } else {
      innerContainer.appendChild( teDiv );
      innerContainer.appendChild( spacer );
      // such a gross block of code, must fix this
      if( userAgent[ userAgent.length - 1 ].split( "/" )[ 0 ] === "Firefox" ) {
        teDiv.style.width = ( pixelsPerSecond * ( endTime - +trackEvents[ times ] ) ) / ( ( container.offsetWidth ) / 100 ) + "%";
      } else {
        teDiv.style.width = ( pixelsPerSecond * ( endTime - +trackEvents[ times ] ) ) / ( ( container.offsetWidth - ( count ) ) / 100 ) + "%";
      }
      teDiv.id = "popcorn-slideshow-div-" + count;
    }

    teDiv.innerHTML = "<p><b></b></p>";
    teDiv.className = "popcorn-slideshow";

    spacer.className = "spacer";
    
   recurse && createElement( times );
  }

  function ready() {

    if( window.playerReady && document.getElementById( "audio" ).duration >= 0 ) {

      popcorn = Popcorn( "#audio", { frameAnimation: true });
      container = $( ".mejs-time-total" )[ 0 ];
      slides = $( "[data-popcorn-slideshow]" ).each(function( key, val ) {

        var time = val.getAttribute( "data-popcorn-slideshow" );

        trackEvents.push( time );
        prevTime = time;
      });

      $( document ).bind( "deck.change", function( event, from, to ) {
        if( popcorn.currentTime() < trackEvents[ to ] || from > to ) {
          popcorn.currentTime( trackEvents[ to ] );
        }
      });

      containerWidth = container.offsetWidth;
      pixelsPerSecond = containerWidth / popcorn.duration();

      container.insertBefore( innerContainer, container.children[ 1 ] );
      container.removeChild( container.children[ 0 ] );
      innerContainer.className += " innerContainer";
      for( var i = 0, l = trackEvents.length; i < l; i++ ) {
        createElement( i );
        var end = ( i + 1 ) > trackEvents.length - 1 ? +trackEvents[ i ] + 1 : +trackEvents[ i + 1 ];
        popcorn.deckjs({
          start: trackEvents[ i ],
          end: end,
          slide: count,
          target: "popcorn-slideshow-div-" + count
        });
        count++;
      }
      var div = document.createElement( "span" );
      innerContainer.appendChild( div );

      div.style.width = ( ( container.getBoundingClientRect().right - innerContainer.children[ innerContainer.children.length - 2 ].getBoundingClientRect().right ) / container.offsetWidth ) * 100 + "%";
      div.id = "popcorn-slideshow-div-endPadding";
      div.innerHTML = "<p><b></b></p>";
      div.className = "popcorn-slideshow";
    } else {
      setTimeout( ready, 100 );
    }
  }
  ready();
}, false);

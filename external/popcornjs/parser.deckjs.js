document.addEventListener( "DOMContentLoaded", function( event ) {

  var container,
      innerContainer = document.createElement( "div" ),
      durationOfEvents = 0,
      slides,
      trackEvents = [],
      prevTime = 0,
      count = 0,
      popcorn = Popcorn( "#audio" ),
      eventDiv = document.getElementById( "events" );

  function createElement( times ) {
    var teDiv = document.createElement( "DIV" ),
        spacer = document.createElement( "DIV" );

console.log( container.offsetWidth );
    var endTime = ( times + 1 ) > trackEvents.length - 1 ? +trackEvents[ times ] + 1 : trackEvents[ times + 1 ];
    teDiv.style.width = ( ( container.offsetWidth / durationOfEvents ) * ( endTime - trackEvents[ times ] ) - 1 ) * 100 / (container.offsetWidth) + "%";
    teDiv.id = "popcorn-slideshow-div-" + count;
    teDiv.innerHTML = "<p font-size='1em' style='line-height:0px;top:0px;text-align: center;'><b></b></p>";
    teDiv.className = "popcorn-slideshow";
    spacer.className = "spacer";
    
    innerContainer.appendChild( teDiv );
    innerContainer.appendChild( spacer );
  }

  function ready(){
    if( !$( ".vjs-load-progress" )[ 0 ] ) {
      setTimeout( ready, 100 );
    } else if( $( ".vjs-load-progress" )[ 0 ].offsetWidth < 100 ) {

      setTimeout( ready, 100 );
    } else {
      container = $( ".vjs-load-progress" )[ 0 ];
      slides = $( "[popcorn-slideshow]" ).each(function( key, val ) {

        var time = val.getAttribute( "popcorn-slideshow" );
        durationOfEvents += time - prevTime;

        trackEvents.push( time );
        prevTime = time;
      });

      $( document ).bind( "keydown.deckmyextension", function(event) {
        if ( $.deck( "getOptions" ).keys.next.indexOf( event.which ) > -1 ) {
          var time = $( ".deck-next")[ 0 ] ? $( ".deck-next" )[ 0 ].getAttribute( "popcorn-slideshow" ) : $( ".deck-current" )[ 0 ].getAttribute( "popcorn-slideshow" );
          popcorn.currentTime( time );
        }
      });

      $( document ).bind( "deck.change", function( event, from, to ) {
        if( from > to ) {
          popcorn.currentTime( trackEvents[ to ] );
        }
      });

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
      container.appendChild( innerContainer );
    }
  }
  ready();
}, false);

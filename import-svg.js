jQuery( function ( $ ) {
  "use strict";
  
  /* The template is loaded from this path on init. */
  var templatePath = "template.html",
      templateDoc,
      predropMessage,
      wrapper = $( "#wrapper" );
  
  init();

  /*  Loads the template asynchronously, sets up drag-related event handlers
      and displays related messages to the user.
  */  
  function init () {
    predropMessage = $( "<p>Loading...</p>" ).appendTo( wrapper );
    
    $.ajax( templatePath ).then( function ( templateSource ) {
      templateDoc = documentFromHTML( templateSource );
      
      $( "html" ).on( {
        "dragover.waiting": anticipateDrop,
        "dragenter.waiting": anticipateDrop,
        "drop.waiting": handleDrop,
        "dragleave.waiting": unanticipateDrop,
        "dragend.waiting": unanticipateDrop,
      } );
      predropMessage.text( "Drag and drop an SVG file into this window to cgvert it!" );
    }, function () {
      predropMessage.text( "Failed to GET template from: " ).append( $( "<code />" ).text( templatePath ) );
    } );
  }

  /* Highlight target and prepare for "copy" drop event.
  */  
  function anticipateDrop ( event ) {
    if ( event.preventDefault ) event.preventDefault();
    if ( event.stopPropagation ) event.stopPropagation();
    event.originalEvent.dataTransfer.dropEffect = "copy";
    event.originalEvent.dataTransfer.dropAllowed = "copy";
    $( "html" ).addClass( "dropCandidate" );
    return false;
  }

  /* Unhighlight target.
  */
  function unanticipateDrop ( event ) {
    $( "html" ).removeClass( "dropCandidate" );
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
      predropMessage.text( "Please drop a single SVG file. You dropped " + event.originalEvent.dataTransfer.files.length + " files." );
      return false;
    }
    
    var file = event.originalEvent.dataTransfer.files[0],
        reader = new FileReader();
    
    if ( file.type != "image/svg+xml" ) {
      predropMessage.text( "Please drop an SVG file; you dropped a " + file.type + " file." );
      return false;
    }
    
    // we're no longer waiting for an SVG; remove the associated events.
    $( "html" ).off( ".waiting" );
    
    $( "<div />" ).append(
    ).appendTo( wrapper );
    
    predropMessage.text( "Reading SVG..." );
    
    reader.readAsText(file, "UTF-8" );
    reader.onloadend = function () {
      if (reader.readyState != FileReader.DONE) {
        return;
      }
      
      var svgRoot = $( "<div>" ).html( reader.result ).children( "svg" );
      
      predropMessage.remove();
      
      handleDroppedSVG(svgRoot);
    };
    
    return false;
  }
  
  /* Given the root of a loaded SVG element, proccess it and split into elements for each slide.
     Calls addSlide on each processed slide.
  */
  function handleDroppedSVG ( root ) {
    // remove all embedded fonts and references thereto
    $( "font, font-face, missing-glyph", root ).remove();
    $( "[font-family*=\" embedded\"]", root ).each( function () {
      $( this ).attr( "font-family", $( this ).attr( "font-family" ).replace(/ embedded/g, "") );
    } );
    
    var form = $( "<form />" ).append(
      $( "<section />" ).append(
        $( "<h2 />" ).text( "Audio Sources" ),
        $( "<textarea name=\"sources\" />" ).val( "media/pitch.ogg\nmedia/pitch.mp3" )
      )
    );
    
    var slideIds = $( ".Slide", root ).map( function () {
      return $( this ).attr( "id" );
    } );
    
    slideIds.each( function ( index, id ) {
      var slide = root.clone();
      $( ".Slide", slide ).each( function () {
        if ( $( this ).attr( "id" ) !== id ) {
          $( this ).remove();
        } else {
          $( this ).attr( "visibility", "visible" );
        }
      } );
      $( "[visible=hidden] ", this ).remove()
      
      addSlide( slide, form );
    });
    
    form.append(
      $( "<div class=\"buttonBumper\"><input type=\"submit\" value=\"Convert\" class=\"majorAction\" /></div>" )
    );
    
    form.appendTo( wrapper );
    form.on( "submit", produceConverted );
  }
  
  /* Adds */
  function addSlide ( root, form ) {
    var pannel = $( "<section class='slide' />" );
    pannel.append( root );
    
    pannel.append( "<h3>Transcript</h3>" );
    pannel.append( $( "<textarea></textarea>" ));
    
    pannel.append( "<h3>Duration</h3>" );
    pannel.append( $( "<input value=\"3\" /> seconds" ));
    
    pannel.append( $( "<br>" ).css( "clear", "both" ) );
    pannel.appendTo( form );
    
  }

  /* Reads this form's contents, generates the Side Drive presentation and redirects the user to it.
  */
  function produceConverted () {
    var audioSources = $( "textarea[name=sources]"  ).val().split( /\n/g ),
        slides = $( "section.slide", this ).map( function () {
          return {
            element: $( "svg", this )[0],
            transcript: $( "textarea", this ).val(),
            duration: +$( "input", this ).val(),
          }
        } ),
        doc = makeDocument( audioSources, slides ),
        source = documentToHTML( doc );
    
    $( "body" ).empty().append( $("<textarea />").val(source).css({ width: "100%", height: "20em" }) );
    
    return false;
  }

  /* Produces a Slide Drive document given an array of audio source paths and an
     array of {duration, element, transcriptSource} */
  function makeDocument ( audioSources, slides ) {
    var doc = templateDoc; // we don't need more than one; this should really be cloned.
    
    // remove existing audio sources from template, add our own.
    var audioElement = doc.querySelector("audio");
    
    for ( var i = 0; i < audioElement.childNodes.length; i++ ) {
      audioElement.removeChild( audioElement.childNodes[ i ] );
    }
    
    for ( var i = 0; i < audioSources.length; i++ ) {
      var newSource = doc.createElement( "source" );
      newSource.setAttribute( "src", audioSources[ i ] );
      audioElement.appendChild( newSource );
    }
    
    // clear the template of existing slides
    var templateSlides = doc.querySelectorAll( ".slide" );
    for ( var i = 0; i < templateSlides.length; i++ ) {
      templateSlides[ i ].parentNode.removeChild( templateSlides[ i ] );
    }
    
    var slideContainer = doc.querySelector( ".deck-container" ),
        cumulativeDuration = 0;
    for ( var i = 0; i < slides.length; i++ ) {
      var newSlide = doc.createElement( "section" ),
          newTranscript = doc.createElement( "div" );
      newSlide.setAttribute( "popcorn-slideshow", String(cumulativeDuration) );    
      newSlide.setAttribute( "class", "slide" );
      newSlide.appendChild( slides[ i ].element );
      newTranscript.innerHTML = slides[ i ].transcriptSource;
      cumulativeDuration += slides[ i ].duration;
      slideContainer.appendChild( newSlide );
    }
    
    return doc;
  }
  
   /* Returns an HTML document of the given source code.
  */
  function documentFromHTML ( html ) {
    var doc = document.implementation.createHTMLDocument( "" );
    doc.documentElement.innerHTML = html;
    return doc;
  }
  
  /* Returns HTML source for the given document, using Modernizr's header.
  */
  function documentToHTML ( doc ) {
    var parts = [
      "<!DOCTYPE " + doc.doctype.name
      + (doc.doctype.publicId ? ' PUBLIC "' + doc.doctype.publicId + '"' : '')
      + (!doc.doctype.publicId && doc.doctype.systemId ? ' SYSTEM' : '') 
      + (doc.doctype.systemId ? ' "' + doc.doctype.systemId + '"' : '')
      + '>',
      "<!--[if lt IE 7]> <html class=\"no-js ie6\" lang=\"en\"> <![endif]-->",
      "<!--[if IE 7]>    <html class=\"no-js ie7\" lang=\"en\"> <![endif]-->",
      "<!--[if IE 8]>    <html class=\"no-js ie8\" lang=\"en\"> <![endif]-->\n",
      "<!--[if gt IE 8]><!-->  <html class=\"no-js\" lang=\"en\"> <!--<![endif]-->\n",
       doc.documentElement.innerHTML,
       "</html>"];
    
    return parts.join("\n");
  }
} );

/*
  Adds partial support for embedded fonts in SVG documents where neccessary.
  http://www.w3.org/TR/SVG/fonts.html
  http://www.w3.org/TR/SVG/text.html
  
  http://code.google.com/p/svgweb/
  
  What a way to be side-tracked.-
*/

var SVGFontManager = function() {
  var _defsDoc = document.createElement( "svg" ),
      _defs = document.createElement( "defs" ),
      _faces = {};
  
  _defsDoc.setAttribute( "class", "SVGFontManager-definitions" );
  _defsDoc.style.display = "none";
  _defsDoc.appendChild( _defs );
  document.body.appendChild( _defsDoc );
  
  
};

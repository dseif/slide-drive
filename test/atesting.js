/* atest.js

  atest( [name,] body( [assert, pass, toCleanUp] ) );
    Declares an test with the specifed name and body. It will be
    run syncronously with other tests defined syncronously with it.

  Returns an ATest instance.

  A test body can return true to pass, false to fail or a function
  to continue to it asyncronously. This happens with a delay, so it
  can be used to poll some state.

  If you nest test definitions:
  - if the parent test is passed/failed it will cause all incomplete
    child tests to immidiately be passed/failed.
  - after all child tests are complete the parent test will pass if
    they all passed, otherwise it will fail.

  The purpose is to allow you to avoid running all child tests if
  some parent set-up has failed, but generally not need to manually
  pass/fail the parent test.

*/

(function ( root ) {
  "use strict";
  
  root.atest = atest;

  var TEST_TIMEOUT = 60000,
      TICK_INTERVAL = 100;

  var activeParent = null;

  function atest () {
    var parent;

    if ( activeParent ) {
      parent = activeParent;
    } else {
      parent = new ATest( function () {}, "<test root>" );
      setTimeout( parent.requested.resolve, 0 );
    }
    
    var name,
    body;

    if ( typeof arguments[ 0 ] === "string" ) {
      name = arguments[ 0 ];
      body = arguments[ 1 ];
    } else {
      name = null;
      body = arguments[ 0 ];
    }
    
    var test = new ATest( body, name );
    parent.addChild( test );
    
    return test;
  }

  function ATest ( body, name ) {
    this.body = body;
    this.name = name || "<test>";
    this.children = [],
    this.requested = new jQuery.Deferred,
    this.result = new jQuery.Deferred,
    this.report = document.createElement( "li" );
    
    var test = this;

    var ownReport = document.createElement( "div" ),
        childReports = document.createElement( "ul" );
    
    ownReport.className = "label";
    ownReport.textContent = "[––––] " + test.name;
    test.report.appendChild( ownReport );

    test.addChild = function ( childTest ) {
      if ( test.children.length === 0 ) {
        test.report.appendChild( childReports );
        
        // The first child test will be triggered when the parent is triggered.
        test.requested.then( childTest.requested.resolve );
      } else {
        // Subsquent child tests will be triggered when the previous one is complete.
        test.children[ test.children.length - 1 ].result.always( childTest.requested.resolve );
      }
      
      childReports.appendChild( childTest.report );
      test.children.push( childTest );
    };

    test.result.then(function () {
      test.report.className = "pass";
      ownReport.textContent = "[pass] " + test.name;
      var ownMessage = document.createElement( "div" );
      ownMessage.textContent = [].slice.call( arguments ).join( " - ");
      test.report.appendChild( ownMessage );
    }, function () {
      test.report.className = "fail";
      ownReport.textContent = "[FAIL] " + test.name;
      var ownMessage = document.createElement( "div" );
      ownMessage.textContent = [].slice.call( arguments ).join( " - ");
      test.report.appendChild( ownMessage );
    })
    
    function assert ( condition, msg ) {
      if ( !condition ) {
        var failArgs = [ "Assertion failed" ].concat( [].slice.call( arguments, 1 ) );
        test.result.reject.apply( test.result, failArgs ) ;
      }
    }
    
    test.requested.then(function() {
      var tickInterval = setInterval( tick, TICK_INTERVAL ),
          timeoutTimeout = setTimeout( test.result.reject, TEST_TIMEOUT, "Timeout (" + TEST_TIMEOUT + "ms)" ),
          active = test.body;
      
      function tick () {
        if ( test.result.state() === "pending" && typeof active === "function" ) {
          var previouslyActive = activeParent;
              activeParent = test;

          try {
            active = active.call( test, assert, test.result.resolve, test.result.always );
          } catch ( ex ) {
            test.result.reject( "Uncaught exception", ex );
            console.error( ex.stack );
          }

          activeParent = previouslyActive;
          
         if ( active === true ) {
            test.result.resolve();
          } else if ( active === false ) {
            test.result.reject();
          }
        } else {
          if ( test.children.length > 0 ) {
            test.children[ test.children.length - 1 ].result.always(function () {
              for ( var i = 0; i < test.children.length; ++i ) {
                if ( test.children[ i ].result.state() === "rejected" ) {
                  test.result.reject();
                  break;
                }
              }
              test.result.resolve();
            });
          }
          
          clearInterval( tickInterval );
        }
      }
    });
  }
})( this );

/* atest.js

  atest( [name,], [timeout,] body( [toCleanUp] ) );
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
  root.ATest = ATest;

  var TEST_TIMEOUT_S =    20,
      TICK_INTERVAL_MS = 100;

  var activeParent = null;

  function atest () {
    var parent;

    if ( activeParent ) {
      parent = activeParent;
    } else {
      parent = new ATest( function () {}, "<test root>", Infinity, 1 );
      setTimeout( parent.requested.resolve, 0 );
    }
    
    var args = [].slice.call( arguments );
    
    var name = ( typeof args[ 0 ] === "string" ) ? args.shift() : "<test>",
        timeout_s = ( typeof args[ 0 ] === "number" ) ? args.shift() : TEST_TIMEOUT_S,
        body = args.shift();
    
    var test = new ATest( body, name, timeout_s );
    parent.addChild( test );
    
    return test;
  }

  function ATest ( body, name, timeout_s ) {
    this.body = body;
    this.name = name || "<test>";
    this.children = [];
    this.requested = new jQuery.Deferred;
    this.result = new jQuery.Deferred;
    this.childrenCompleted = new jQuery.Deferred;
    this.completed = new jQuery.Deferred;
    this.outstandingChildCount = 0;
    this.report = document.createElement( "li" );
    
    var test = this,
        timeout = timeout_s * 1000;
    
    test.childrenCompleted.then( test.completed.resolve );

    var ownLabel = document.createElement( "div" ),
        childReports = document.createElement( "ul" );
    
    ownLabel.className = "label";
    
    ownLabel.textContent = "[pending] " + test.name;
    test.report.className = "pending";
    
    test.report.appendChild( ownLabel );

    test.addChild = function ( childTest ) {
      if ( test.children.length === 0 ) {
        test.report.appendChild( childReports );
        
        // The first child test will be triggered when the parent is triggered.
        test.requested.then( childTest.requested.resolve );
      } else {
        // Subsquent child tests will be triggered when the previous one is complete.
        test.children[ test.children.length - 1 ].completed.always( childTest.requested.resolve );
      }
      
      childReports.appendChild( childTest.report );
      test.children.push( childTest );
      
      test.outstandingChildCount++;
      childTest.completed.then(function () {
        test.outstandingChildCount--;
        
        if (test.outstandingChildCount === 0) {
          test.childrenCompleted.resolve();
        }
      })
      
      childTest.result.fail( function () { test.result.reject(); } );
    };

    test.result.then(function () {
      test.report.className = "pass";
      ownLabel.textContent = "[pass] " + test.name;
      var ownMessage = document.createElement( "div" );
      ownMessage.textContent = [].slice.call( arguments ).join( " - ");
      test.report.appendChild( ownMessage );
    }, function () {
      test.report.className = "fail";
      ownLabel.textContent = "[FAIL] " + test.name;
      var ownMessage = document.createElement( "div" );
      ownMessage.textContent = [].slice.call( arguments ).join( " - ");
      test.report.appendChild( ownMessage );
    })
    
    test.requested.then(function() {
      if ( test.result.state() !== "pending" ) {
        return;
      }
      
      ownLabel.textContent = "[running] " + test.name;
      test.report.className = "running";
      
      var tickInterval = setInterval( tick, TICK_INTERVAL_MS ),
          timeoutTimeout = setTimeout( test.result.reject, timeout, "Timeout (" + timeout + "ms)" ),
          active = test.body;
      
      if ( timeout === Infinity ) {
        clearTimeout( timeoutTimeout );
      }
      
      if ( body === true ) {
        test.result.resolve();
      } else if ( body === false ) {
        test.result.reject();
      }
      
      function tick () {
        if ( test.result.state() === "pending" && typeof active === "function" ) {
          var previouslyActive = activeParent;
              activeParent = test;

          try {
            active = active.call( test, test.result.always );
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
          if ( test.children.length === 0 ) {
            test.completed.resolve();
          } else {
            test.childrenCompleted.then( test.result.resolve );
          }
          
          clearInterval( tickInterval );
        }
      }
    });
  }
})( this );

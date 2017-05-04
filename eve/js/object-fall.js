(function ( $ ) {
 
    $.fn.objectFall = function( options ) {
 
        // Sky Fall Options
        var settings = $.extend({
            // These are the defaults.
           kinds           : 5,   // the number of kinds of objects
           speed           : 1,   // here you can define speed of objects 
           minSpeed        : 3,   // the minimum speed of the objects
           numberOfObjects : 50,  // define number of objects
           size            : 60,  // general size of objects, final size is calculated randomly (with this number as general parameter)
           minSize         : 40,  // the minimum size
           varySize        : 1,   // 1 if you want random sizes
           fps             : 10,  // refresh speed low number = faster speed
           xStrafeMod      : 5,   // modify the intensity of the strafing bigger = straighter, < 0 to get wild
           rotation        : 1,   // intensity of rotation
           varyRotation    : 0,   // turn on rotation
           varySpin        : 0,   //turn on spinning
           wind            : 0,   //make it windy
           maxCount        : 'none',   // when we should stop the objects recycling use 'none' to forever loop
        }, options );

 
    };
 
}( jQuery ));
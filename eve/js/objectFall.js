(function ( $ ) {
 
    $.fn.objectFall = function( options ) {
		
		// Sky Fall Options
        var settings = $.extend({
			// These are the defaults.
			classes			: ['male-corpse', 'female-corpse'],
			speed           : 1,   // here you can define speed of objects 
			minSpeed        : 3,   // the minimum speed of the objects
			numberOfObjects : 15,  // define number of objects
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
		
		//helper variables
        var Ypos      = [];
        var Xpos      = [];
        var Speed     = [];
        var startYPos = [];
        var CStrafe   = [];
        var Strafe    = [];
        var height    = [];
        var width     = [];
        var opacity   = [];
        var rotation  = [];
        var writter   = '';
        var count     = 0;   // start the clock at zero

        //width and height of browser window
        var WinWidth  = $(window).width();
        var WinHeight = $(window).height();

        //avoid divide by zero
        if ( settings.xStrafeMod === 0 ) {
			settings.xStrafeMod = 1000;
        }
		
         function fallingObjects(){
            for (i = 0 ; i < settings.numberOfObjects; i++)
            {
				//defining motion
                strafey = Speed[i] * Math.sin(90 * Math.PI / 180);
                strafex = (( Speed[i] * Math.cos(CStrafe[i]) ) / settings.xStrafeMod) + settings.wind;

                //defining rotaion
                if ( settings.varyRotation || settings.varySpin ) {
					rotation[i] += settings.rotation - Speed[i]/2;
                }

                Ypos[i] += strafey;
                Xpos[i] += strafex;

                //setting opacity
                if (Ypos[i] < 0){
                    opacity[i] = 1;
                    $(".Objects" + i).css({opacity:opacity[i]});
                }

                //Objects slowly disappearing at the end of browser window
                /*if (Ypos[i] > WinHeight - height[i] * 4){
                    opacity[i] -= 0.05;
                    $(".Objects" + i).css({opacity:opacity[i]});
                }*/

                //decide if the show should go on
                if ( settings.maxCount == 'none' || count < settings.maxCount ) {
                    //when Objects reach certain browser height they are transported back to the begining
                    if (Ypos[i] > WinHeight - (width[i] + height[i] / 2)){
                        
                        Ypos[i]  =- 50;
                        Xpos[i]  = (Math.round(Math.random() * (WinWidth) - width[i] * 3)) + 120;
                        Speed[i]  = Math.random() * settings.speed + settings.minSpeed;
                    }
                }
                //move objects
                $(".Objects" + i).css({top: Ypos[i], left: Xpos[i]});
				
                //rotate objects
                if ( settings.varyRotation && $.transit !== undefined ) {
					$(".Objects"+i).transition({perspective: width[i], rotateX: rotation[i]/100, rotateY: rotation[i], queue: false});
                }
                if ( settings.varySpin && $.transit !== undefined ) {
					$(".Objects"+i).transition({ rotate: rotation[i], queue: false});
                }
                CStrafe[i] += Strafe[i];
            }
            count ++;
            if ( $('div[class^="Objects"]').filter(function() { return $(this).css('opacity') !== '0'; }).length ) { //stop moving when all Objects are at opacity 0
                setTimeout(fallingObjects, settings.fps); //function time out - fps of leaves
            }
        }

        for (i = 0 ; i < settings.numberOfObjects; i++){
            var randomClass = settings.classes[Math.floor(Math.random()*settings.classes.length)]; //which circle is going to be used
            
            if (settings.varySize) {
                width[i] = Math.round(Math.random() * settings.size + settings.minSize); //random width according to chosen parameter
            } else { 
				width[i] = settings.size; 
			}
			
            height[i] = width[i]; //make things square

            Speed[i]  = Math.random() * settings.speed + settings.minSpeed; //randomization of speed of objects

            Ypos[i] = -Math.random() * 500 - 40; //randomization of starting y position of Objects
            Xpos[i] = (Math.round(Math.random() * (WinWidth) - width[i] * 3)) + 120; //randomization of x position of Objects
			
            if ( settings.varyRotation || settings.varySpin ) {
				rotation[i] = Math.round(Math.random()) * settings.rotation - Speed[i]/2; //randomization of rotation
            }
			
            writter += '<div class="Objects' + [i] + ' ' + randomClass + '" style="position:absolute;top:'+Ypos[i]+'px;left:'+Xpos[i]+'px;height:'+height[i]+'px;width:'+width[i]+'px;"></div>';
        }

        this.append( writter );
        fallingObjects();

    };
 
}( jQuery ));
$(document).ready(function() { 

	// ==========
	// COMPONENTS
	// ==========

	var canvas = $("#gameCanvas");
	var context = canvas.get(0).getContext("2d");

	// Canvas dimensions 
	var canvasWidth = canvas.width(); 
	var canvasHeight = canvas.height();

	// Game settings 
	var playGame;
	var isPaused;
	var updateTimer;
    var currentSpeed = 100;
    var specialFoodCounter;
    var foodMultiple = 250;
    var isSpecialFood;

	// game components
	var gameGrid;
	var currentSpeed;
    var score;

	// CONTROLS
	var arrowUp = 38; 
	var arrowRight = 39; 
	var arrowDown = 40;
	var arrowLeft = 37;
	var pauseKey = 80;
	
	// GAME USER INTERFACE
	var ui = $("#gameUI"); 
	var uiIntro = $("#gameIntro"); 
	var uiStats = $("#gameStats"); 
	var uiComplete = $("#gameComplete"); 
	var uiPlay = $("#gamePlay"); 
	var uiPaused = $("#gamePause");
	var uiReset = $(".gameReset");
	var uiResume = $(".resume");
	var uiScore = $(".gameScore");
	var uiLevel = $(".level");

	// Game Graphics components
	var gridHeight = 40; // blocks
	var gridWidth = 40; // blocks
	var blockWidth = 10; // pixels
	var blockSpacing = 2; // pixels
    // game zone boundaries
	var containerLeft;
	var containerTop;
	var containerBottom;
	var containerRight;

    var coordinates = function( newX, newY ) {
        this.x = newX;
        this.y = newY;
        this.colour = "#00F0F0"; // default snake colour
    }

    var currentFood, timedFood;
    var food = function() {
        // random location
        this.location = new coordinates( Math.floor( Math.random()*gridWidth ), Math.floor( Math.random()*gridHeight ));
        // should check to make sure these coordinates don't overlap with anything
        this.location.colour = "rgb(255, 255, 50)"; // should find hex number for this

    }
    
    var snake = function() {
        // default/initial location coordinates set here
        this.head = new coordinates( 12, 9 );
        this.currentDirection = arrowRight;
        
        // body
        this.body = new Array( new coordinates( 11, 9  ), new coordinates( 10, 9 ), new coordinates( 9, 9 ), new coordinates( 8, 9 ));
    }
    var currentTail;

	// =========
	// MECHANICS
	// =========

	// Inititialize the game environment 
	function init() {		uiStats.hide(); 
		uiComplete.hide();
		uiPaused.hide();
        
        // calculating the game zone coords
		containerLeft = ( canvasWidth / 2 ) - ( gridWidth * ( blockWidth + blockSpacing )/2);
		containerTop = ( canvasHeight / 2 ) - ( gridHeight * ( blockWidth + blockSpacing )/2);
		containerBottom = ( canvasHeight / 2 ) + ( gridHeight * ( blockWidth + blockSpacing )/2);
		containerRight = ( canvasWidth / 2 ) + ( gridWidth * ( blockWidth + blockSpacing )/2);

		uiPlay.click(function(e) { 
			e.preventDefault();			uiIntro.hide(); 
			startGame();		});

		uiReset.click(function(e) { 
			e.preventDefault();
			uiComplete.hide(); 
			$(window).unbind("keyup"); 
			$(window).unbind("keydown");
			startGame();		});
		uiResume.click( function(e) { 
			e.preventDefault();
			pause(); 
		});

	};

	// Reset and start the game 
	function startGame() {
		// Set up initial game settings 
		playGame = true;
		isPaused = false;        
		clearTimeout( updateTimer ); // if this is a reset, stop the current update running

		// Reset game stats
        score = 0;
		uiScore.html( score ); 
		uiStats.show();
                
        // setup initial game components
        thisSnake = new snake()
        currentFood = new food();
        // setup timed food -- could maybe make it update itself
        isSpecialFood = false;
        specialFoodCounter = 1;

        // key events: directions
		$(window).keydown(function(e) { 
			var keyCode = e.keyCode;			if ( playGame == true ) { 
                // Change direction
				if( keyCode == arrowRight && thisSnake.currentDirection != arrowLeft ) { 
					thisSnake.currentDirection = arrowRight;				} else if( keyCode == arrowLeft && thisSnake.currentDirection != arrowRight ) { 
					thisSnake.currentDirection = arrowLeft;				} else if( keyCode == arrowUp && thisSnake.currentDirection != arrowDown ) { 
					thisSnake.currentDirection = arrowUp;				} else if( keyCode == arrowDown && thisSnake.currentDirection != arrowUp ) { 
                    thisSnake.currentDirection = arrowDown;				};
			};
			if( keyCode == pauseKey ) {
				pause();
			};
		}); 

        animate();
        update();
	};

        
    // MOVE SNAKE AND CHECK FOR COLLISION WITH ITSELF
	function update() {
		if( playGame ) {
            // log tail
            currentTail = new coordinates( thisSnake.body[ thisSnake.body.length - 1 ].x, thisSnake.body[ thisSnake.body.length - 1 ].y );
            currentTail.colour = thisSnake.body[ thisSnake.body.length - 1 ].colour;            
            
            // shift body up one space up until the head
            for( var i = thisSnake.body.length - 1; i>0; i-- ) {
                thisSnake.body[ i ] = thisSnake.body[ i-1 ];
            }
            
            // add the current head to the body
            thisSnake.body[ 0 ] = new coordinates( thisSnake.head.x, thisSnake.head.y );
            thisSnake.body[ 0 ].colour = thisSnake.head.colour;

            // move head
            switch( thisSnake.currentDirection ){
                case arrowRight:
                    thisSnake.head.x = thisSnake.head.x + 1;
                    break;
                case arrowLeft:
                    thisSnake.head.x = thisSnake.head.x - 1;
                    break;
                case arrowUp:
                    thisSnake.head.y = thisSnake.head.y - 1;
                    break;
                case arrowDown:
                    thisSnake.head.y = thisSnake.head.y + 1;
                    break;
            }
            // wrap
            if( thisSnake.head.x >= gridWidth ) {
                thisSnake.head.x = 0;
            } else if( thisSnake.head.x < 0 ) {
                thisSnake.head.x = gridWidth - 1;
            } else if( thisSnake.head.y >= gridHeight ) {
                thisSnake.head.y = 0;
            } else if( thisSnake.head.y < 0 ) {
                thisSnake.head.y = gridHeight - 1;
            }

            // has snake eaten food?
            if( hasEaten( currentFood )) {
                currentFood = new food();
            } else if( isSpecialFood && hasEaten( timedFood )) {
                score += 50; // add a bonus
                isSpecialFood = false;
            } else {
                thisSnake.head.colour = "#00F0F0";
            }
            if( isSpecialFood ) {
                timedFood.time -= currentSpeed;
                if( timedFood.time <= 0 ) {
                    isSpecialFood = false;
                }
            }

            if( score > ( specialFoodCounter * foodMultiple ) && !isSpecialFood ) {
                newSpecialFood();
                specialFoodCounter ++;
            }
            
            // game over
            if( hasCollidedWithBody( thisSnake.head )) {
                playGame = false;
				uiStats.hide(); 
				uiComplete.show();

				$(window).unbind("keyup"); 
				$(window).unbind("keydown");

				clearTimeout( updateTimer );
				return true;
            }
        }

        updateTimer = setTimeout( update, currentSpeed );

	}

	function pause() {
		if( isPaused ) {
			uiPaused.hide();
			isPaused = false;
			playGame = true;

		} else {
			uiPaused.show();
			isPaused = true;
			playGame = false;
		}
	}
    
    function newSpecialFood() {
        isSpecialFood = true; // so it can be painted
        timedFood = new food();
        timedFood.location.colour = "rgb(50, 255, 50)";
        timedFood.time = 5000; // to be in initial config in declarations        
    }

	// ==================
	// COLISION DETECTION
	// ==================
    
    function hasCollidedWithBody( object ) {
        for( var i = 0; i<thisSnake.body.length; i++ ) {
            if( thisSnake.body[ i ].x == object.x && thisSnake.body[ i ].y == object.y ) {
                return true;
            }
        }
        return false;
    }
    
    function hasEaten( food ) {
        if( thisSnake.head.x == food.location.x && thisSnake.head.y == food.location.y ) {
            thisSnake.body.push( currentTail );
            thisSnake.head.colour = "rgb(255, 0, 0)";
            score += 50;
            return true;
        }
        return false;
    }


	// =====
	// PAINT
	// =====

	function animate() {		// Clear 
		context.clearRect(0, 0, canvasWidth, canvasHeight);


		// draw container
		context.lineWidth = 5;
		context.strokeStyle = "rgb( 255, 155, 155 )";
		context.beginPath();
		context.moveTo( containerLeft - 5, containerTop - 5 ); 
		context.lineTo( containerLeft - 5, containerBottom + 5 );
		context.lineTo( containerRight + 5, containerBottom + 5 );
		context.lineTo( containerRight + 5, containerTop - 5 );
		context.lineTo( containerLeft - 5, containerTop - 5 );
		context.stroke();

		// local variables
		var xPos;
		var yPos;

		// grid background
		context.fillStyle = "rgb(0, 0, 50)";
		for( var i = 0; i< gridWidth; i++ ) {
			for( var j = 0; j<gridHeight; j++ ) {
				xPos = containerLeft + 2 + ( i *( blockWidth + blockSpacing ));
				yPos = containerTop + 2 + ( j *( blockWidth + blockSpacing ));
				context.fillRect( xPos, yPos, blockWidth, blockWidth );
			}
		}

		// draw current snake
        context.fillStyle = thisSnake.head.colour;
        xPos = containerLeft + 2 + ( thisSnake.head.x *( blockWidth + blockSpacing ) );
        yPos = containerTop + 2 + ( thisSnake.head.y *( blockWidth + blockSpacing ) );
        context.fillRect( xPos, yPos, blockWidth, blockWidth );
        
        // body

		for(var i = 0; i< thisSnake.body.length; i++ ) {
            context.fillStyle = thisSnake.body[ i ].colour;
			xPos = containerLeft + 2 + ( thisSnake.body[ i ].x *( blockWidth + blockSpacing ) );
			yPos = containerTop + 2 + ( thisSnake.body[ i ].y *( blockWidth + blockSpacing ) );
			context.fillRect( xPos, yPos, blockWidth, blockWidth );
		}
        
        // draw food
        context.fillStyle = currentFood.location.colour;
        xPos = containerLeft + 2 + ( currentFood.location.x *( blockWidth + blockSpacing ));
        yPos = containerTop + 2 + ( currentFood.location.y *( blockWidth + blockSpacing ));
        context.fillRect( xPos, yPos, blockWidth, blockWidth );  
        if( isSpecialFood ) {      
            context.fillStyle = timedFood.location.colour;
            xPos = containerLeft + 2 + ( timedFood.location.x *( blockWidth + blockSpacing ));
            yPos = containerTop + 2 + ( timedFood.location.y *( blockWidth + blockSpacing ));
            context.fillRect( xPos, yPos, blockWidth, blockWidth );  
        }
        
		uiScore.html( score );

		// Run the animation loop again in 33 milliseconds
		setTimeout(animate, 33);
	}; 

	// ======
	// END OF
	// ======

	init();
});
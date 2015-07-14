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
	var level;
	var updateTimer;
	var score; 

	// game components
	var gameGrid;
	var currentPiece;
	var currentSpeed;

	// CONTROLS
	var arrowUp = 38; 
	var arrowRight = 39; 
	var arrowDown = 40;
	var arrowLeft = 37;
	var pauseKey = 80;
	var space = 32;
	var softDrop = false;
	
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
	var gridHeight = 20; // blocks
	var gridWidth = 10; // blocks
	var blockWidth = 20; // pixels
	var blockSpacing = 4; // pixels
	var containerLeft;
	var containerTop;
	var containerBottom;
	var containerRight;

	var block = function( x, y, colour ) {
		this.x = x;
		this.y = y;
		this.colour = colour;
	};

	var playerPiece = function( x, y, colour, newShape ) {
		this.x = x;
		this.y = y;
		this.colour = colour;		
		this.shapeMatrix = newShape;		
	}

	// =========
	// MECHANICS
	// =========

	// Inititialize the game environment 
	function init() {		uiStats.hide(); 
		uiComplete.hide();
		uiPaused.hide();

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
		playGame = false;
		isPaused = false;
		score = 0;
		level = 1;
		currentSpeed = 1000;
		gameGrid = new Array();
		clearTimeout( updateTimer ); // if this is a reset, stop the current update running

		// Reset game stats 
		uiScore.html( score ); 
		uiLevel.html( level );
		uiStats.show();

		// calculating the game zone coords
		containerLeft = ( canvasWidth / 2 ) - ( gridWidth * ( blockWidth + blockSpacing )/2);
		containerTop = ( canvasHeight / 2 ) - ( gridHeight * ( blockWidth + blockSpacing )/2);
		containerBottom = ( canvasHeight / 2 ) + ( gridHeight * ( blockWidth + blockSpacing )/2);
		containerRight = ( canvasWidth / 2 ) + ( gridWidth * ( blockWidth + blockSpacing )/2);

		// the current block - tetrominoe
		newPiece();

		$(window).keydown(function(e) { 
			var keyCode = e.keyCode;			if ( playGame == false ) { 
				playGame = true;			} else { 
				if( keyCode == arrowRight ) { 
					currentPiece.moveRight(); 				};
				if( keyCode == arrowLeft ) { 
					currentPiece.moveLeft(); 				};
				if( keyCode == arrowUp ) { 
					currentPiece.rotate(); 				};
				if( keyCode == arrowDown ) { 
					softDrop = true; 				};
				if( keyCode == space ) { 
					hardDrop(); 				};
			};
			if( keyCode == pauseKey ) {
				pause();
			};
		}); 

		$(window).keyup(function(e) { 
			var keyCode = e.keyCode;
			if( keyCode == arrowDown ) { 
				softDrop = false;			};		});

		// Start loops
        update();
		animate();
        

	};

	function newPiece() {

		// new values
		var newShapeMatrix;
		var newColour;
		var newX;

		var random = Math.floor(Math.random()*7);
		switch( random ) {
			case 0:
				newShapeMatrix = new Array( 0, 0, 0, -1, 0, 1, 0, 2 ); // -- Ii --
				newColour = "#00F0F0";
				break;
			case 1:
				newShapeMatrix = new Array( 0, 0, -1, 0, 1, 0, 1, 1 ); // -- Jj --
				newColour = "#F0A000";
				break;
			case 2:
				newShapeMatrix = new Array( 0, 0, -1, 0, -1, 1, 1, 0 ); // -- Ll --
				newColour = "#0000F0";
				break;
			case 3:
				newShapeMatrix = new Array( 0, 0, 0, 1, 1, 0, 1, 1 ); // -- Oo --
				newColour = "#F0F000";
				break;
			case 4:
				newShapeMatrix = new Array( 0, 0, 1, 0, 0, 1, -1, 1 ); // -- Ss --
				newColour = "#00F000";
				break;
			case 5:
				newShapeMatrix = new Array( 0, 0, -1, 0, 0, -1, 1, 0 ); // -- Tt --
				newColour = "#A000F0";
				break;
			case 6:
				newShapeMatrix = new Array( 0, 0, -1, 0, 0, 1, 1, 1 ); // -- Zz --
				newColour = "#F00000";
				break;
		}

		// set new starting position
		random = Math.floor(Math.random()*8);
		newX = 1 + random;
		currentPiece = new playerPiece( newX, 1, newColour, newShapeMatrix );

		// need to set Y value so it doesn't overlap the top

	}

	// move game pieces around accordingly
	function update() {

		if( playGame ) {		
			currentPiece.y ++;
			
			if( hasLandedOnBottom( currentPiece ) || hasCollidedWithBlocks( currentPiece )) {
				currentPiece.y--; // shift back up

				// dump all blocks into gameGrid
				for( var j = 0; j<currentPiece.shapeMatrix.length; j++ ) {
					gameGrid.push( new block( currentPiece.x + currentPiece.shapeMatrix[ j ], currentPiece.y + currentPiece.shapeMatrix[ j+1 ], currentPiece.colour ));
					j++; // already done the y value
				}
				isGameOver()
				checkForFullRows();
				newPiece();
			};
		};

		if( softDrop ) {
			updateTimer = setTimeout( update, 100 );
		} else {
			updateTimer = setTimeout( update, currentSpeed );
		}
	}

	function checkForFullRows () {
		var hasFound = false;
		var foundLines = new Array();	

		//start from bottom row
		for( var r = gridHeight - 1; r>0; r-- ) {
			var row = 0;
			
			// check each block currently in grid
			for( var i = 0; i<gameGrid.length; i++ ) {
				if( gameGrid[ i ].y == r ){
					row++
				}
			}

			// if there are 10 in this row
			if( row == gridWidth ){
				hasFound = true;
				foundLines.push( r );
				score++;
                
                // if 10 lines have been done then increment level
                // once we have multiple lines this will need to be changed
				if( score % 10 == 0 ) {
					nextLevel();
				}
				for( var i = 0; i<gameGrid.length; i++ ) {
					if( gameGrid[ i ].y == r ){
						gameGrid[ i ].colour = "rgb( 255, 255, 255 )";
					}
				}
			}
		}
		if( hasFound ) {
			playGame = false;
			
			// wait a bit before removing lines and starting again
			setTimeout(function(){ removeLine( foundLines )}, 300);
		}
	}

	// separate this function out to enable us to create a 'pause'
    // this is due to the lack of timing functions in javascript
	function removeLine( linesToRemove ) {
		for( var r = linesToRemove.length-1; r >= 0; r--  ) {
			for( var i = 0; i<gameGrid.length; i++ ) {
				if( gameGrid[ i ].y == linesToRemove[ r ] ){
					gameGrid.splice( i, 1 );
					i--; // need to step back because splice removes an element
				} else if( gameGrid[ i ].y < linesToRemove[ r ] ) { 
					gameGrid[ i ].y++; // move the rest down
				}
			}
		}
		playGame = true;
	}

	function nextLevel() {
		if( level < 10 ) {
			currentSpeed = 1000 - ( level * 100 );
		}
		level++;
	}

	function isGameOver() {
		for( var i = 0; i<gameGrid.length; i++ ) {
			if( gameGrid[ i ].y < 3 ) {
				playGame = false;
				uiStats.hide(); 
				uiComplete.show();

				$(window).unbind("keyup"); 
				$(window).unbind("keydown");

				clearTimeout( updateTimer );
				return true;
			}
		}
		return false;
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

	// =================
	// CONTROL MECHANICS
	// =================

	playerPiece.prototype.moveRight = function () {
		currentPiece.x++;
		if( hasCollidedWithWalls( currentPiece ) || hasCollidedWithBlocks( currentPiece )) {
			currentPiece.x--;
		}
	}
	playerPiece.prototype.moveLeft = function () {
		currentPiece.x--;
		if( hasCollidedWithWalls( currentPiece ) || hasCollidedWithBlocks( currentPiece )) {
			currentPiece.x++;
		}
	}

	playerPiece.prototype.rotate = function () {
		var currentShapeMatrix = currentPiece.shapeMatrix.slice(0);
		for( var i = 0; i<currentPiece.shapeMatrix.length; i++ ) {
			var accumulator = currentPiece.shapeMatrix[ i ];
			currentPiece.shapeMatrix[ i ] = currentPiece.shapeMatrix[ i+1 ];
			currentPiece.shapeMatrix[ i+1 ] = accumulator * -1;
			i++;
		};
		if( hasCollidedWithWalls( currentPiece ) || hasCollidedWithBlocks( currentPiece )) {
			currentPiece.shapeMatrix = currentShapeMatrix;
		}
	}

	function hardDrop() {
		clearTimeout( updateTimer );
			do {
				currentPiece.y++;
			} while( !hasCollidedWithBlocks( currentPiece ) && !hasLandedOnBottom( currentPiece ) );
			currentPiece.y--;
		update();
	}

	// ==================
	// COLISION DETECTION
	// ==================

	function hasCollidedWithBlocks ( thisBlock ) {
		// scan through all blocks in current piece
		for( var i = 0; i<currentPiece.shapeMatrix.length; i++ ) {
			i++;			

			// scan through game grid (start from blocks on top)
			for( var j = gameGrid.length -1; j>= 0; j-- ) {
				if(( thisBlock.y + thisBlock.shapeMatrix[ i ]) == gameGrid[ j ].y && (thisBlock.x + thisBlock.shapeMatrix[ i-1 ]) == gameGrid[ j ].x ) {
					return true;
				}
			}
		}
	return false;
	}

	function hasCollidedWithWalls ( thisBlock ) {
		for( var i = 0; i<thisBlock.shapeMatrix.length; i++ ) {
			if(( thisBlock.x + thisBlock.shapeMatrix[ i ]) >= gridWidth || ( thisBlock.x + thisBlock.shapeMatrix[ i ]) < 0 ) {
				return true;
			}
			i++;
		};
	return false;
	}

	function hasLandedOnBottom ( thisPiece ) {
		for( var i = 0; i<thisPiece.shapeMatrix.length; i++ ) {
			i++;

			if(( thisPiece.y + thisPiece.shapeMatrix[ i ]) >= gridHeight ) {
				return true;		
			}
		}
	return false;
	}


//    function onBlur() {
//        pause();
//    };



	// =====
	// PAINT
	// =====

	function animate() {		// Clear 
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		// local variables
		var xPos;
		var yPos;

		// draw container
		context.lineWidth = 5;
		context.strokeStyle = "rgb( 255, 155, 155 )";
		context.beginPath();
		context.moveTo( containerLeft - 5, containerTop - 5 ); 
		context.lineTo( containerLeft - 5, containerBottom + 5 );
		context.lineTo( containerRight + 5, containerBottom + 5 );
		context.lineTo( containerRight + 5, containerTop - 5 );
		context.stroke();

		// grid background
		context.fillStyle = "rgb(0, 0, 50)";
		for( var i = 0; i < gridWidth; i++ ) {
			for( var j = 0; j < gridHeight; j++ ) {
				xPos = containerLeft + 2 + ( i * ( blockWidth + blockSpacing ));
				yPos = containerTop + 2 + ( j * ( blockWidth + blockSpacing ));
				context.fillRect( xPos, yPos, blockWidth, blockWidth );
			}
		}


		// draw current game grid
		for(var i = 0; i< gameGrid.length; i++ ) {
			context.fillStyle = gameGrid[i].colour;
			xPos = containerLeft + 2 + ( gameGrid[i].x * ( blockWidth + blockSpacing ));
			yPos = containerTop + 2 + ( gameGrid[i].y * ( blockWidth + blockSpacing ));
			context.fillRect( xPos, yPos, blockWidth, blockWidth );
		}

		// draw current piece
		context.fillStyle = currentPiece.colour;
		for( var i = 0; i< currentPiece.shapeMatrix.length; i++ ) {
			xPos = containerLeft + 2 + (( currentPiece.x + currentPiece.shapeMatrix[ i ]) * ( blockWidth + blockSpacing ));
			i++;
			yPos = containerTop + 2 + (( currentPiece.y + currentPiece.shapeMatrix[ i ]) * ( blockWidth + blockSpacing ));
			context.fillRect( xPos, yPos, blockWidth, blockWidth );	
		}
	
		// draw next piece

		uiScore.html( score );
		uiLevel.html( level );

		// Run the animation loop again in 33 milliseconds
		setTimeout(animate, 33);


		// press any key to start
		// pause message

	}; 

	// ======
	// END OF
	// ======

	init();
});

function lostFocus() {
    pause();
}
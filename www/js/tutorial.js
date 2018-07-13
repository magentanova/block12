var PAUSE_TIME = 250

function advanceTutorial() {
	if (STATE.get('animating')) {
		return 
	}
	STATE.set({
		tutorialStep: STATE.get('tutorialStep') + 1
	})
	EVENTS.trigger(EVENTS.names.tutorialAdvance)
}

function MessageBox() {
	var el = document.createElement('div'),
		textWrapper = document.createElement('div')
	el.className = 'message-box'
	el.id = 'tutorial-box'
	textWrapper.className = 'message-wrapper'
	textWrapper.id = 'tutorial-message-wrapper'
	el.appendChild(textWrapper)
	this.el = el
	this.textWrapper = textWrapper
}	

MessageBox.prototype = {
	fadeTextIn: function() {
		return appear(this.textWrapper,SETTINGS.testMode ? 1 : 1/36)
	},

	fadeTextOut: function() {
		return disappear(this.textWrapper,SETTINGS.testMode ? 1 : 1/36)
	},

	mount: function(el) {
		this.container = el || $('#grid')
		this.container.appendChild(this.el)
		return this
	},

	replaceText: function(lines) {
		var box = this
		return box.fadeTextOut()
			.then(function() {
				box.write(lines)
				return pause(PAUSE_TIME).then(box.fadeTextIn.bind(box)
				)
			})
	},

	write: function(lines, mode='w') {
		if (mode == 'w') {
			this.textWrapper.innerHTML = ''

		}
		lines.forEach(function(txt) {
			this.textWrapper.innerHTML += `<p className="tutorial-words">${txt}</p>`
		}.bind(this))
		return this
	},

	unmount: function() {
		this.container.removeChild(this.el)
		return this
	}
}

function deactivatePowerup(node) {
	node.classList.remove('pulsing')
	// easiest way to remove anonymous event listeners
	node.parentNode.replaceChild(node.cloneNode(true),node)
}

function handleTutorialPowerUp(e) {
	nodeId = e.target.id
	switch (nodeId) {
		case 'invert': 
			dispatchPowerUp(invertPlayerRow)
		case 'flip': 
			dispatchPowerUp(flipPlayerRow)
		case 'shiftRight':
			dispatchPowerUp(shiftRow, 'right')
		case 'shiftLeft':
			dispatchPowerUp(shiftRow, 'left')
	}
	advanceTutorial()
}

function tutorialNext() {
	var messageBox = COMPONENTS.get('messageBox'),
		grid = COMPONENTS.get('grid'),
		playerRow = COMPONENTS.get('playerRow'),
		levelNo = COMPONENTS.get('levelNo'),
		scoreTotal = COMPONENTS.get('scoreTotal'),
		counterRow = COMPONENTS.get('counterRow')

	if (STATE.get('tutorialStep') == 1) {
		messageBox.fadeTextOut()
			.then(function() {
				return pause(PAUSE_TIME)
			})
			.then(function() {
				$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
				var playerColors = 'red blue red red red blue red'.split(' ')
				for (var i = 0; i < 7; i ++) {
					playerRow.addBlock(new Block().fill(playerColors[i]))
				}
			})
			.then(function() { 
				messageBox.write([
					'The bottom row is your row.',
					'The blocks in the bottom row are the only blocks that you control.',
					`(${titleCase(CONTACT_EVENT)} to continue.)`
					])
				playerRow.class('colorPulsing')
				return messageBox.fadeTextIn(messageBox)
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 2) {
		messageBox.fadeTextOut()
			.then(function() {
				$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
				playerRow.removeClass('colorPulsing')
				return grid.addRow('red blue blue red red red red'.split(' '))
			})
			.then(function() { 
				messageBox.write([
					'The glowing box is the grid.',
					'You can\'t control any of the blocks in the grid.',
					])
				grid.class('colorPulsing')
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}


	if (STATE.get('tutorialStep') == 3) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		grid.removeClass('colorPulsing')
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					`${titleCase(CONTACT_EVENT)} the glowing block in your row to change its color.`
				])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				targetBlock(5)
			})
	}

	if (STATE.get('tutorialStep') == 4) {
		untargetBlock(5)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					`Careful! Every time you ${CONTACT_EVENT} a block, a grid row will fall.`,
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				grid.addRow('blue blue red blue red red red'.split(' '))
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 5) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function(){
				messageBox.write([
					'Your goal is to eliminate grid rows by matching them with your row.'
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 6) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"You're in luck! The bottom row in the grid is almost the same as your row.",
					`${titleCase(CONTACT_EVENT)} the glowing block to make a match.`
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				targetBlock(2)
			})
	}

	if (STATE.get('tutorialStep') == 7) {
		untargetBlock(2)
		messageBox.fadeTextOut()
			.then(function() {
				grid.checkForMatch()
				grid.addRow('red blue blue red blue red red'.split(' '))
				messageBox.write([
					"Bravo! Bravo! You got a match!",
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 8) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"And...",
					"You got POINTS!"
				])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				scoreTotal.write(STATE.get('score'))
				scoreTotal.class('pulsingText')
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 9) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		scoreTotal.removeClass('pulsingText')
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"You're also one step closer to completing this level!"
				])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				counterRow.update()
				counterRow.class('pulsing')
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
		// now readout is ready to listen to events
		EVENTS.on(EVENTS.names.scoreUpdate + ' ' + EVENTS.names.sync, function() {
			scoreTotal.write(STATE.get('score'))
			counterRow.update()
		})
	}

	if (STATE.get('tutorialStep') == 10) {
		counterRow.removeClass('pulsing')
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"Lets make another match!",
					`${titleCase(CONTACT_EVENT)} the glowing blocks to match your row to the bottom row in the grid.`,
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				targetBlock(0)
			})
	}

	if (STATE.get('tutorialStep') == 11) {
		untargetBlock(0)
		grid.addRow('red red red blue blue red blue'.split(' '))
		.then(function() {
			return pause(PAUSE_TIME)
		})
		.then(function() {
			targetBlock(2)
		})
	}

	if (STATE.get('tutorialStep') == 12) {
		untargetBlock(2)
		grid.addRow('red blue red red blue blue blue'.split(' '))
		.then(function() {
			return pause(PAUSE_TIME)
		})
		.then(function() {
			targetBlock(3)
		})
	}

	if (STATE.get('tutorialStep') == 13) {
		untargetBlock(3)
		grid.checkForMatch()
		grid.addRow('blue red blue blue red red red'.split(' '))
		.then(function() {
			return pause(PAUSE_TIME)
		})
		.then(function() {
			return messageBox.fadeTextOut()
		})
		.then(function() {
			messageBox.write([
				"Wow. You just. I can't even.",
				"You must be so smart.",
				"I guess the only thing left to do is introduce power-ups."
				])
			return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
		})
		.then(function() {
			$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
		})
	}

	if (STATE.get('tutorialStep') == 14) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"Powerups become available one by one, starting with level 5 and completing on level 7."
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 15) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function(){
				messageBox.write([
					"Lucky for you, this tutorial starts on level 7."
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				
				appear($('#flip'))
				appear($('#shiftLeft'))
				appear($('#shiftRight'))
				appear($('#invert'))
				appear($("#powerUpContainer")).then(function() {
						var powerups = $("#powerUpContainer").children
						for (var i = 0; i < powerups.length; i += 1) {
							powerups[i].classList.add('pulsing')
						}
						$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
				})
			})
	}

	if (STATE.get('tutorialStep') == 16) {
		var powerups = $("#powerUpContainer").children
		for (var i = 0; i < powerups.length; i += 1) {
			powerups[i].classList.remove('pulsing')
		}
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		$("#powerUpContainer").classList.remove('pulsing')
		messageBox.fadeTextOut()
			.then(function(){
				messageBox.write([
					"Sliiide to the right."
					])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
					$("#shiftRight").classList.add('pulsing')
					var shiftCount = 0
					$('#shiftRight').addEventListener(CONTACT_EVENT,function() {POWERUP_EVENTS.shiftRight().then(function() {
							shiftCount += 1
							if (shiftCount == 1) {
								// got a match
								advanceTutorial()
							}
							if (shiftCount == 3) {
								// time to flip
								advanceTutorial()
							}
						})
					})
			})
	}

	if (STATE.get('tutorialStep') == 17) {
		grid.checkForMatch()
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"Powerups do NOT cause a new row to fall.",
					"(Powerups are your friend.)"])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
	}

	if (STATE.get('tutorialStep') == 18) {
		grid.checkForMatch()
		deactivatePowerup($("#shiftRight"))
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"Now flip, baby, flip."])
				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				var flipCount = 0
				$('#flip').addEventListener(CONTACT_EVENT, function() {
					POWERUP_EVENTS.flip().then(function() {
						advanceTutorial() 
					})
				})
				$('#flip').classList.add('pulsing')
			})
	}

	if (STATE.get('tutorialStep') == 19) {
		grid.checkForMatch()
		deactivatePowerup($("#flip"))
		messageBox.replaceText([
					"What was red shall be blue, and what was blue shall be red."])
			.then(function() {
				$("#invert").classList.add('pulsing')
				$("#invert").addEventListener(CONTACT_EVENT, function() {
					POWERUP_EVENTS.invert().then(function() {
						advanceTutorial()
					})
				})
			})
	}

	// if (STATE.get('tutorialStep') == 20) {
	// 	deactivatePowerup($('#invert'))
	// 	messageBox.replaceText(["One-two punch."])
	// 		.then(function() {
	// 			$("#flip").classList.add('pulsing')
	// 			$("#flip").addEventListener(CONTACT_EVENT, function() {
	// 				POWERUP_EVENTS.flip().then(function() {
	// 					advanceTutorial()
	// 				})
	// 			})
	// 		})
	// }

	// if (STATE.get('tutorialStep') == 21) {
	// 	deactivatePowerup($('#flip'))
	// 	$("#invert").classList.add('pulsing')
	// 	$("#invert").addEventListener(CONTACT_EVENT, function() {
	// 				POWERUP_EVENTS.invert().then(function() {
	// 					advanceTutorial()
	// 				})
	// 		})
	// }

	if (STATE.get('tutorialStep') == 20) {
		grid.checkForMatch()
		deactivatePowerup($('#invert'))
		messageBox.replaceText([
			"When you clear the board using power-ups, you get BONUS POINTS!"])
			.then(function() {
				$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 21) {
		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		grid.addRow('red blue red blue red blue red'.split(' '))	
			.then(function() {
				messageBox.replaceText([
					"And a new row falls..."])
					.then(function() {
						$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
					})
			})
	}

	if (STATE.get('tutorialStep') == 22) {
		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		messageBox.replaceText([
			"Every time you clear a new level, the going gets tougher.",
			"Good luck!"])
			.then(function() {
				$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 23) {
		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		showPlayButton()
	}
}

function runTutorial() {
	STATE.reset()
	STATE.set({
		view:'play',
		tutorialStep: 0
	})
	EVENTS.clear() // clear zombie event submissions
	COMPONENTS.init() // create global components
	COMPONENTS.get('grid').clear()
	STATE.set({
		currentRows: 0,
		level: 7,
		playerBlocks: Array(7).fill(null)
	})
	STATE.initPlay() // set state defaults
	STATE.updateScore(0)

	// set points and level number
	COMPONENTS.get('levelNo').write(CONSTANTS.numeralToWord[STATE.get('level')])
	COMPONENTS.get('scoreTotal').write(STATE.get('score'))
	COMPONENTS.get('counterRow').fill()

	// set spatial dimensions
	$('#playerRowContainer').style.height = toPx(STATE.get('sqSide'))
	$('#grid').style.height = toPx(STATE.get('gridHeight'))
	$('#playerRowContainer').style.width = STATE.getRowWidth()
	$('#gameContainer').style.width = STATE.getRowWidth()

	// clear listeners
	EVENTS.off([EVENTS.names.sync,EVENTS.names.scoreUpdate])

	// prepare tutorial mechanics
	COMPONENTS.set({
		messageBox: new MessageBox()
	})
	EVENTS.on(EVENTS.names.tutorialAdvance, tutorialNext)

	// ready for step 1!
	COMPONENTS.get('messageBox').mount().write(['Welcome to block!','(Click to continue.)'])
	pause(PAUSE_TIME).then(function() {
		$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
	})
}

function targetBlock(pos) {
	var targetBlock = COMPONENTS.get('playerRow').blocks[pos]
	targetBlock.class('pulsing')
	targetBlock.addSwitchListener()
	targetBlock.node.addEventListener(CONTACT_EVENT,advanceTutorial)
}

function untargetBlock(pos) {
	var targetBlock = COMPONENTS.get('playerRow').blocks[pos]
	targetBlock.removeSwitchListener()
	targetBlock.node.removeEventListener(CONTACT_EVENT, advanceTutorial)
	targetBlock.removeClass('pulsing')
}

$('body').addEventListener('keydown', function(e) {
	if (e.key == 't') {
		runTest()
	}
})
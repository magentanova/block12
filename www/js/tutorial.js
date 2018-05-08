function advanceTutorial() {
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
		return appear(this.textWrapper,1/36)
	},

	fadeTextOut: function() {
		return disappear(this.textWrapper,1/36)
	},

	mount: function(el) {
		this.container = el || $('#grid')
		this.container.appendChild(this.el)
		return this
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
		playerRow = COMPONENTS.get('playerRow')

	if (STATE.get('tutorialStep') == 1) {
		messageBox.fadeTextOut()
			.then(function() {
				$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
				var playerColors = 'red blue blue red red red red'.split(' ')
				for (var i = 0; i < 7; i ++) {
					playerRow.addBlock(new Block().fill(playerColors[i]))
				}
				grid.addRow('red blue red red red blue red'.split(' '))
			})
			.then(function() { 
				messageBox.write([
					'The bottom row is your row.',
					'The blocks in the bottom row are the only blocks that you control.',
					'(Click to continue.)'
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
		}

	if (STATE.get('tutorialStep') == 2) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					`${titleCase(CONTACT_EVENT)} the glowing block to change its color.`
				])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				var targetBlock = playerRow.blocks[5]
				targetBlock.class('pulsing')
				targetBlock.addSwitchListener()
				targetBlock.node.addEventListener(CONTACT_EVENT,advanceTutorial)
			})
		}

	if (STATE.get('tutorialStep') == 3) {
		var targetBlock = playerRow.blocks[5]
		pause(50)
			.then(function() {
				targetBlock.removeSwitchListener()
				targetBlock.node.removeEventListener(CONTACT_EVENT, advanceTutorial)
				targetBlock.removeClass('pulsing')
				return messageBox.fadeTextOut()
			})
			.then(function() {
				messageBox.write([
					'Careful! Every time you switch a block, a grid row will fall.',
					'Your goal is to eliminate grid rows by matching them with your row.',
					'(Click anywhere to continue.)',
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				grid.addRow('red red red red red red red'.split(' '))
				$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 4) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"You're in luck! The bottom row in the grid is almost the same as your row.",
					`${titleCase(CONTACT_EVENT)} the glowing block to make a match.`
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				var targetBlock = playerRow.blocks[2]
				targetBlock.class('pulsing')
				targetBlock.addSwitchListener()
				targetBlock.node.addEventListener(CONTACT_EVENT,advanceTutorial)
			})
	}

	if (STATE.get('tutorialStep') == 5) {
		var targetBlock = playerRow.blocks[2]
		pause(50)
			.then(function() {
				targetBlock.removeSwitchListener()
				targetBlock.node.removeEventListener(CONTACT_EVENT, advanceTutorial)
				targetBlock.removeClass('pulsing')
				return messageBox.fadeTextOut()
			})
			.then(function() {
				grid.checkForMatch()
				grid.addRow('blue blue blue blue blue blue blue'.split(' '))
				messageBox.write([
					"Bravo! Bravo! You got POINTS!",
					"Time to make things more interesting.",
					"(Click to continue.)"
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function(){$('body').addEventListener(CONTACT_EVENT, advanceTutorial)})
	}

	if (STATE.get('tutorialStep') == 6) {
		appear($("#invert"))
		appear($("#flip"))
		appear($("#shiftLeft"))
		appear($("#shiftRight"))
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"The buttons to the left are special abilities.",
					"They're not available until level 7.",
					"This tutorial takes place in level 7 ;)",
					"(Click to continue.)"
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function(){$('body').addEventListener(CONTACT_EVENT, advanceTutorial)})
	}

	if (STATE.get('tutorialStep') == 7) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"Special abilities are cool because they're free to use...",
					"...as in, a new row won't fall when you use a special ability.",
					"(Click to continue.)"
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function(){$('body').addEventListener(CONTACT_EVENT, advanceTutorial)})
	}

	if (STATE.get('tutorialStep') == 8) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"There's the color swap...",
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function(){
				$('#invert').classList.add('pulsing')
				$('#invert').addEventListener(CONTACT_EVENT,handleTutorialPowerUp)
			})
	}

	if (STATE.get('tutorialStep') == 9) {
		$('#invert').removeEventListener(CONTACT_EVENT,handleTutorialPowerUp)
		$('#invert').classList.remove('pulsing')
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"the flip..."
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('#flip').classList.add('pulsing')
				$('#flip').addEventListener(CONTACT_EVENT, handleTutorialPowerUp)
			})
	}

	if (STATE.get('tutorialStep') == 10) {
		$('#flip').removeEventListener(CONTACT_EVENT,handleTutorialPowerUp)
		$('#flip').classList.remove('pulsing')
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"and of course the slide."
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				$('#shifters').classList.add('pulsing')
				$('#shifters').addEventListener(CONTACT_EVENT, handleTutorialPowerUp)
			})
	}

	if (STATE.get('tutorialStep') == 11) {
		$('#shifters').removeEventListener(CONTACT_EVENT,handleTutorialPowerUp)
		$('#shifters').classList.remove('pulsing')
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"See if you can take out the top row using only special abilities."
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
			})
			.then(function() {
				var ids = ['shifters','flip','invert']
				for (var i = 0; i < ids.length; i ++) {
					$('#' + ids[i]).classList.add('pulsing')
					$('#' + ids[i]).addEventListener(CONTACT_EVENT, handleTutorialPowerUp)
				}
			})
	}
}

function runTutorial() {
	STATE.set({
		view:'play',
		tutorialStage: 0
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
	// set heights according to device dimensions
	$('#playerRowContainer').style.height = toPx(STATE.get('sqSide'))
	$('#grid').style.height = STATE.get('gridHeight')

	// set up subscriptions

	// set up listeners
	EVENTS.off(EVENTS.names.sync)
	$('#playerRowContainer').style.width = STATE.getRowWidth()
	$('#gameContainer').style.width = STATE.getRowWidth()
	COMPONENTS.set({
		messageBox: new MessageBox()
	})
	COMPONENTS.get('messageBox').mount().write(['Welcome to block!','(Click to continue.)'])
	EVENTS.on(EVENTS.names.tutorialAdvance, tutorialNext)
	setTimeout(function() {
		$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
	}, 50)
}
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

function tutorialNext() {
	console.log(STATE.get('tutorialStep'))
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
		messageBox.fadeTextOut()
			.then(function() {
				messageBox.write([
					"You're in luck! The bottom row in the grid is almost the same as your row.",
					`${titleCase(CONTACT_EVENT)} the glowing block to make a match.`
					])
				return pause(250).then(messageBox.fadeTextIn.bind(messageBox))
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
	STATE.initPlay() // set state defaults
	STATE.set({
		currentRows: 0,
		level: 7,
		playerBlocks: Array(7).fill(null)
	})
	// set heights according to device dimensions
	$('#playerRowContainer').style.height = toPx(STATE.get('sqSide'))
	$('#grid').style.height = STATE.get('gridHeight')

	// set up subscriptions
	EVENTS.on(EVENTS.names.levelStart, runLevel)
	EVENTS.on(EVENTS.names.levelComplete, initLevel)

	// set up listeners
	EVENTS.off(EVENTS.names.sync)
	STATE.sync()
	COMPONENTS.set({
		messageBox: new MessageBox()
	})
	COMPONENTS.get('messageBox').mount().write(['Welcome to block!','(Click to continue.)'])
	EVENTS.on(EVENTS.names.tutorialAdvance, tutorialNext)
	setTimeout(function() {
		$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
	}, 50)
}
function MessageBox() {
	var el = document.createElement('div')
	el.className = 'message-box'
	el.id = 'tutorial-box'
	this.el = el
}	

function advanceTutorial() {
	STATE.set({
		tutorialStep: STATE.get('tutorialStep') + 1
	})
	EVENTS.trigger(EVENTS.names.tutorialAdvance)
}

function tutorialNext() {
	console.log(STATE.get('tutorialStep'))
	if (STATE.get('tutorialStep') == 1) {
		$('body').removeEventListener(CONTACT_EVENT, advanceTutorial)
		var colors = 'red blue blue red red red red'.split(' ')
		for (var i = 0; i < 7; i ++) {
			COMPONENTS.get('playerRow').addBlock(new Block().fill(colors[i]))
		}
		
	}
}

MessageBox.prototype = {
	mount: function(el) {
		this.container = el || $('#grid')
		this.container.appendChild(this.el)
		return this
	},

	write: function(lines, mode='w') {
		if (mode == 'w') {
			this.el.innerHTML = ''
		}
		lines.forEach(function(txt) {
			this.el.innerHTML += `<p className="tutorial-words">${txt}</p>`
		}.bind(this))
		return this
	},

	unmount: function() {
		this.container.removeChild(this.el)
		return this
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
	EVENTS.on(EVENTS.names.powerUpUsed, function() {
		if (STATE.get('currentRows') < 1) {
			EVENTS.trigger(EVENTS.names.drop)
		}
		EVENTS.trigger(EVENTS.names.playerRowChange)
	})

	EVENTS.off(EVENTS.names.sync)
	STATE.sync()

	var mb = new MessageBox()
	mb.mount().write(['Welcome to block!','(Click to continue.)'])
	EVENTS.on(EVENTS.names.tutorialAdvance, tutorialNext)
	setTimeout(function() {
		$('body').addEventListener(CONTACT_EVENT, advanceTutorial)
	}, 1500)
}
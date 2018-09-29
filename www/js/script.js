'use strict;'

// COMPONENTS
var COMPONENTS = {
	attributes: {
	},
	init: function() {
		this.set({
			grid: new Grid(),
			levelNo: new Component().assignNode('#level'),
			playerRow: new PlayerRow(),
			counterRow: new CounterRow(),
			scoreTotal: new Component().assignNode('#score')
		})
		EVENTS.on(EVENTS.names.scoreUpdate + ' ' + EVENTS.names.sync, function() {
			this.get('scoreTotal').write(STATE.get('score'))
			saveScore()
			}.bind(this))
		EVENTS.on(EVENTS.names.sync, function() {
			this.get('levelNo').write(CONSTANTS.numeralToWord[STATE.get('level')])
		}.bind(this))
	}
}

// CONSTANTS
var CONSTANTS = {
	numeralToWord: {
		4:"four",
		5:"five",
		6:"six",
		7:"seven",
		8:"eight",
		9:"nine",
		10:"ten",
		11:"eleven",
		12:"twelve",
		13:"thirteen"
	},
	dropIncr: SETTINGS.testMode ? 1000: 10,
	fadeIncr: SETTINGS.testMode ? 1000: 1/24,
	invertSpeed: SETTINGS.testMode ? 0: 20,
	matchTimeout: SETTINGS.testMode ? 0 : 1250,
	glowTimeout: SETTINGS.testMode ? 0 : 1500,
	rowScoreTimeout: SETTINGS.testMode ? 0 : 550,
	rotateIncr: SETTINGS.testMode ? 1000: 2.88,
	songs: ['#polyphonic', '#hallelujah'],
	tones: 'egae'
	// slideSpeed: STATE.get('sqSide') / 16 // this needs to be computed after page load. hrmm. 
}
 
// EVENTS
var EVENTS = {
	eventMap: {},

	clear: function() {
		this.eventMap = {}
	},

	off: function(evt,cb) {
		if (cb) {
			this.eventMap[evt] = this.eventMap[evt].remove(cb)
		}
		else {
			if (typeof evt === 'string') {
				this.eventMap[evt] = []
			}
			if (evt instanceof Array) {
				evt.forEach(function(one) {
					this.eventMap[one] = []
				}.bind(this))
			}
		}
	},
	on: function(evts,cb) {
		if (evts === undefined || evts.includes('undefined')) {
			throw new ReferenceError('attempted to use undefined event name.')
		}
		evts.split(' ').forEach(function(evt) {
			if (this.eventMap[evt]) {
				this.eventMap[evt].push(cb)
			}
			else {
				this.eventMap[evt] = [cb]
			}
		}.bind(this))
	},

	trigger: function(evt,arg) {
		if (!this.eventMap[evt]) return
		this.eventMap[evt].forEach(function(cb) {cb(arg)})
	},

	names: {
		drop: 'drop',
		gridRowAdded: 'gridRowAdded',
		gridRowLost: 'gridRowLost',
		levelComplete: 'levelComplete',
		levelStart: 'levelStart',
		match: 'match',
		playerRowChange: 'playerRowChange',
		powerUpUsed: 'powerUpUsed',
		scoreUpdate: 'scoreUpdate',
		sync: 'sync',
		tutorialAdvance: 'tutorialAdvance'
	}
}

var POWERUP_EVENTS = {
	flip: function() {
		return dispatchPowerUp(flipPlayerRow)
	},

	invert: function() {
		return dispatchPowerUp(invertPlayerRow)
	},

	shiftRight: function() {
		return dispatchPowerUp(shiftRow, 'right')
	},

	shiftLeft: function() {
		return dispatchPowerUp(shiftRow, 'left')
	}
}

// APP STATE
var STATE = EVENTS.extend({
	attributes: {
		advancing: false,
		animating: false,
		currentToneIndex: 0,
		tutorialStep: 0,
		gridRows: [],
		tutorialStep: 0,
		level: 4,
		currentRows: 0,
		maxRows: 8,
		matchesThusFar: 0,
		playerBlocks: Array(4).fill(['red','blue'].choice()),
		score: 0,
		settings: SETTINGS,
		song: '#bloq-slow',
		sqSide: null,
		view: 'home'
	},

	defaultAttributes: {
		advancing: false,
		animating: false,
		currentToneIndex: 0,
		tutorialStep: 0,
		tutorialStep: 0,
		gridRows: [],
		tutorialStep: 0,
		level: 4,
		currentRows: 0,
		maxRows: 8,
		matchesThusFar: 0,
		playerBlocks: Array(4).fill(['red','blue'].choice()),
		score: 0,
		settings: SETTINGS,
		song: '#bloq-slow',
		sqSide: null,
		view: 'home'
	},

	levelDefaults: {
		currentRows: 0,
		matchesThusFar: 0
	},

	getDefaults: function() {
		defaults = JSON.parse(JSON.stringify(this.defaultAttributes))
		return defaults
	},

	getGridTop: function() {
		return this.get('currentRows') * this.get('sqSide') || -1
	},

	getRowBlocks: function() {
		return Math.min(this.get('level'), 11)
	},

	getRowWidth: function() {
		return toPx(this.get('sqSide') * this.getRowBlocks())
	},

	getSavedState: function() {
		return JSON.parse(window.localStorage.getItem('bloq_state'))
	},

	initPlay: function() {
		// set dimensions according to device
		var containerHeight = window.getComputedStyle(document.querySelector("#container")).height
		var sideLength = parseInt(containerHeight) * .087

		// add a new grid and player row to state
		this.set({
			sqSide: sideLength,
			gridHeight: (sideLength * STATE.get('maxRows')) - 1
		})
	},

	levelUp: function() {
		// constant actions at level change
		// trigger level change, grid and width-dependent things will subscribe to it.
		if (this.get('matchesThusFar') < this.get('level')) return 0
		setTimeout(
			function(){
				playSound('level_up')
			},
			500
		)
		STATE.set({
			advancing: true
		})

		return animate(function(res) {
			setTimeout(function() {
				// for every empty row space remaining, run handleRowScore at that location
				var ps = []
				for (var i = STATE.get('currentRows'); i < STATE.get('maxRows'); i ++) {
					var bottom = i * STATE.get('sqSide')
					ps.push(handleRowScore(bottom,750))
				}
				STATE.resetLevelDefaults() // prevents level jumps while transitioning

				// when all those animations are complete, then fade out the container etc
				Promise.all(ps).then(function() {
					return disappear($('#container'))
				}).then(function() {
					EVENTS.trigger(EVENTS.names.levelComplete)
					STATE.revealButtons()
					appear($('#container'))
					STATE.set({
						advancing: false
					})
					res()
				})

			}, 500)
		})
		// pause for dramatic effect
		
	},

	load: function(oldState) {
		this.set(oldState)
	},

	resetLevelDefaults: function() {
		this.attributes = this.attributes.extend(this.levelDefaults)
	},

	reset: function() {
		STATE.set(this.getDefaults())
		window.localStorage.setItem('bloq_state', null) 
		window.localStorage.setItem('bloq_grid', null) 
		window.localStorage.setItem('bloq_player_row', null) 
	},

	revealButtons: function() {
		if (this.get('level') >= 5 || location.hash == '#cheat') {
			appear($('#invert'))
			$('#invert').addEventListener(CONTACT_EVENT,function() {
				POWERUP_EVENTS.invert()
			})
		}
		if (this.get('level') >= 6 || location.hash == '#cheat') {
			appear($('#flip'))
			$('#flip').addEventListener(CONTACT_EVENT,function() {
				POWERUP_EVENTS.flip()
			})
		}
		if (this.get('level') >= 7 || location.hash == '#cheat') {
			appear($('#shiftLeft'))
			appear($('#shiftRight'))
			$('#shiftLeft').addEventListener(CONTACT_EVENT,function() {
				POWERUP_EVENTS.shiftLeft()
			})
			$('#shiftRight').addEventListener(CONTACT_EVENT,function() {
				POWERUP_EVENTS.shiftRight()
			})
		}
	},

	save: function() {
		var copy = {}.extend(this.attributes)
		copy.animating = false
		copy.advancing = false
		window.localStorage.setItem('bloq_state', JSON.stringify(copy))
	},

	sync: function() {
		// set row and grid width according to state
		$('#playerRowContainer').style.width = STATE.getRowWidth()
		$('#gameContainer').style.width = STATE.getRowWidth()
		this.revealButtons()
		EVENTS.trigger(EVENTS.names.sync)
	},

	updateScore: function(addition) {
		this.set({
			score: this.get('score') + addition,
		})
		EVENTS.trigger(EVENTS.names.scoreUpdate)
		return this
	}
})

// TEMPLATES
var VIEWS = {
	buyIt: {
		content: TEMPLATES.buyIt,
		init: function() {
			// stub
		}	
	},
	play: {
		content: TEMPLATES.play,
		init: function(opts) {
			opts = opts || {}
			// don't used saved state if we're in tutorial mode
			if (opts.tutorial) {
				STATE.set(STATE.defaultAttributes)
				STATE.set({
					view: tutorial,
					tutorialStep: 1
				})
			}
			else {
				STATE.set({
					view:'play',
					tutorialStep: 0
				})
				if (STATE.getSavedState()) {
					STATE.load(STATE.getSavedState())
				}
			}

			EVENTS.clear() // clear zombie event submissions
			COMPONENTS.init() // create global components
			var grid = COMPONENTS.get('grid')
			STATE.initPlay() // set state defaults

			// set heights according to device dimensions
			$('#playerRowContainer').style.height = toPx(STATE.get('sqSide'))
			$('#grid').style.height = toPx(STATE.get('gridHeight'))

			// set up subscriptions
			EVENTS.on(EVENTS.names.levelStart, runLevel)
			EVENTS.on(EVENTS.names.levelComplete, initLevel)
			EVENTS.on(EVENTS.names.drop, grid.addRow.bind(grid))
			EVENTS.on(EVENTS.names.playerRowChange, grid.checkForMatch.bind(grid))
			EVENTS.on(EVENTS.names.sync, function() {
				STATE.get('gridRows').forEach(function(colorArr, i) {
					grid.loadRow(colorArr, i)
				}.bind(grid))
			}.bind(grid))

			EVENTS.on(EVENTS.names.powerUpUsed, function() {
				if (STATE.get('currentRows') < 1) {
					EVENTS.trigger(EVENTS.names.drop)
				}
				EVENTS.trigger(EVENTS.names.playerRowChange)
			})
				// update local storage in response to various events
			EVENTS.on(`${EVENTS.names.playerRowChange} ${EVENTS.names.gridRowAdded} ${EVENTS.names.gridRowLost} ${EVENTS.names.levelStart} ${EVENTS.names.levelComplete} ${EVENTS.names.scoreUpdate}`, function() {
				if (STATE.get('view') == 'tutorial') return 
				STATE.set('playerBlocks', $('#playerRow').children.map(function(node) {
					return node.getAttribute('data-color')
					})
				)
				STATE.set('gridRows', 
					COMPONENTS.get('grid').getRows().map(function(rowEl) {
						return rowEl.querySelectorAll('.block').map(function(blockEl) {
							return blockEl.getAttribute('data-color')
						})
					})
				)
				STATE.save()
			})

			STATE.sync()
			if (!STATE.getSavedState()) {
				EVENTS.trigger(EVENTS.names.levelStart)
			}
		},
	},
	settings: {
		content: TEMPLATES.settings,
		init: function() {
			STATE.set('view','settings')
			SETTINGS.init()
		}
	},
	home: {
		content: TEMPLATES.home,
		init: function() {
			STATE.set('view','home')
			var ids = ['play','tutorial','settings','about']
			ids.forEach(function(id) {
				$('#' + id).addEventListener(CONTACT_EVENT,function() {loadView(id)})
			})
			document.querySelector('#high-score .score').innerHTML = localStorage.getItem('blockTwelveHighScore') || 0
		}
	},
	about: {
		content: TEMPLATES.about,
		init: function() {
			STATE.set('view','about')
		}
	},
	tutorial: {
		content: TEMPLATES.play,
		init: function() {
			runTutorial()
		}
	}
}

// COMPONENTS
function Component(sel) {
	this.sel = sel
	// if the node is being read, we find it. otherwise, we
		// create it and make it a div by default
	this.node = $(sel) || document.createElement('div')
}

Component.prototype = EVENTS.extend({

	assignNode: function(input) {
		if (typeof input === 'string') {
			this.node = $(input)
		}
		else {
			this.node = input
		}
		return this
	},

	class: function(className) {
		if (className) {
			this.node.className += ' ' + className
			return this
		}
		else {
			return this.node.className
		}
	},

	get: function(key) {
		return this.node.getAttribute(key)
	},

	getStyle: function(key) {
		var val = this.node.style[key]
		// parse to a number if possible
		return parseInt(val) ? parseInt(val) : val
	},

	listen: function(evt,cb) {
		this.node.addEventListener(evt,cb)
	},

	makeNode: function(tag) {
		this.node = document.createElement(tag || 'div')
		return this
	},

	removeClass: function(name) {
		this.node.classList.remove(name)
	},

	set: function(attr, value) {
		if (typeof attr === 'string') {
			this.node.setAttribute(attr, value)
			return this
		}
		Object.keys(attr).forEach(function(key) {
			this.node.setAttribute(key,attr[key])						
		}.bind(this))
		return this
	},

	setStyle: function(attr, value) {
		if (typeof attr === 'string') {
			this.node.style[attr] = value
			return this
		}
		for (var prop in attr) {
			if (typeof prop === 'number') prop = toPx(prop)
			this.node.style[prop] = attr[prop]
		}
		return this
	},

	unlisten: function(evt,cb) {
		this.node.removeEventListener(evt,cb)
	},


	write: function(content) {
		this.node.innerHTML = content
	}
})

function Grid() {
	// assign node and height
	this.assignNode('#grid')
	this.setStyle({
		height: toPx(STATE.get('sqSide') * STATE.get('maxRows'))
	})
}

Grid.prototype = Component.prototype.extend({
	addRow: function(colors) {	
		var row = new GridRow()
		// fill randomly or specifically, depending on use case
		row.fill(colors)
		if (arraysEqual(row.colors(),COMPONENTS.get('playerRow').colors())) {
			return this.addRow()
		}
		row.set({
			'data-position': STATE.get('currentRows')
		})
		STATE.set({
			currentRows: STATE.get('currentRows') + 1
		})
		row.setStyle({
			bottom: toPx(STATE.get('gridHeight') - STATE.get('sqSide')),
			width: STATE.getRowWidth()
		})
		this.node.appendChild(row.node)
		return this.sendRowDown(row)
	},

	checkForMatch: function() {
		
		var gridRows = this.node.children,
			playerColors = COMPONENTS.get('playerRow').node.children.map(function(el) {
				return el.style.background
			}),
			matchedRows = []
		gridRows.forEach(function(row) {
			var colors = row.children.map(function(el) {
				return el.style.background
			})
			if (arraysEqual(playerColors,colors)) {
				matchedRows.push(row)
			}
		})
		var promise = this.handleMatches(matchedRows)
			.then(STATE.levelUp.bind(STATE))
			// If we don't level up but we have zero rows, drop another row
			// while giving points for an additional row
			.then(function(){
				if (STATE.get('currentRows') === 0) {
					animate(function(res){
						setTimeout(function() {
							handleRowScore(0, CONSTANTS.rowScoreTimeout)
							EVENTS.trigger(EVENTS.names.drop)
							res()
						}, CONSTANTS.matchTimeout)	
					})
				}
		})		
		return promise
	},

	clear: function() {
		this.node.clearChildren()
	},

	getRows: function() {
		return this.node.querySelectorAll('.gridRow')
	},

	handleMatches: function(matches) {
		var grid = this
		var ps = matches.map(function(row) {
			return handleTutorialMatch(new Row().assignNode(row))
				.then(function() {
					// handle row mechanics
					STATE.set({
						currentRows: STATE.get('currentRows') - 1,
						matchesThusFar: STATE.get('matchesThusFar') + 1
					}) // update currentRows *before* the row has disappeared,
						// so that the next row knows where to land

					// handle scoring
					var btm = row.style.bottom
					handleRowScore(btm,550)
					return disappear(row)
				})
				.then(function() {
					grid.node.removeChild(row)
					EVENTS.trigger(EVENTS.names.gridRowLost)
				})
		}) // each disappearance returns a promise
		// Promise.all will resolve immediately if the array is empty.
		return Promise.all(ps).then(function() {
			grid.resetIndices()
			handleLoss()
			return grid.sendAllDown()
		})
	},

	loadRow: function(colors, i) {
		var row = new GridRow()
		row.setBlocks(colors)
		row.set({
			'data-position': i
		})
		row.setStyle({
			bottom: toPx(i * STATE.get('sqSide')),
			width: STATE.getRowWidth()
		})
		this.node.appendChild(row.node)
		return this
	},

	resetIndices: function() {
		var rows = this.getRows()
		for (var i = 0; i < rows.length; i ++) {
			rows[i].setAttribute('data-position',i)
		}
	},

	sendAllDown: function() {
		var ps = []
		this.getRows().forEach(function(el) {
			var rowComp = new Row()
			rowComp.node = el
			ps.push(this.sendRowDown(rowComp))
		}.bind(this))
		return Promise.all(ps)
	},

	sendRowDown: function(rowComp) {
		return animate(function(res) {
			setTimeout(function() {
				var incr = CONSTANTS.dropIncr,
					rockBottom = rowComp.get('data-position') * STATE.get('sqSide')
					var willTravel = rowComp.getStyle('bottom') > rockBottom
				var inchDown = function() {
					var newBottom = rowComp.getStyle('bottom') - incr
					rowComp.setStyle({
						bottom: newBottom > rockBottom ? 
							toPx(newBottom) : toPx(rockBottom)
					})
					if (rowComp.getStyle('bottom') > rockBottom) {
						requestAnimationFrame(inchDown)
					}
					else {
						if (willTravel) playSound('land')
						EVENTS.trigger(EVENTS.names.gridRowAdded)
						res()
					}	
				}
				inchDown()					
			}, 250)
		})
	}
})

function Row() {
	this.blocks = []
}

Row.prototype = Component.prototype.extend({

	addBlock: function(b) {
		this.blocks.push(b)
		this.node.appendChild(b.node)
	},

	getBlocks: function() {
		return this.node.querySelectorAll('.block')
	},

	colors: function() {
		return this.getBlocks().map(function(el) {
			return el.style.background
		})
	},

	empty: function() {
		this.node.clearChildren()
		return this
	},


	fill: function(colors) {
		this.node.clearChildren()
		var blocksCalledFor = Math.min(STATE.get('level'),11),
			colorIndex = 0
		while (blocksCalledFor > this.node.children.length) {
			if (colors) {
				this.addBlock(this.makeBlock().fill(colors[colorIndex]))
			}
			else {
				this.addBlock(this.makeBlock().randomFill())
			}
			colorIndex += 1
		}
		return this
	},

	makeBlock: function() {
		return new Block()
	},

	reverseBlocks: function() {
		var reversedBlocks = this.getBlocks().reverse()
		this.empty()
		reversedBlocks.forEach(function(blockEl) {
			this.node.appendChild(blockEl)
		}.bind(this))
	},

	setBlocks: function(colorArr) {
		colorArr.forEach(function(color) {
			var b = this.makeBlock().fill(color)
			this.addBlock(b)
		}.bind(this))
	}
})

function GridRow() {
	this.blocks = []
	this.node = document.createElement('div')
	this.node.className = 'row gridRow'
}

GridRow.prototype = Row.prototype.extend({

})	

function PlayerRow() {
	this.assignNode('#playerRow')
	this.blocks = []
	EVENTS.on(EVENTS.names.sync, function() {
		this.setBlocks(STATE.get('playerBlocks'))
	}.bind(this))
}

PlayerRow.prototype = Row.prototype.extend({
	makeBlock: function() {
		var b = new Block().addSwitchListener()
		return b
	}
})

function CounterRow() {
	this.assignNode('#blockCounter')
	EVENTS.on(EVENTS.names.sync + ' ' + EVENTS.names.scoreUpdate + ' ' + EVENTS.names.levelStart, this.update.bind(this))
	EVENTS.on(EVENTS.names.sync + ' ' + EVENTS.names.levelStart, this.fill.bind(this))
}

CounterRow.prototype = Row.prototype.extend({

	fill: function() {
		this.empty()
		var blocksCalledFor = Math.min(STATE.get('level'),11)
		while (blocksCalledFor > this.node.children.length) {
			this.node.appendChild(new Component().makeNode().class('miniBlock').node)
		}
		return this
	},

	update: function() {
		var timeout = 0 
		setTimeout( function() {
			this.node.children.forEach(function(miniEl,i){
				if (STATE.get('matchesThusFar') > i) {
					miniEl.classList.add('filled')
					if (timeout) brieflyGlow(miniEl)
				}
			}.bind(this))
		}.bind(this), timeout)
	}
})

function Block(inputColor) {
	this.makeNode('div')
	this.class('block')
	this.setStyle({
		width: toPx(STATE.get('sqSide')),
		height: toPx(STATE.get('sqSide'))
	})

}

Block.prototype = Component.prototype.extend({
	addSwitchListener: function() {
		this.boundHandler = this.handleClick.bind(this)
		this.listen(CONTACT_EVENT, this.boundHandler)
		return this
	},

	fill: function(color) {
		this.setStyle({
			background: SETTINGS.colors[color]
		})
		this.node.setAttribute('data-color',color)
		return this
	},

	handleClick: function(event) {
		playSound('tap_' + CONSTANTS.tones[STATE.get('currentToneIndex')])		
		STATE.set({
			currentToneIndex: (STATE.get('currentToneIndex') + 1) % CONSTANTS.tones.length
		})
		if (STATE.get('advancing') || STATE.get('animating')) return 
		this.switchColor()
		EVENTS.trigger('playerRowChange')
		if (STATE.get('tutorialStep') == 1) return
		EVENTS.trigger('drop')

	},

	randomFill: function() {
		color = ['red','blue'].choice()
		this.node.setAttribute('data-color', color)
		return this.setStyle({
			background: SETTINGS.colors[color]
		})
	},

	removeSwitchListener: function() {
		this.unlisten(CONTACT_EVENT, this.boundHandler)
	},

	switchColor: function() {
		this.set("data-color", this.get('data-color') === 'red' ? 'blue' : 'red')
		this.setStyle("background", SETTINGS.colors[this.get('data-color')])
	}
})

function Score(opts) {
	this.makeNode('p')	
	this.setStyle({
		bottom: opts.bottomPos,
		lineHeight: toPx(STATE.get('sqSide')),
		opacity: 1
	})
	this.set({
		class: 'scoreAnimation'
	})
	this.write('+ ' + opts.val)
}

Score.prototype = Component.prototype.extend({

})

// GLOBAL FUNCTIONS
function animate(cb) {
	STATE.set({
		animating: true
	})
	return new Promise(function(res) {
		cb(res)
	}).then(function() {
		STATE.set({
			animating: false
		})
	})
}

function arraysEqual(arr1,arr2) {
	if (arr1.length !== arr2.length) return false
	for (var i = 0; i < arr1.length; i ++) {
		if (arr1[i] !== arr2[i]) return false
	}
	return true
}

function appear(el,fadeRate) {
	var fadeRate = fadeRate || CONSTANTS.fadeIncr
	if (el instanceof Array) {
		el.forEach(appear)
	}
	el.style.opacity = 0
	el.style.visibility = 'visible'
	return animate(function(res) {
		var brighten = function() {
			el.style.opacity = parseFloat(el.style.opacity) + fadeRate
			if (el.style.opacity < 1) {
				requestAnimationFrame(brighten)
			}
			else {
				res()
			}
		}
		requestAnimationFrame(brighten)
	}).then(function() { STATE.set('animating', false)})
}

function brieflyGlow() {
	var nodes = arguments
	return new Promise(function(res) {
		// need for each here because of closures and i
		Array.prototype.forEach.call(nodes,function(node) {
			node.classList.add('glowing')
			STATE.set('animating',true)
			setTimeout(function() {
				node.classList.remove('glowing')
				// pause for effect
				setTimeout(res,500)
			}, CONSTANTS.glowTimeout)
		})
	}).then(function() {
		STATE.set('animating',false)
	})
}

function closeTutorial() {
	if (STATE.get('tutorialStep') > 0) {
		// if we've just finished the tutorial 
		EVENTS.clear()
		setTimeout(showPlayButton,1000)
		STATE.set('tutorialStep',0)
		COMPONENTS.get('playerRow').removeClass('pulsing')
		return true
	}
	return false
}

function disappear(el,fadeRate) {
	fadeRate = fadeRate || CONSTANTS.fadeIncr
	el.style.opacity = 1
	return animate(function(res) {
		var dimIt = function() {
			el.style.opacity = Math.max(parseFloat(el.style.opacity) - fadeRate, 0)
			if (el.style.opacity === '0') {
				res()
			}
			else {
				requestAnimationFrame(dimIt)
			}
		}
		requestAnimationFrame(dimIt)
	})
}

function dispatchPowerUp(cb,arg) {
	if (STATE.get('animating') || STATE.get('advancing')) {
		return
	}
	return cb(arg)
}

function flipPlayerRow() {
	if (STATE.get('animating')) return
	playSound('flip')
	var rowComp = COMPONENTS.get('playerRow'),
		origTransform = rowComp.getStyle('transform').split(' ').filter(function(transPart) {
			return !transPart.includes('rotate')
		}).join(' '),
		deg = 0
	rowComp.setStyle({
		transform: 'rotateY(0deg)'
	})
	return animate(function(res) {
		var pivot = function() {
			deg = Math.min(deg + CONSTANTS.rotateIncr, 180)
			rowComp.setStyle({
				transform: origTransform + ' rotateY(' + deg + 'deg)'
			})
			// 
			if (deg === 180) {
				res()
			}
			else {
				requestAnimationFrame(pivot)
			}
		}
		pivot()
	}).then(function() {
		rowComp.setStyle({
			transform: origTransform + ' rotateY(0deg)'
		})
		rowComp.reverseBlocks()
		EVENTS.trigger(EVENTS.names.powerUpUsed)
	})
}

function fromPx(str) {
	if (typeof str == 'number') return str
	else {
		return parseInt(str.slice(0,str.length - 2))
	}
}

function getRGBObj(str) {
	var pat = /rgb\((\d+),\s*(\d+),\s*(\d+)/
	var arr = str.match(pat)
	return {
		red: parseInt(arr[1]),
		green: parseInt(arr[2]),
		blue: parseInt(arr[3])
	}
}

function getRGBStr(obj) {
	return 'rgb(' + parseInt(obj.red) + ',' + parseInt(obj.green) + ',' + parseInt(obj.blue) + ')'
}

function handleLoss() {
	if (STATE.get('currentRows') > STATE.get('maxRows')) {
		// hacky way to prevent final, losing row from overflowing the grid
		$('#grid').querySelectorAll('.row')[STATE.get('maxRows')].style.display = 'none'
		// /hack
		saveScore()
		showPlayButton()
		$('#playerRowContainer').innerHTML = '<p id="loseMessage">YOU LOSE</p>'
		return 1
	}
	return 0
}

function handleRowScore(loc,timeout) {
	var points = STATE.getRowBlocks() * 10
	var score = new Score({
		bottomPos: toPx(loc),
		val: points
	})
	COMPONENTS.get('grid').node.appendChild(score.node)
	STATE.updateScore(points)
	return new Promise(function(res,rej) {
		setTimeout(res, timeout)
	}).then( function() {
		return disappear(score.node)
	})
}

function handleTutorialMatch(rowComp) {
	COMPONENTS.get('playerRow').removeClass('pulsing')
	STATE.set('animating',true)
	return new Promise(function(res) {
		if (STATE.get('tutorialStep') === 0) {
			res()
		}
		else {
			rowComp.setStyle({
				zIndex: 99
			})
			brieflyGlow(rowComp.node,COMPONENTS.get('playerRow').node).then(res)
		}
	}).then(function() {
		STATE.set('animating',false)
	})
}

function initLevel() {
	
	//update state
	STATE.resetLevelDefaults()
	STATE.set({
		level: STATE.get('level') + 1,
	})
	
	EVENTS.trigger(EVENTS.names.levelStart)
}

function invertBlock(blockNode) {
	return animate(function(res) {
		var currentColorName = blockNode.getAttribute('data-color'),
			targetColorName = currentColorName === 'red' ? 'blue' : 'red',
			currentColors = getRGBObj(SETTINGS.colors[currentColorName]),
			targetColors = getRGBObj(SETTINGS.colors[targetColorName]),
			redIncr = (targetColors.red - currentColors.red) / CONSTANTS.invertSpeed,
			greenIncr = (targetColors.green - currentColors.green) / CONSTANTS.invertSpeed,
			blueIncr = (targetColors.blue - currentColors.blue) / CONSTANTS.invertSpeed
				
		var blend = function() {
			currentColors.red = currentColors.red + redIncr
			currentColors.green = currentColors.green + greenIncr
			currentColors.blue = currentColors.blue + blueIncr
			blockNode.style.background = getRGBStr(currentColors)
			if (currentColors.red * redIncr >= targetColors.red * redIncr) { 
				// the above formula allows us to accommodate both those values that were 
					// ascending and those that were descending.
				blockNode.style.background = getRGBStr(targetColors)
				blockNode.setAttribute('data-color', targetColorName)
				res()
			}
			else {
				requestAnimationFrame(blend)
			}
		}
		requestAnimationFrame(blend)
	})
}

function invertPlayerRow() {
	playSound('invert')
	var playerRow = COMPONENTS.get('playerRow')
	var ps = playerRow.getBlocks().map(invertBlock)
	return Promise.all(ps).then(function(){
		EVENTS.trigger(EVENTS.names.powerUpUsed)
	})
}

function loadView(name) {
	playMusic()
	EVENTS.clear()
	$('#container').innerHTML = VIEWS[name].content
	STATE.set('view',name)
	VIEWS[name].init()
	if (name === 'play') {
		$('#reset').style.visibility = 'visible'
	}
	else {
		$('#reset').style.visibility = 'hidden'		
	}
}

function main() {
	if (STATE.getSavedState()) {
		STATE.load(STATE.getSavedState())
	}
	if ( onMobile() ) {
		// OVERRIDE EVERYTHING AND REDIRECT IF ON MOBILE
		loadView('buyIt')
		$("#goBack").style.display = 'none' 
		// and hide the hamburger
	}
	else {
		loadView('home')
	}
}

function pause(ms) {
	STATE.set({
		animating: true
	})
	return new Promise(function(res,rej) {
		setTimeout(function() {
			STATE.set({
				animating: false
			})
			res()
		},ms)
	})
}

function playMusic() {
	if (SETTINGS.music) {
		var songEl = $(STATE.get('song'))
		// if the song is not already playing
		if (!isPlaying(songEl)) {
			songEl.play()
		}
	}
}

function playSound(soundName) {
	if (SETTINGS.sounds) {
		var soundEl = $('#' + soundName + '_sound')
		if (isPlaying(soundEl)) {
			replay(soundEl)
		}
		else {
			soundEl.play()
		}
	}
}

function runLevel() {
	//update readout
	levelNo = COMPONENTS.get('levelNo')
	levelNo.write(CONSTANTS.numeralToWord[STATE.get('level')])

	//update widths
	var newWidth = STATE.getRowWidth()
	$('#gameContainer').style.width = newWidth
	$('#playerRowContainer').style.width = newWidth

	// refill rows
	var row = COMPONENTS.get('playerRow')
	row.fill()
	var grid = COMPONENTS.get('grid')
	grid.playerRow = row
	grid.clear()
	if (STATE.get('tutorialStep') === 0) {
		grid.addRow()
	}
}

function saveScore() {
	if (STATE.get('score') > localStorage.getItem('blockTwelveHighScore')) {
		localStorage.setItem('blockTwelveHighScore', STATE.get('score'))
	}
}

function shiftRow(way) {
	if (STATE.get('animating')) return 
	playSound('slide')
	STATE.set('animating',true) // seems redundant because animate (below) does this
		// but we're experiencing a bug wherein it allows you to shift mid shift
		// and ruins the row
	var rowComp = COMPONENTS.get('playerRow'),
		spd = STATE.get('sqSide') / 26,
		firstBlock = rowComp.getBlocks()[0],
		lastBlock = rowComp.getBlocks()[rowComp.getBlocks().length - 1],
		oldBlockWidth = STATE.get('sqSide'),
		newBlockWidth = 0

	if (way === 'left') {
		oldBlockComp = new Block().assignNode(firstBlock)
		newBlockComp = new Block().fill(oldBlockComp.get('data-color')).addSwitchListener()
		rowComp.node.appendChild(newBlockComp.node)
	}

	else {
		oldBlockComp = new Block().assignNode(lastBlock)
		newBlockComp = new Block().fill(oldBlockComp.get('data-color')).addSwitchListener()
		rowComp.node.insertBefore(newBlockComp.node, firstBlock)
	}	

	return animate(function(res) {
		var inchLeft = function() {
			newBlockWidth = Math.min(STATE.get('sqSide'), newBlockWidth + spd)
			oldBlockWidth = Math.max(oldBlockWidth - spd,0)
			oldBlockComp.setStyle({
				width: toPx(oldBlockWidth)
			})
			newBlockComp.setStyle({
				width: toPx(newBlockWidth)
			})
			if (oldBlockComp.getStyle('width') === '0px') {
				res()
			}
			else {
				requestAnimationFrame(inchLeft)
			}
		}
		inchLeft()
	}).then(function() {
		// THIS IS WHERE THE PROBLEM IS BUT I DON"T UNDERSTAND ENOUGH TO SOLVE THIS
		rowComp.node.removeChild(oldBlockComp.node)
		EVENTS.trigger(EVENTS.names.powerUpUsed)
	})
}

function showPlayButton() {
	appear($('#playButton'))
	$('#playButton').addEventListener(CONTACT_EVENT,function() {
		STATE.set(STATE.getDefaults())
		window.localStorage.setItem('bloq_state', null) 
		window.localStorage.setItem('bloq_grid', null) 
		window.localStorage.setItem('bloq_player_row', null) 
		loadView('play')
	})
}

function titleCase(str) {
	var titleWord = function(wrd) {return wrd[0].toUpperCase() + wrd.slice(1)}
	return str.split(' ').map(titleWord).join(' ')
}

function toPx(val) {
	return val.slice && val.slice(-2) === 'px' ? val : val + 'px'
}

// SET GLOBAL EVENT LISTENERS
$('#goBack').addEventListener(CONTACT_EVENT, function() {
	if (STATE.get('animating') || STATE.get('advancing')) return
	saveScore()
	loadView('home')
})

$('#reset').addEventListener(CONTACT_EVENT, function() {
	if (STATE.get('animating')) return
	STATE.reset()
	loadView('play')
})

main()

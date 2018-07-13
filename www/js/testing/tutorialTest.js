
var STEP_LIMIT = 14

function runTest() {
	// 0
	pause(PAUSE_TIME * 4)
		.then(clickBody)

	// 1
		.then(clickBody)

	// 2 
		.then(clickBody)

	// 3
		.then(blockClicker(5))

	// 4
		.then(clickBody)

	// 5
		.then(clickBody)

	// 6
		.then(blockClicker(2))

	// 7
		.then(clickBody)

	// 8
		.then(clickBody)

	// 9
		.then(clickBody)

	// 10
		.then(blockClicker(0))

	// 11
		.then(blockClicker(2))

	// 12
		.then(blockClicker(3))

	// 13
		.then(clickBody)

	// 14
		.then(clickBody)

	// 15
		.then(clickBody)

	// 16
		.then(clickBody)

	// 17

		// .then()
		// 	if (STATE.get('tutorialStep') == 17) {
		// 		grid.checkForMatch()
		// 		messageBox.fadeTextOut()
		// 			.then(function() {
		// 				messageBox.write([
		// 					"Powerups do NOT cause a new row to fall.",
		// 					"(Powerups are your friend.)"])
		// 				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 18) {
		// 		grid.checkForMatch()
		// 		deactivatePowerup($("#shiftRight"))
		// 		messageBox.fadeTextOut()
		// 			.then(function() {
		// 				messageBox.write([
		// 					"Now flip, baby, flip."])
		// 				return pause(PAUSE_TIME).then(messageBox.fadeTextIn.bind(messageBox))
		// 			})
		// 			.then(function() {
		// 				var flipCount = 0
		// 				$('#flip').addEventListener(CONTACT_EVENT, function() {
		// 					POWERUP_EVENTS.flip().then(function() {
		// 						advanceTutorial() 
		// 					})
		// 				})
		// 				$('#flip').classList.add('pulsing')
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 19) {
		// 		grid.checkForMatch()
		// 		deactivatePowerup($("#flip"))
		// 		messageBox.replaceText([
		// 					"What was red shall be blue, and what was blue shall be red."])
		// 			.then(function() {
		// 				$("#invert").classList.add('pulsing')
		// 				$("#invert").addEventListener(CONTACT_EVENT, function() {
		// 					POWERUP_EVENTS.invert().then(function() {
		// 						advanceTutorial()
		// 					})
		// 				})
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 20) {
		// 		grid.checkForMatch()
		// 		deactivatePowerup($('#invert'))
		// 		messageBox.replaceText([
		// 			"When you clear the board using power-ups, you get BONUS POINTS!"])
		// 			.then(function() {
		// 				$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 21) {
		// 		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		// 		grid.addRow('red blue red blue red blue red'.split(' '))	
		// 			.then(function() {
		// 				messageBox.replaceText([
		// 					"And a new row falls..."])
		// 					.then(function() {
		// 						$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
		// 					})
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 22) {
		// 		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		// 		messageBox.replaceText([
		// 			"Every time you clear a new level, the going gets tougher.",
		// 			"Good luck!"])
		// 			.then(function() {
		// 				$("body").addEventListener(CONTACT_EVENT, advanceTutorial)
		// 			})
		// 	}

		// 	if (STATE.get('tutorialStep') == 23) {
		// 		$("body").removeEventListener(CONTACT_EVENT, advanceTutorial)	
		// 		showPlayButton()
		// 	}
		// }

	function clickBody() {
		return pause(PAUSE_TIME * 4).then(function() {
			return new Promise(function(res,rej) {
				if (STATE.get('tutorialStep') > STEP_LIMIT) {
					return res()
				}
				$("body").click()
				return res()
			})
		})
	}

	function blockClicker(pos) {
		function clickBlock() {
			return pause(PAUSE_TIME * 4).then(function() {
				return new Promise(function(res,rej) {
					if (STATE.get('tutorialStep') > STEP_LIMIT) {
						return res()
					}
					COMPONENTS.get('playerRow').blocks[pos].node.click()
					return res()
				})
			})
		}
		return function() {
			return clickBlock(pos)
		}
	}
}

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;

// Citation and thank yous:
// F1 race data from the great project jolpica-f1, which took over where ergast left off. Check out that project here: https://github.com/jolpica/jolpica-f1

const dataUrl = "https://api.jolpi.ca/ergast/f1/current/next.json";
const raceIdx = 0
const now = new Date()

//// for testing// 
// const dataUrl = "https://api.jolpi.ca/ergast/f1/current/races.json";// 
// const raceIdx = 6

let options = {
    width: 170,
    font:{
        header:	["HiraginoSans-W7", 10],
        title:	["HiraginoSans-W6", 9],
        body:	["HiraginoSans-W4", 9]
    },
    // Edit this for column resize
    padding:{
        left:	-4,
        right:	-4
    },
    spaceBetweenRows: 2,
    spaceBetweenColumns: 0
}

function finished(time){	return time<now?.5:1	}

let widget = await createWidget();
Script.setWidget(widget);
//// for testing
widget.presentAccessoryRectangular(); 
Script.complete();

async function formatSessionDay(sessionDay) {
    var options = { weekday: 'short' };
    return sessionDay.toLocaleDateString('en-US', options);
}

async function formatSessionDate(sessionDate) {
    var options = { month: 'numeric', day: 'numeric' };
    return sessionDate.toLocaleDateString('en-US', options);
}

async function formatSessionTime(sessionTime) {
    var options = { hour12: false, hour: '2-digit', minute:'2-digit' };
    return sessionTime.toLocaleTimeString('en-US', options);
}

async function createWidget() {
	const widget = new ListWidget();
	const data = await new Request(dataUrl).loadJSON();
	const race = data.MRData.RaceTable.Races[raceIdx]
	const raceDateTime = new Date(`${race.date}T${race.time}`)
	const fp1 = race.FirstPractice
	const fp1DateTime = new Date(`${fp1.date}T${fp1.time}`)
	const quali = race.Qualifying
	const qualiDateTime = new Date(`${quali.date}T${quali.time}`)

	let sprintQ, fp2sprintQDateTime, sprint, fp3sprintDateTime, fp2, fp3, sprintOrSP, isSprint = Object.hasOwn(race,'Sprint')

	let dateTime = []
		dateTime[0] = {
			title: 'FP1',
			day:	await formatSessionDay(fp1DateTime),
			date:	await formatSessionDate(fp1DateTime),
			time:	await formatSessionTime(fp1DateTime),
			raw:	fp1DateTime
		}

		sprintOrSP = isSprint?race.SprintQualifying:race.SecondPractice
		fp2sprintQDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)

		dateTime[1] = {
			title:	isSprint?'SQ':'FP2',
			day:	await formatSessionDay(fp2sprintQDateTime),
			date:	await formatSessionDate(fp2sprintQDateTime),
			time:	await formatSessionTime(fp2sprintQDateTime),
			raw:	fp2sprintQDateTime
		}

		sprintOrSP = isSprint?race.Sprint:race.ThirdPractice
		fp3sprintDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)

		dateTime[2]= {
			title:	isSprint?'SPR':'FP3',
			day:	await formatSessionDay(fp3sprintDateTime),
			date:	await formatSessionDate(fp3sprintDateTime),
			time:	await formatSessionTime(fp3sprintDateTime),
			raw:	fp3sprintDateTime
		}

		dateTime[3] = {
			title:	'Quali',
			day:	await formatSessionDay(qualiDateTime),
			date:	await formatSessionDate(qualiDateTime),
			time:	await formatSessionTime(qualiDateTime),
			raw:	qualiDateTime
		}
		dateTime[4] = {
			title:	'Race',
			day:	await formatSessionDay(raceDateTime),
			date:	await formatSessionDate(raceDateTime),
			time:	await formatSessionTime(raceDateTime),
			raw:	raceDateTime
		}

	const headerStack = widget.addStack()
	const headerText = race.raceName.toUpperCase()
	const headerCell = headerStack.addStack()
		  //headerCell.backgroundColor = HEADER_COLOR
		  headerCell.size = new Size(options.width,0)
		  headerCell.addSpacer()

		  const textElement = headerCell.addText(headerText)
				textElement.font = new Font(...options.font.header)
				textElement.minimumScaleFactor = 0.5
				textElement.lineLimit = 1

		  headerCell.addSpacer()

	widget.addSpacer(options.spaceBetweenRows)

	let body = widget.addStack()
		//change: width,height (0 = auto size)
		body.size = new Size(options.width,0)
// 		body.cornerRadius = 1

	for(let column=0; column<dateTime.length; column++){
		let currentColumn = body.addStack()
			currentColumn.layoutVertically()

			//adjust column padding
			currentColumn.setPadding(0,options.padding.left,0,options.padding.right)

		for(let row in dateTime[column]){
			if(row=='raw') continue
			let currentCell = currentColumn.addStack()
				//left side spacer for Text
				currentCell.addSpacer()
			let cellText = currentCell.addText(dateTime[column][row])
				//if row==0, use title font, else use body font
				cellText.font = row=='title'?new Font(...options.font.title):new Font(...options.font.body)
				// cellText.textColor = Color.white()
				cellText.lineLimit = 1
				cellText.minimumScaleFactor = .5
				cellText.textOpacity = finished(dateTime[column].raw)
			//right side spacer for Text
			currentCell.addSpacer()
            //space between title, fp2, etc
            currentColumn.addSpacer(options.spaceBetweenRows)
		}
        //space bewtween columns
		currentColumn.addSpacer(options.spaceBetweenColumns)
	}

	return widget;
}

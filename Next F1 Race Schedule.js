// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;
const dataUrl = "https://api.jolpi.ca/ergast/f1/current/next.json";
const raceIdx = 0
//// for testing
// const dataUrl = "https://api.jolpi.ca/ergast/f1/current/races.json";// 
// const raceIdx = 4

let widget = await createWidget();
Script.setWidget(widget);
//// for testing
// widget.presentMedium() //Small,Medium,Large,ExtraLarge   
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
    const now = new Date()
    let headerFont = new Font("Hiragino Sans W7", 16)
    let titleFont = new Font("Hiragino Sans W7", 10)
    let bodyFont = new Font("Hiragino Sans W6", 10)

    const headerStack = widget.addStack()
    headerStack.layoutHorizontally()
    const headerText = race.raceName.toUpperCase()
    const headerCell = headerStack.addStack()
    headerCell.layoutHorizontally()
    //headerCell.backgroundColor = HEADER_COLOR
    headerCell.size = new Size(175,0)
    headerCell.addSpacer()
    //headerCell.lineLimit = 1
      
    const textElement = headerCell.addText(headerText)
	textElement.centerAlignText()
    textElement.font = headerFont
    textElement.minimumScaleFactor = .1
    textElement.lineLimit = 1

    headerCell.addSpacer()
    //headerStack.addSpacer(2) // between cells
    widget.addSpacer(4);

    let body = widget.addStack()
	body.layoutVertically()
	//change: width,height (0 = auto size)
	body.size = new Size(175,0)
	body.cornerRadius = 1
	//body.borderWidth = 1
	//body.borderColor = Color.red()
	//top spacer before first row
	//body.addSpacer()
    
    let cell = [], maxRows = 4, maxColumns = 5
    
    for(let i=0; i<maxRows; i++){
        let currentRow = body.addStack()
        currentRow.layoutHorizontally()
    
        //left spacer before first column
        //currentRow.addSpacer()
      
        cell[i] = []
        for(let k=0; k<maxColumns; k++){
			//keep the cells all the same height
            let currentCell = currentRow.addStack()
			//vertically arrange padding,text-line,padding
			currentCell.layoutVertically()
			//top spacer above cell text
			//currentCell.addSpacer()
			//currentCell.borderWidth = 1
			//currentCell.borderColor = Color.yellow()
			//currentCell.backgroundColor = (i+k)%2?Color.gray():Color.white()
        
            //textLine stack: spacer,text,spacer; keep text centered
            let cellTextLine = currentCell.addStack()
			cellTextLine.layoutHorizontally()
			//cellTextLine.borderWidth=1
			//cellTextLine.borderColor=Color.cyan()
			//left spacer for cell text-line
			cellTextLine.addSpacer()
        
            //text in the cell
            cell[i][k] = cellTextLine.addText("")
            cell[i][k].centerAlignText()
            cell[i][k].font = bodyFont
            cell[i][k].textColor = Color.white()
            cell[i][k].lineLimit = 1
            cell[i][k].minimumScaleFactor = .2
            
            //right spacer for cell text-line
            cellTextLine.addSpacer()
        
            //bottom spacer below cell text
            //currentCell.addSpacer()
        
            //1px spacer between columns
			//if(k<maxColumns) currentRow.addSpacer(1)
          }
    
      //right spacer after last column
      //currentRow.addSpacer()
    
      //1px space between rows
      if(i<maxRows) body.addSpacer(4)
    }

	//bottom spacer after last row
	//body.addSpacer()

    if (Object.hasOwn(race, "Sprint")) {
        fp2sq = "SQ"
        sprintQ = race.SprintQualifying
        fp2sprintQDateTime = new Date(`${sprintQ.date}T${sprintQ.time}`)
        fp3sprint = "SPR"
        sprint = race.Sprint
        fp3sprintDateTime = new Date(`${sprint.date}T${sprint.time}`)
    } else {
        fp2sq = "FP2"
        fp2 = race.SecondPractice
        fp2sprintQDateTime = new Date(`${fp2.date}T${fp2.time}`)
        fp3sprint = "FP3"
        fp3 = race.ThirdPractice
        fp3sprintDateTime = new Date(`${fp3.date}T${fp3.time}`)
    }


    if (fp1DateTime < now) {
        for(let i=0; i<maxRows; i++) { 
            cell[i][0].textColor = Color.gray()
        }
    }

    if (fp2sprintQDateTime < now) {
        for(let i=0; i<maxRows; i++) { 
            cell[i][1].textColor = Color.gray()
        }
    }
    
    if (fp3sprintDateTime < now) {
        for(let i=0; i<maxRows; i++) { 
            cell[i][2].textColor = Color.gray()
        }
    }
    
    if (qualiDateTime < now) {
        for(let i=0; i<maxRows; i++) { 
            cell[i][3].textColor = Color.gray()
        }
    }

    if (raceDateTime < now) {
        for(let i=0; i<maxRows; i++) { 
            cell[i][4].textColor = Color.gray()
        }
    }

	for(let k=0; k<maxColumns; k++) { 
	cell[0][k].font = titleFont
	}

	cell[0][0].text = "FP1"
	cell[1][0].text = await formatSessionDay(fp1DateTime)
	cell[2][0].text = await formatSessionDate(fp1DateTime)
	cell[3][0].text = await formatSessionTime(fp1DateTime)

	cell[0][1].text = await fp2sq
	cell[1][1].text = await formatSessionDay(fp2sprintQDateTime)
	cell[2][1].text = await formatSessionDate(fp2sprintQDateTime)
	cell[3][1].text = await formatSessionTime(fp2sprintQDateTime)

	cell[0][2].text = await fp3sprint
	cell[1][2].text = await formatSessionDay(fp3sprintDateTime)
	cell[2][2].text = await formatSessionDate(fp3sprintDateTime)
	cell[3][2].text = await formatSessionTime(fp3sprintDateTime)

	cell[0][3].text = "Qual"
	cell[1][3].text = await formatSessionDay(qualiDateTime)
	cell[2][3].text = await formatSessionDate(qualiDateTime)
	cell[3][3].text = await formatSessionTime(qualiDateTime)

	cell[0][4].text = "Race"
	cell[1][4].text = await formatSessionDay(raceDateTime)
	cell[2][4].text = await formatSessionDate(raceDateTime)
	cell[3][4].text = await formatSessionTime(raceDateTime)

    return widget;
}

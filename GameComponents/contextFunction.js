export const savingRecordTime = async (currentTime, currentLevel) => {
  const lvl = currentLevel.toLowerCase();

  const respone = await fetch(`http://localhost:3000/records/${lvl}`);
  const data = await respone.json();

  if(data.timeRecord === null) {
   
    switch(lvl) {
      case 'easy':
        sendtoDataBase(currentTime, lvl);
      break;
      case 'medium':
        sendtoDataBase(currentTime, lvl);
      break;
      case 'expert':
        sendtoDataBase(currentTime, lvl);
      break;
    }
  } else if(currentTime < data.timeRecord) {
    const lvl = currentLevel.toLowerCase();

    switch(lvl) {
      case 'easy':
        sendtoDataBase(currentTime, lvl);
      break;
      case 'medium':
        sendtoDataBase(currentTime, lvl);
      break;
      case 'expert':
        sendtoDataBase(currentTime, lvl);
      break;
    }
  }

  return 1
}

const sendtoDataBase = async (theBestTime, currentLevel) => {
  const data = {
    timeRecord: theBestTime
  }

  await fetch(`http://localhost:3000/records/${currentLevel}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}
const SPREADSHEET_ID = '1RTpY9oJp9h1fKZll4upMOmdwlMVZ_ETfWcADcF4b2M8'; 
const CHEFS_SHEET_NAME = 'Chefs';
const HISTORY_SHEET_NAME = 'Game_History';
const INITIAL_BALANCE = 0;

// This function runs when the web app receives a GET request (for balance verification).
function doGet(e) {
  try {
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID' || SPREADSHEET_ID.length < 20) {
      throw new Error("FATAL: The SPREADSHEET_ID has not been set correctly.");
    }

    const action = e.parameter.action;
    
    if (action === 'getBalance') {
      const username = e.parameter.username;
      
      if (!username) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Username is required'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const chefsSheet = ss.getSheetByName(CHEFS_SHEET_NAME);
      const data = chefsSheet.getDataRange().getValues();
      
      // Find user by checking column B for username (index 1)
      const userRow = data.find(row => row[1] && row[1].toLowerCase() === username.toLowerCase());
      
      if (!userRow) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'User not found'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Return balance from column D (index 3)
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        balance: userRow[3]
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Server Error: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// This function runs when the web app receives a POST request.
function doPost(e) {
  try {
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID' || SPREADSHEET_ID.length < 20) {
      throw new Error("FATAL: The SPREADSHEET_ID has not been set correctly. Please paste your Google Sheet ID into the script on line 1.");
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const chefsSheet = ss.getSheetByName(CHEFS_SHEET_NAME);
    const historySheet = ss.getSheetByName(HISTORY_SHEET_NAME);

    let response;

    switch (action) {
      case 'signup':
        response = handleSignup(chefsSheet, data.username, data.pin);
        break;
      case 'login':
        response = handleLogin(chefsSheet, data.username, data.pin);
        break;
      case 'logGame':
        response = handleLogGame(chefsSheet, historySheet, data.username, data.game, data.bet, data.reward);
        break;
      default:
        response = { status: 'error', message: 'Invalid action.' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Server Error: ' + error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles user signup
function handleSignup(sheet, username, pin) {
  if (!sheet || !username || !pin) {
    return { status: 'error', message: 'Missing required fields for signup.' };
  }
  const data = sheet.getDataRange().getValues();
  // Check column B for username (index 1)
  const userExists = data.some(row => row[1] && row[1].toLowerCase() === username.toLowerCase());

  if (userExists) {
    return { status: 'error', message: 'Chef name already taken. Please choose another.' };
  }

  // Generate a simple unique ID using the current timestamp
  const chefId = new Date().getTime();

  // Append data in the correct order: Chef ID, Username, PIN, Balance
  sheet.appendRow([chefId, username, pin, INITIAL_BALANCE]);
  
  return {
    status: 'success',
    message: 'Account created successfully!',
    data: { username: username, balance: INITIAL_BALANCE }
  };
}

// Handles user login
function handleLogin(sheet, username, pin) {
  if (!sheet || !username || !pin) {
    return { status: 'error', message: 'Missing required fields for login.' };
  }
  const data = sheet.getDataRange().getValues();
  // Find user by checking column B for username (index 1)
  const userRow = data.find(row => row[1] && row[1].toLowerCase() === username.toLowerCase());

  if (!userRow) {
    return { status: 'error', message: 'Chef name not found.' };
  }

  // Check PIN in column C (index 2)
  if (userRow[2].toString() !== pin.toString()) {
    return { status: 'error', message: 'Incorrect PIN.' };
  }
  
  return {
    status: 'success',
    message: 'Login successful!',
    // Return username from column B (index 1) and balance from column D (index 3)
    data: { username: userRow[1], balance: userRow[3] }
  };
}

// Handles logging game results
function handleLogGame(chefsSheet, historySheet, username, game, bet, reward) {
  if (!chefsSheet || !historySheet || !username) {
     return { status: 'error', message: 'Missing required fields for logging.' };
  }
  
  const data = chefsSheet.getDataRange().getValues();
  let userRowIndex = -1;
  
  // Find user row index by checking column B for username (index 1)
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] && data[i][1].toLowerCase() === username.toLowerCase()) {
      userRowIndex = i + 1; // 1-based index for sheet ranges
      break;
    }
  }

  if (userRowIndex === -1) {
    return { status: 'error', message: 'User not found for logging.' };
  }

  // Get current balance from column D (index 3)
  const currentBalance = parseFloat(data[userRowIndex - 1][3]) || 0;
  const betAmount = parseFloat(bet) || 0;
  const rewardAmount = parseFloat(reward) || 0;
  
  // Calculate new balance: current - bet + reward
  const newBalance = currentBalance - betAmount + rewardAmount;
  
  Logger.log('Balance update: ' + currentBalance + ' - ' + betAmount + ' + ' + rewardAmount + ' = ' + newBalance);
  
  // Update balance in column D (the 4th column)
  chefsSheet.getRange(userRowIndex, 4).setValue(newBalance);

  // Get the Chef ID from the found user row (Column A, index 0)
  const chefId = data[userRowIndex - 1][0];

  // Generate a unique history ID using the current timestamp
  const historyId = new Date().getTime();

  // Log to History sheet: History_ID, Game, Chef_ID, Played_At, Wager, Payout
  historySheet.appendRow([historyId, game, chefId, new Date(), betAmount, rewardAmount]);
  
  Logger.log('Game logged successfully for user: ' + username);
  
  return {
    status: 'success',
    message: 'Game logged successfully.',
    data: { newBalance: newBalance }
  };
}


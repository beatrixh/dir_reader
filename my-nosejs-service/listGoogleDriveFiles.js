const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

// Set up credentials and token
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json'; // Store your token file in the same directory

// Load client secrets from a file
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('Error loading client secret file:', err);

  authorize(JSON.parse(content), listFiles);
});

// Authorize using the provided credentials
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // Check if we have a previously saved token
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

// Get a new access token using OAuth2
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token:', err);
      oAuth2Client.setCredentials(token);

      // Store the token for later use
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error('Error writing token file:', err);
        console.log('Token stored to', TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
}

// List files in the specified folder
function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the Google Drive folder ID: ', (folderId) => {
    rl.close();

    drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name)',
    }, (err, res) => {
      if (err) return console.error('The API returned an error:', err);

      const files = res.data.files;
      if (files.length) {
        console.log('Files in the folder:');
        files.forEach((file) => {
          // List users who have access to the file
          listFilePermissions(drive, file.id, file.name);
          // Download the file
          // downloadFile(file.id);
        });
      } else {
        console.log('No files found.');
      }
    });
  });
}

// List users who have access to the file
function listFilePermissions(drive, fileId, fileName) {
  drive.permissions.list({
    fileId,
    fields: 'permissions(id, emailAddress)',
  }, (err, res) => {
    if (err) return console.error('Error listing permissions:', err);

    console.log(`${fileName}`);
    const permissions = res.data.permissions;
    if (permissions.length) {
      console.log('Users with access:');
      permissions.forEach((permission) => {
        console.log(`    ${permission.emailAddress} (${permission.id})`);
      });
    } else {
      console.log('No users with access found.');
    }
  });
}

async function downloadFile(realFileId) {
  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app

  const {GoogleAuth} = require('google-auth-library');
  const {google} = require('googleapis');

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({version: 'v3', auth});

  fileId = realFileId;
  try {
    const file = await service.files.get({
      fileId: fileId,
      alt: 'media',
    });
    console.log(file.status);
    return file.status;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

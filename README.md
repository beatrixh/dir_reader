# dir_reader
Reads files in a google drive folder and lists users with access, then downloads the files.

Note: download functionality currently offline.

## To use ##

1. Open terminal
2. Navigate to the desired directory in which you want this repository to live:
`cd ~/`
3. Clone this repository into your directory:
`git clone https://github.com/beatrixh/dir_reader.git`
4. Edit the `credentials.json` file to populate the client ID and secret/
5. Navigate into `my-nosejs-service`:
`cd dir_reader/my-nosejs-service`
6. Run `nose listGoogleDriveFiles.js`
7. Respond to the prompt requesting a google drive folder ID.


Note: given a link to a google drive folder:
``https://drive.google.com/drive/u/0/folders/abcdefg``
The corredponding folder ID is: `abcdefg`

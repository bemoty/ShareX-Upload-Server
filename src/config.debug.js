export default {
  "key": [""],
  "domain": "*",
  "puploadKeyGenLength": 64,
  "public": false,
  "maxUploadSize": 50,
  "markdown": true,
  "port": 8080,
  "fileNameLength": 4,
  "shortUrlLength": 3,
  "ratelimit": 1000,
  "dateURLPath": false,
  "allowed":[
    "png", "jpg", "gif", "mp4", "mp3", "jpeg", "tiff", "bmp", "ico", "psd", "eps", "raw", "cr2", "nef", "sr2", "orf", "svg", "wav", "webm", "aac", "flac", "ogg", "wma", "m4a", "gifv"
  ],
  "admin":{
    "key": ["admin pass key goes here"],
    "maxUploadSize": 1024,
    "allowed": [
    "png", "jpg", "gif", "mp4", "mp3","jpeg", "tiff", "bmp", "ico", "psd", "eps", "raw", "cr2", "nef", "sr2", "orf", "svg", "wav", "webm", "aac", "flac", "ogg", "wma", "m4a", "gifv", "html"
     ]
  },
  "paste": {
    "maxUploadSize": 20
  }
}

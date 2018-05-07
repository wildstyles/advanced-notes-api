const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const Busboy = require('busboy');
const os = require("os");
const path = require("path");
const fs = require('fs');

const gcconfig ={
  projectId: "images-storage-b58a6",
  keyFilename: "firebase-config.json"
};

const gcs = require("@google-cloud/storage")(gcconfig);

exports.uploadFile = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(500).json({
        message: "Not allowed"
      });
    }
    const busboy = new Busboy({ headers: req.headers });
    let uploadData = null;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const filepath = path.join(os.tmpdir(), filename);
      uploadData = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {
      const bucket = gcs.bucket("images-storage-b58a6.appspot.com");
      bucket
        .upload(uploadData.file, {
          uploadType: "media",
          public: true,
          metadata: {
            metadata: {
              contentType: uploadData.type
            }
          }
        })
        .then((file) => {
          res.status(200).json({
            media: file[0].metadata.mediaLink
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    });
    busboy.end(req.rawBody);
  });
});

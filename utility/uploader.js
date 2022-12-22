const multer = require('multer');
const uuid = require('uuid');
const maxSize = '10 * 1024 * 1024';
class Uploader {
  constructor() {
  }

 static storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/avatars`);
    },
    filename: function (req, file, cb) {
      req.avatarId = uuid.v4();
      const suffix = file.originalname.split('.').pop();
      cb(null, `${req.avatarId}.${suffix}`);
    }
  });

 static uploadAvatar = multer({storage:this.storageAvatar, limits:{fileSize: maxSize}});

}


module.exports = Uploader;
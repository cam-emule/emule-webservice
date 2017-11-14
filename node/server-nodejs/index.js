/**

 The Web Service for the Emule Project
 Fergus Leen Jan 2017 (fl376@cl.cam.ac.uk)
 
*/
//SERVICE NAME AUTOSET IN INSTALL.SH HERE:-

var config = require("./config");

var rootdir = config.rootdir;
var express = require("express");
var multer = require("multer");
var fs = require("fs");
var path = require("path");
var os = require("os");
var passport = require("passport");
var HttpBasicAuth = require("passport-http").BasicStrategy;
var app = express();
var morgan = require("morgan");
app.use(morgan("combined"));

var mongoose = require("mongoose");
mongoose.set("debug", true);
// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB
console.log("Connecting to Mongo on " + config.mongoURI);
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("connection succesful"))
  .catch(err => console.log("Mongo Unavailable - Assuming Remote")); //console.error(err));

var UPLOAD_PATH = config.upload_path;
var SERVER_PORT = config.port;
//Not currently used.
var basicAuthUser = {
  username: "test",
  password: "pass"
};

function printRequestHeaders(req) {
  console.log("\nReceived headers");
  console.log("----------------");

  for (var key in req.headers) {
    console.log(key + ": " + req.headers[key]);
  }

  console.log("");
}

function printRequestParameters(req) {
  console.log("\nReceived Parameters");
  console.log("-------------------");

  for (var key in req.body) {
    console.log(key + ": " + req.body[key]);
  }

  if (Object.keys(req.body).length === 0) console.log("no text parameters\n");
  else console.log("");
}

function getEndpoints(ipAddress) {
  return (
    "HTTP/Multipart:              http://" +
    ipAddress +
    ":" +
    SERVER_PORT +
    "/upload/multipart\n" +
    "HTTP/Multipart (Basic Auth): http://" +
    ipAddress +
    ":" +
    SERVER_PORT +
    "/upload/multipart-ba\n"
  );
}

function printAvailableEndpoints() {
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function(ifname) {
    ifaces[ifname].forEach(function(iface) {
      // skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ("IPv4" !== iface.family || iface.internal !== false) {
        return;
      }

      console.log(getEndpoints(iface.address));
    });
  });
}

var multipartReqInterceptor = function(req, res, next) {
  console.log("\n\nHTTP/Multipart Upload Request from: " + req.ip);
  printRequestHeaders(req);

  next();
};

// configure passport for Basic Auth strategy
passport.use(
  "basic-admin",
  new HttpBasicAuth({ realm: "Upload Service" }, function(
    username,
    password,
    done
  ) {
    if (
      username === basicAuthUser.username &&
      password === basicAuthUser.password
    ) {
      return done(null, basicAuthUser);
    }
    return done(null, false);
  })
);

app.use(passport.initialize());
var useBasicAuth = passport.authenticate("basic-admin", { session: false });

// configure multer for upload management
var fileUploadCompleted = false;
var multerFiles = multer({
  dest: UPLOAD_PATH,
  rename: function(fieldname, filename) {
    return filename;
  },

  onParseEnd: function(req, next) {
    printRequestParameters(req);

    next();
  },

  onFileUploadStart: function(file) {
    console.log(
      "Started file upload\n  parameter name: " +
        file.fieldname +
        "\n  file name: " +
        file.originalname +
        "\n  mime type: " +
        file.mimetype
    );
  },

  onFileUploadComplete: function(file) {
    var fullPath = path.resolve(UPLOAD_PATH, file.originalname);
    console.log(
      "Completed file upload\n  parameter name: " +
        file.fieldname +
        "\n  file name: " +
        file.originalname +
        "\n  mime type: " +
        file.mimetype +
        "\n  in: " +
        fullPath
    );
    fileUploadCompleted = true;
  }
});

app.get("/", function(req, res) {
  res.end(config.servicename);
});

/**
Remote call. This zips  the local bSMTP files and returns a URL
unch the shell command to tar bsmtp files
return JSON to client. 

*/
app.get("/get-bundle-list", function(req, res) {
  var exec = require("child_process").exec;
  var cmd = rootdir + "/bin/zip_mailup.sh " + config.servicename;
  var filename;
  exec(cmd, function(error, stdout, stderr) {
    // command output is in stdout
    console.log("Compresing mail " + stdout + error + stderr);
    filename = stdout;
    if (!stdout) {
      res.end("[]");
      console.log("Nothing to do");
    } else {
      res.end(stdout);
    }
  });
});

/**
	Gateway Call
	getBundleByName(ap)
	The android app chooses which remote AP's to sync with,
	This call will check the /var/spool/mail directory for the 
	ap(.domain.com). If the file is empty or nonexistant, return null,
	if there is data, zip and mail as above.
*/
app.get("/get-bundle-byname", function(req, res) {
  try {
    var filesize = getFilesizeInBytes("/var/spool/mail/" + req.query.apname);
  } catch (err) {
    console.log(
      "\n\n No file found. Bundle request from: " +
        req.ip +
        " for " +
        req.query.apname +
        " fs=" +
        filesize
    );

    res.end("");
  }

  console.log(
    "\n\nbundle request from: " +
      req.ip +
      " for " +
      req.query.apname +
      " fs=" +
      filesize
  );
  if (filesize > 0) {
    var exec = require("child_process").exec;
    var cmd = rootdir + "/bin/gateway_zip_mailup.sh " + req.query.apname;
    var filename;
    exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
      console.log("Compresing mail " + stdout + error + stderr);
      filename = stdout;
      res.end(stdout);
    });
  }
});

/**
 Gateway getAvailableBundles
 Return a simple array list of names of avaiable bundles.
 
 26/9/2017 - Update to filter returned bundles by Mule object
 -- Temporary and unsecure. To be revisited when security added.
 
 */

var Mule = require("./models/Mule.js");

app.get("/get-available-bundles", function(req, res) {
  var email = req.query.email;
  //retrieve Mule Object by email

  if (email != "") {
    Mule.findOne({ email: email }, { subdomains: 1 })
      .populate("subdomains", "subdomain")
      .exec(function(err, mule) {
        if (err) console.log(err);
        if (mule == null) {
          //create new mule
          Mule.create({ email: email }, function(err, mule) {
            if (err) {
              console.log(err);
            } else {
              console.log("Created New Mule " + email);
              getMailFiles(res, mule);
            }
          }); //Mule.create
        } else {
          getMailFiles(res, mule);
        }
      }); //Mule.findone
  } //if
}); //app.get

function getMailFiles(res, mule) {
  fs.readdir("/var/spool/mail/", function(err, items) {
    var resfiles = [];
    var x = 0;
    for (var i = 0; i < items.length; i++) {
      // var filesize = getFilesizeInBytes("/var/spool/mail/"+items[i]);
      if (
        items[i].includes(config.overalldomain) &&
        !items[i].includes("mail")
      ) {
        resfiles[x++] = items[i];
      }
    }
    filterOnMule(mule, resfiles, res);
  });
}

function filterOnMule(mule, mailFiles, res) {
  var resMailFiles = [];
  var x = 0;
  if (mule.subdomains.length == 0) {
    //We have no subdomains for this mule, show all.
    //resMailFiles=mailFiles;
    console.log("Disabled global mules.");
  } else {
    //Filter when subdomains are non zero
    for (var i = 0; i < mule.subdomains.length; i++) {
      console.log(mule.subdomains[i].subdomain);
      if (
        mailFiles.indexOf(mule.subdomains[i].subdomain + ".mule.global") > -1
      ) {
        resMailFiles[x++] =
          mailFiles[
            mailFiles.indexOf(mule.subdomains[i].subdomain + ".mule.global")
          ];
      } else {
        //Not in the array Do Nothing.
      }
    }
  }

  res.end(JSON.stringify(resMailFiles));
}

// End 26/9/2017 update - Fergus Leen

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

var multipartUploadHandler = function(req, res) {
  if (fileUploadCompleted) {
    fileUploadCompleted = false;
    res.header("transfer-encoding", ""); // disable chunked transfer encoding
    var exec = require("child_process").exec;
    var cmd = rootdir + "/bin/send_mail_from_zip.sh";
    exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
      console.log("Sending Mails " + stdout + error + stderr);
      res.end(stdout);
    });
  }
};

// handle multipart uploads
app.post(
  "/upload/multipart",
  multipartReqInterceptor,
  multerFiles,
  multipartUploadHandler
);
app.post(
  "/upload/multipart-ba",
  useBasicAuth,
  multipartReqInterceptor,
  multerFiles,
  multipartUploadHandler
);

var server = app.listen(SERVER_PORT, function() {
  console.log(
    "Emule server started. Listening on all interfaces on port " +
      server.address().port
  );

  //    console.log("\nThe following endpoints are available\n");
  //  printAvailableEndpoints();
});
var accesspoints = require("./routes/accesspoints");
app.use("/accesspoints", accesspoints);

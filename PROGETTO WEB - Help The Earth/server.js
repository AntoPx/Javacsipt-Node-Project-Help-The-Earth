'use strict';
const express = require('express');
const morgan = require('morgan');
const dao = require('./dao.js');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const fs = require('fs');
var multer = require('multer');
var upload = multer();

//Login
passport.use(new LocalStrategy(
  function(username, password, done) {
    dao.getUser(username, password).then(({user, check}) => {
      if (!user) {
        return done(null, false, { message: 'Username errato!' });
      }
      if (!check) {
        return done(null, false, { message: 'Password errata!' });
      }
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  dao.getUserById(id).then(user => {
    done(null, user);
  });
});

const app = express();
const port = 3000;

// set-up logging
app.use(morgan('dev'));

// check if user is authenticated
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res
  .status(401)
  .json({statusCode: 401, message: "Not authenticated"});
};

//process body content as JSON
app.use(express.json());

//set up the 'public' component as a static website
app.use(express.static('public'));

// set up the session
app.use(session({
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false 
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// == REST API == //

//GET /projects
app.get('/api/projects', (req, res) => {
  dao.getProjects()
    //Sintassi per gestire le promise
    .then((proj) => res.json(proj))
    .catch((err) => {
      res.status(500).json({
          errors: [{msg: err}],
      });
    });
});

//GET project/image
//Controllare 
//:file, mi aspetto un valore variabile
app.get('/File/proj_img/:file', (req, res) => {
  var filePath = path.join(__dirname, '/File/' + req.params.file);
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'image/jpg',
    'Content-Lenght': stat.size 
  });
  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
})

//GET /project/:projectId
app.get('/api/project/:projectId', (req, res) => {
  dao.getProject(req.params.projectId)
    .then((project) => {
      if(project.error)
        res.status(404).json(project);
      else
        res.json(project);
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{params: 'Server', msg: err}]
      })
    });
});

// GET /project/:projectId/documents
app.get('/api/project/:projectId/documents', (req, res) => {
  dao.getDocumentsByProject(req.params.projectId)
    .then((documents) => {
      if(documents.error)
        res.status(404).json(documents);
      else {
        res.json(documents);
      }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{params: 'Server', msg: err}]
      })
    });
});

// GET /document/:documentId
app.get('/api/document/:documentId', (req, res) => { // TODO login
  dao.getDocument(req.params.documentId)
    .then((document) => {
      if(document.error)
        res.status(404).json(document);
      else {
        res.json(document);
      }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{params: 'Server', msg: err}]
      })
    });
});

// POST /docuents
app.post('/api/documents', (req, res) => {
  const document = req.body.document;
  dao.addDocument(document)
    .then((id) => res.status(201).json(id))
    .catch((err) => res.status(503).json({error: err}));
});

// PUT /documents
app.put('/api/documents', (req,res) => {
  const document = req.body;
  dao.updateDocument(document)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(200).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// DELETE /documents
app.delete('/api/documents', (req, res) => {
  //DELETE ALL COMMENTS
  dao.deleteAllComment(req.body.documentId)
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));

  //DELETE ALL BOOKMARK
  dao.deleteAllBookmark(req.body.documentId)
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));

  //DELETE ALL PURCHASE
  dao.deleteAllPurchase(req.body.documentId)
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
  
  //DELETE DOCUMENT
  dao.deleteDocument(req.body.documentId)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(204).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// PUT /comments
app.put('/api/comments', (req,res) => {
  const comment = req.body;
  dao.updateComment(comment)
    .then((result) => {
        if(result)
          res.status(404).json(result);
        else
          res.status(200).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// POST /comments
app.post('/api/comments', (req, res) => {
  const comment = req.body.comment;
  dao.addComment(comment)
      .then((id) => res.status(201).json(id))
      .catch((err) => res.status(503).json({error: err}));
});

// DELETE /comments
app.delete('/api/comments', (req, res) => {
  dao.deleteComment(req.body.commentId)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(204).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// GET /document/:documentId/comments
app.get('/api/document/:documentId/comments', (req, res) => {
  dao.getComments(req.params.documentId)
    .then((comment) => {
        if(comment.error)
          res.json(comment);
        else {
          res.json(comment);
        }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{params: 'Server', msg: err}]
      })
    });
});

// GET /user/:userId
app.get('/api/user/:userId', (req, res) => {
  dao.getUserById(req.params.userId)
    .then((user) => {
        if(user.error)
          res.status(404).json(user);
        else
          res.json(user);
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{params: 'Server', msg: err}]
      })
    });
});

//Vedere un po'
var cpUpload = upload.fields([{name: 'image', maxCount:1}]);

//POST /projects
app.post('/api/projects', cpUpload,  (req, res) => {
  //Rinomino l'immagine per semplicità di utilizzo futuro
  const imageName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".jpg";
  const project = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    image: imageName,
    author: req.body.author,
  }

  fs.writeFile('File/'+ imageName, req.files.image[0].buffer, function (err){
    if (err) return console.log(err);

    dao.addProject(project)
        .then((id) => res.status(201).json(id))
        .catch((err) => res.status(503).json({error: err}));
  });
});

var tmpUpload = upload.fields([{name: 'image', maxCount:1}]);

// PUT /projects
app.put('/api/projects', tmpUpload, (req,res) => {
  dao.getImageName(req.body.id)
    .then((image) => {
      try {
        fs.unlinkSync(path.join(__dirname, 'File/' + image));
      } catch {
        console.log(err);
      }
    })
    .catch((error) => console.log(error));
  
  const imageName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".jpg";
  const project = {
    id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    image: imageName,
    author: req.body.author,
  }

  fs.writeFile('File/'+ imageName, req.files.image[0].buffer, function (err){
    if (err) return console.log(err);

    dao.updateProject(project)
      .then((result) => {
          if(result)
              res.status(404).json(result);
          else
              res.status(200).end();
      })
      .catch((err) => res.status(500).json({
          errors: [{param: 'Server', msg: err}],
      }));
  });  
});

// DELETE /projects
app.delete('/api/projects', (req, res) => {
  //DELETE PROJECT IMAGE FROM FILE
  dao.getImageName(req.body.projectId)
    .then((image) => {
      try {
        fs.unlinkSync(path.join(__dirname, 'File/' + image));
      } catch {
        console.log(err);
      }
    })
    .catch((error) => console.log(error));

  //DELETE ALL DOCUMENT
  dao.deleteAllDocument(req.body.projectId)
    .catch((err) => res.status(500).json({
      errors: [{params: 'Server', msg: err}]
    }));

  //DELETE ALL FOLLOW
  dao.deleteAllFollow(req.body.projectId)
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));

  //DELETE ALL DONATIONS
  dao.deleteAllDonations(req.body.projectId)
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));

  //DELETE PROJECT
  dao.deleteProject(req.body.projectId)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(204).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// GET /projects-followed
app.get('/api/projects-followed', (req, res) => {
  const user = req.query.u;
  const project = req.query.p;

  dao.getFollow(user, project)
    .then((follow) => res.json(follow))
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// GET /projects-followed/:userId
app.get('/api/projects-followed/:userId', (req, res) => {
  dao.getFollowUser(req.params.userId)
    .then((project) => {
        if(project.error)
          res.status(404).json(project);
        else {
          res.json(project);
        }
    })
    .catch((err) => {
      throw err;
    });
});

// POST /projects-followed ==> Create follow
app.post('/api/projects-followed', (req, res) => {
    dao.createFollow(req.body.user, req.body.project)
        .then((id) => res.status(201).json(id))
        .catch((err) => res.status(503).json({error: err}));
});

// DELETE /projects-followed ==> Delete follow
app.delete('/api/projects-followed', (req, res) => {
  dao.deleteFollow(req.body.user, req.body.project)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(204).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// GET /documents-bookmarked
app.get('/api/documents-bookmarked', (req, res) => {
  const user = req.query.u;
  const document = req.query.d;

  dao.getBookmark(user, document)
    .then((bookmark) => res.json(bookmark))
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// GET /documents-bookmarked/:userId
app.get('/api/documents-bookmarked/:userId', (req, res) => {
  dao.getBookmarkUser(req.params.userId)
    .then((documents) => {
        if(documents.error)
          res.status(404).json(documents);
        else {
          res.json(documents);
        }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// POST /documents-bookmarked ==> Create bookmarked
app.post('/api/documents-bookmarked', (req, res) => {
  dao.createBookmark(req.body.user, req.body.document)
      .then((id) => res.status(201).json(id))
      .catch((err) => res.status(503).json({error: err}));
});

// DELETE /documents-bookmarked ==> Delete bookmarked
app.delete('/api/documents-bookmarked', (req, res) => {
  dao.deleteBookmark(req.body.user, req.body.document)
    .then((result) => {
      if(result)
        res.status(404).json(result);
      else
        res.status(204).end();
    })
    .catch((err) => res.status(500).json({
      errors: [{param: 'Server', msg: err}],
    }));
});

// GET /search
app.get("/api/search", (req, res) => {
  const category = req.query.category;
  const project = req.query.project;
  const document = req.query.document;

  dao.getSearch(category, project, document)
    .then((result) => {
      if (result.error) res.status(404).json(result);
      else {
        res.json(result);
      }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// GET /purchase
app.get("/api/purchase", (req, res) => {
  const user = req.query.user;
  const document = req.query.document;

  dao.getPurchase(user, document)
    .then((result) => res.json(result))
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// GET /documents-purchases/:userId
app.get("/api/documents-purchases/:userId", (req, res) => {
  const user = req.params.userId;

  dao.getPurchaseByUser(user)
    .then((purchase) => {
      if (purchase.error) {
        console.log(purchase);
        res.json(purchase);
      }
      else {
        res.json(purchase);
      }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// POST /purchase
app.post("/api/purchase", (req, res) => {
  dao.createPayment(req.body.userId, req.body.documentId)
    .then((id) => res.status(201).json(id))
    .catch((err) => res.status(503).json({ error: err }));
});

// POST /donation
app.post("/api/donation", (req, res) => {
  dao.createDonation(req.body.userId, req.body.projectId, req.body.money)
    .then((id) => res.status(201).json(id))
    .catch((err) => {
      throw err;
    });
});

// GET /project/:projectId/donations
app.get("/api/project/:projectId/donations", (req, res) => {
  dao.getDonationsByProject(req.params.projectId)
    .then((donations) => {
      if (donations.error) 
        res.json(donations);
      else {
        res.json(donations);
      }
    })
    .catch((err) => {
      res.status(500).json({
        errors: [{ params: "Server", msg: err }],
      });
    });
});

// POST /sessions ==> Login
app.post('/api/sessions', (req, res) => {
  passport.authenticate('local', function(err, user, info) {
      if (err) 
        return next(err);
      
      if (!user)
          return res.status(401).json(info);
      
      req.login(user, (err) => {
        if (err) 
          throw (err);

        return res.json(req.user);
      });
  })(req, res);
});

// POST /register 
app.post('/api/register', (req, res) => {
  dao.registerUser(
    req.body.name,
    req.body.surname,
    req.body.email,
    req.body.password,
    req.body.role
    )
    .then(() => res.status(201).end())
    .catch((err) => res.status(503).json({error: err}));
});

// GET /logout
app.get('/api/sessions', isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
      if(err) throw err;
      res.redirect('/');
    });
});

// =========================================================//

//all the other requests will be served by our client-side app
app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, 'public/index.html'));
});

//start server
app.listen(port, () => console.log(`Server up and running`));
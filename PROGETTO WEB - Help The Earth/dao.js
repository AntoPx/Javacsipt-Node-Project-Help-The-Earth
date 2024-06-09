'use strict';

const Document = require('./document.js');
const db = require('./db.js');
const Project = require('./project.js');
const Comment = require('./comment.js');
const moment = require('moment');
const bcrypt = require('bcrypt');

const createDocument = (dbDocumentInput) => {
    return new Document(
        dbDocumentInput.id, 
        dbDocumentInput.title, 
        dbDocumentInput.description, 
        moment.utc(dbDocumentInput.date), 
        dbDocumentInput.cost, 
        dbDocumentInput.project, 
        dbDocumentInput.owner
    );
};

const createProject = (dbProjectInput) => {
    return new Project(
        dbProjectInput.id, 
        dbProjectInput.title,
        dbProjectInput.description,
        dbProjectInput.category,
        dbProjectInput.image, 
        dbProjectInput.author
    );
};

const createComment = (dbCommentInput) => {
    return new Comment(
        dbCommentInput.id, 
        dbCommentInput.date,
        dbCommentInput.text,
        dbCommentInput.creator, 
        dbCommentInput.document
    );
};

const getDocumentsByProject = (projectId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM documents WHERE project = ?';
        db.all(sql, [projectId], (err, rows) => {
            if (err) reject(err);
            else if (rows === undefined) resolve({ error: "Project no found" });
            else {
                let documents = rows.map((x) => createDocument(x));
                documents.sort((a, b) => {
                    return a.date - b.date;
                });
                resolve(documents);
            }
        });
    });
};

const getDocument = (documentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM documents WHERE id = ?';
        db.get(sql, [documentId], (err, row) => {
            if(err) reject(err);
            else if (row === undefined) resolve({error: 'Document non found'});
            else {
                resolve(createDocument(row));
            }
        });
    });
};

const getComments = (documentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM comments WHERE document = ?';
        db.all(sql, [documentId], (err, rows) => {
            if(err) reject(err);
            else if (rows == '') resolve({error: 'No commments'});
            else {
                let comments = rows.map((x) => createComment(x));
                resolve(comments);
            }
        });
    });
};

const getProjects = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM projects';
        db.all(sql, (err, rows) => {
            if(err) reject(err);
            else {
                let projects = rows.map( (x) => createProject(x));
                resolve(projects);
            }
        });
    });
};

const addProject = (project) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO projects(title, description, category, image, author) VALUES(?,?,?,?,?)';
        db.run(sql, 
            [
                project.title,
                project.description,
                project.category,
                project.image,
                project.author,
            ],
            function (err) {
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

//RETURN IMAGE NAME
const getImageName = (projectId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT image FROM projects WHERE id = ?';
        db.get(sql, [projectId], (err, row) => {
            if(err) {
                reject(err);
                return;
            }
            if(row===undefined) {
                resolve({error: 'Not found project'});
            } else {
                const image = row.image;
                resolve(image);
            }
        });
    });
}

const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM projects WHERE id=?';
        db.get(sql, [projectId], (err, row) => {
            if(err) reject(err);
            else if (row === undefined) resolve({error : 'Project no found'});
            else resolve(createProject(row));
        });
    })
};

const updateProject = (project) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE projects SET title = ?, description = ?, category = ?, image = ? WHERE id = ?';
        db.run(sql, 
            [
                project.title,
                project.description,
                project.category,
                project.image,
                project.id,
            ], 
            function (err) {
                if(err){
                    reject(err);
                } else if (this.changes === 0) resolve({error: 'Project not found.'});
                else {
                    resolve();
                }
            }
        );
    });
};

const deleteProject = (projectId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM projects WHERE id = ?';
        db.run(sql, [projectId], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) {
                resolve({error: 'Project not found.'});
            }else {
                resolve();
            }
        });
    });
};

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [userId], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({error: 'User not found.'});
            else {
                const user = {
                    id: row.id,
                    name: row.name,
                    surname: row.surname,
                    email: row.email,
                    role: row.role,
                };
                resolve(user);
            }
        });
    });
};

const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';

        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({error: 'User not found.'});
            else {
                const user = {
                    id: row.id,
                    name: row.name,
                    surname: row.surname,
                    username: row.email,
                    role: row.role,
                };
                let check = false;
                
                if(bcrypt.compareSync(password, row.password)) check = true;

                resolve({user, check});
            }
        });
    });
};

const registerUser = async (name, surname, email, password, role) => {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users(name, surname, email, password, role) VALUES(?,?,?,?,?)';
        
        db.run(sql, [name, surname, email, hashedPassword, role], function (err) {
            if(err){
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const getFollow = (user, project) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM follows WHERE user = ? AND project = ?';

        db.get(sql, [user, project], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({result: false});
            else resolve({result: true});
        });
    });
};

const getFollowUser = (user) => {
    return new Promise((resolve, reject) => { 
        const sql = 'SELECT projects.* FROM follows, projects WHERE follows.project = projects.id AND follows.user = ? ORDER BY projects.id';

        db.all(sql, [user], (err, rows) => {
            if(err) reject(err);
            else if (rows === undefined) resolve({ error: "Projects not found" });
            else {
                let projects = rows.map((x) => createProject(x));
                resolve(projects);
            }
        });
    });
};

const getFollowProject = (project) => {
    return new Promise((resolve, reject) => { 
        const sql = 'SELECT * FROM follows WHERE project = ?';

        db.all(sql, [project], (err, rows) => {
            if(err) reject(err);
            else if (rows === undefined) resolve({ error: "Projects not found" });
            else {
                resolve(rows);
            }
        });
    });
};

const createFollow = (user, project) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO follows(user, project) VALUES(?,?)';
        db.run(sql, [user, project], function (err) {
            if(err){
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const deleteAllFollow = (project) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM follows WHERE project = ?';
        db.run(sql, [project], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Follow not found.'});
            else {
                resolve();
            }
        });
    });
};

const deleteFollow = (user, project) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM follows WHERE user = ? AND project = ?';
        db.run(sql, [user, project], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Follow not found.'});
            else {
                resolve();
            }
        });
    });
};

const getBookmark = (user, document) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM bookmarks WHERE user = ? AND document = ?';

        db.get(sql, [user, document], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({result: false});
            else resolve({result: true});
        });
    });
};

const createBookmark = (user, document) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO bookmarks(user, document) VALUES(?,?)';
        db.run(sql, [user, document], function (err) {
            if(err){
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const deleteBookmark = (user, document) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM bookmarks WHERE user = ? AND document = ?';
        db.run(sql, [user, document], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Document not found.'});
            else {
                resolve();
            }
        });
    });
};

const deleteAllBookmark = (document) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM bookmarks WHERE document = ?';
        db.run(sql, [document], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Document not found.'});
            else {
                resolve();
            }
        });
    });
};

const getBookmarkUser = (user) => {
    return new Promise((resolve, reject) => { 
        const sql = 'SELECT documents.* FROM bookmarks, documents WHERE bookmarks.document = documents.id AND bookmarks.user = ? ORDER BY documents.id';

        db.all(sql, [user], (err, rows) => {
            if(err) reject(err);
            else if (rows === undefined) resolve({ error: "Document no found" });
            else {
                let documents = rows.map((x) => createDocument(x));
                resolve(documents);
            }
        });
    });
};

const getBookmarkDocument = (doc) => {
    return new Promise((resolve, reject) => { 
        const sql = 'SELECT * FROM bookmarks WHERE document = ?';

        db.all(sql, [doc], (err, rows) => {
            if(err) reject(err);
            else if (rows === undefined) resolve({ error: "Document no found" });
            else {
                resolve(rows);
            }
        });
    });
};

const addDocument = (document) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO documents(title, description, date, cost, project, owner) VALUES(?,?,?,?,?,?)';
        db.run(sql, 
            [
                document.title,
                document.description,
                document.date,
                document.cost,
                document.project,
                document.owner,
            ], 
            function (err) {
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

const updateDocument = (document) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE documents SET title = ?, description = ?, cost = ? WHERE id = ?';
        db.run(sql, 
            [document.title, document.description, document.cost, document.id], 
            function (err) {
                if(err){
                    reject(err);
                } else if (this.changes === 0)
                    resolve({error: 'Document not found.'});
                else {
                    resolve();
                }
            }
        );
    });
};

const deleteDocument = (documentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM documents WHERE id = ?';
        db.run(sql, [documentId], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) {
                resolve({error: 'Document not found.'});
            }else {
                resolve();
            }
        });
    });
};

const addComment = (comment) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO comments(date, text, creator, document) VALUES(?,?,?,?)';
        db.run(sql, 
            [comment.date, comment.text, comment.creator, comment.document],
            function (err) {
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

const updateComment = (comment) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE comments SET text = ? WHERE id = ?';
        db.run(sql, [comment.text, comment.id], function (err) {
            if(err){
                reject(err);
            } else if (this.changes === 0) resolve({error: 'Comment not found.'});
            else {
                resolve();
            }
        })
    });
};

const deleteComment = (commentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE id = ?';
        db.run(sql, [commentId], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) {
                resolve({error: 'Comment not found.'});
            }else {
                resolve();
            }
        });
    });
};

const deleteAllComment = (document) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE document = ?';
        db.run(sql, [document], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) {
                resolve({error: 'Comment not found.'});
            }else {
                resolve();
            }
        });
    });
};

const deleteAllDocument = (project) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM documents WHERE project = ?';
        db.run(sql, [project], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) {
                resolve({error: 'Comment not found.'});
            }else {
                resolve();
            }
        });
    });
};

const getSearch = (category, project, document) => {
    return Promise.all([
      getSearchProjects(category, project),
      getSearchDocuments(document),
    ]);
};
  
const getSearchProjects = (category, project) => {
    return new Promise((resolve, reject) => {
      const sql =
        'SELECT * FROM projects WHERE projects.category LIKE "%" || ? || "%" AND projects.title LIKE "%" || ? || "%"';
      db.all(sql, [category, project], (err, rows) => {
        if (err) reject(err);
        else if (rows === undefined) resolve({ error: "Nothing" });
        else {
          let projects = rows.map((x) => createProject(x));
          resolve(projects);
        }
      });
    });
};
  
const getSearchDocuments = (document) => {
    return new Promise((resolve, reject) => {
      const sql =
        'SELECT * FROM documents WHERE documents.title LIKE "%" || ? || "%"';
      db.all(sql, [document], (err, rows) => {
        if (err) reject(err);
        else if (rows === undefined) resolve({ error: "Nothing" });
        else {
          let documents = rows.map((x) => createDocument(x));
          resolve(documents);
        }
      });
    });
};
  
const createPayment = (user, document) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO purchases(user, document) VALUES(?,?)";
      db.run(sql, [user, document], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
};
  
const createDonation = (user, project, money) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO donations(user, project, money) VALUES(?,?, ?)";
      db.run(sql, [user, project, money], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
};
  
const getDonationsByProject = (project) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM donations WHERE project = ?";
      db.all(sql, [project], (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve({ error: "No donation" });
  
          resolve(rows);
        }
      });
    });
};

const deleteAllDonations = (project) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM donations WHERE project = ?';
        db.run(sql, [project], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Follow not found.'});
            else {
                resolve();
            }
        });
    });
};

const getPurchase = (user, document) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM purchases WHERE user = ? AND document = ?";
      db.get(sql, [user, document], (err, row) => {
        if (err) reject(err);
        else if (row === undefined) resolve({ result: false });
        else resolve({ result: true });
      });
    });
};

const getPurchaseByUser = (user) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT documents.* FROM purchases, documents WHERE purchases.document = documents.id AND purchases.user = ? ORDER BY documents.id';
      db.all(sql, [user], (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve({ error: "No purchase" });
  
          resolve(rows);
        }
      });
    });
};

const getPurchaseByDocument = (document) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM purchases WHERE document = ?';
      db.all(sql, [document], (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve({ error: "No purchase" });
          resolve(rows);
        }
      });
    });
};

const deleteAllPurchase = (document) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM purchases WHERE document = ?';
        db.run(sql, [document], function(err) {
            if(err) reject(err);
            else if (this.changes === 0) resolve({error: 'Purchase not found.'});
            else {
                resolve();
            }
        });
    });
};


module.exports = {
    getProjects,
    getDocument,
    getComments,
    addProject,
    getProject,
    getImageName,
    updateProject,
    deleteProject,
    getDocumentsByProject,
    getUserById,
    getUser,
    registerUser,
    getFollow,
    getFollowUser,
    getFollowProject,
    createFollow,
    deleteFollow,
    deleteAllFollow,
    getBookmarkUser,
    getBookmarkDocument,
    getBookmark,
    createBookmark,
    deleteBookmark,
    deleteAllBookmark,
    deleteAllDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    addComment,
    updateComment,
    deleteComment,
    deleteAllComment,
    getSearch,
    getPurchase,
    getPurchaseByUser,
    createPayment,
    createDonation,
    getDonationsByProject,
    deleteAllDonations,
    deleteAllPurchase,
    getPurchaseByDocument,
};
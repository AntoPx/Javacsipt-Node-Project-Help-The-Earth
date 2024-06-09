"use strict";

class Api {

    static getUserById = async (userId) => {
        let response = await fetch(`/api/user/${userId}`)

        if(response.ok) {
            const user = await response.json();
            return user;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }
    
    static doLogin = async (username, password) => {
        let response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });
        if(response.ok) {
            const username = await response.json();
            return username;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }
    
    static doLogout = async () => await fetch('/api/sessions');

    static doRegister = async (name, surname, email, password, role) => {
        let response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, surname, email, password, role}),
        });
        
        if(response.ok) {
            return await this.doLogin(email, password);
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }
    
    static getProjectByCateg(categ) {
        return this.projects.filter(pj => pj.categ === categ);
    }

    static doProjectUpload = async (project) => {
        let response = await fetch('/api/projects', {
            method: 'POST',
            body: project,
        });

        if(response.ok) {
            const projectId = await response.json();
            return projectId;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doProjectFollow = async (user, project) => {
        let response = await fetch('/api/projects-followed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user, project}),
        });

        if(response.ok) {
            const username = await response.json();
            return username;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doProjectUnFollow = async (user, project) => {
        let response = await fetch('/api/projects-followed', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user, project}),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doDocumentBookmark = async (user, document) => {
        let response = await fetch('/api/documents-bookmarked', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user, document}),
        });

        if(response.ok) {
            const username = await response.json();
            return username;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doDocumentUnBookmark = async (user, document) => {
        let response = await fetch('/api/documents-bookmarked', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user, document}),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doProjectUpdate = async (project) => {
        let response = await fetch(`/api/projects`, {
            method: 'PUT',
            body: project,
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doProjectDelete = async (projectId) => {
        let response = await fetch('/api/projects', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({projectId}),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doDocumentUpload = async (document) => {
        let response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({document}),
        });

        if(response.ok) {
            const username = await response.json();
            return username;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doDocumentUpdate = async (document) => {
        let response = await fetch(`/api/documents`, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(document),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doDocumentDelete = async (documentId) => {
        let response = await fetch('/api/documents', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({documentId}),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doCommentUpload = async (comment) => {
        let response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({comment}),
        });

        if(response.ok) {
            const username = await response.json();
            return username;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doCommentUpdate = async (comment) => {
        let response = await fetch(`/api/comments`, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(comment),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doCommentDelete = async (commentId) => {
        let response = await fetch('/api/comments', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({commentId}),
        });

        if(!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch(err) {
                throw err;
            }
        }
    }

    static doProjectDonation = async (userId, projectId, money) => {
        let response = await fetch('/api/donation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'userId': userId,
                'projectId': projectId,
                'money': money
            }),
        });

        if (!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch (err) {
                throw err;
            }
        }
    }

    static doDocumentBuy = async (user, document) => {
        let response = await fetch('/api/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'userId': user,
                'documentId': document
            }),
        });

        if (!response.ok) {
            try {
                const errDetail = await response.json();
                throw errDetail.message;
            }
            catch (err) {
                throw err;
            }
        }
    }

}

export default Api;
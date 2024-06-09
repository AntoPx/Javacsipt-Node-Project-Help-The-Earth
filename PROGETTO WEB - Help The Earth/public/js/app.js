"use strict";
import page from '//unpkg.com/page/page.mjs';
import ProjectManager from './project-manager.js';
import createProjectPage from "./templates/project-template.js";
import createLoginForm from './templates/login-template.js';
import createRegisterForm from "./templates/register-template.js";
import createUserArea from "./templates/user-template.js";
import createAlert from './templates/alert-template.js';
import createNotFoundPage from "./templates/not-found-template.js";
import createAddForm from "./templates/project-add-template.js";
import createDocumentPage from './templates/document-template.js';
import createNavLink from './templates/nav-template.js';
import {createTable, createProjectRow, createDocumentRow} from './templates/all-project-template.js';
import createSearchPage from './templates/search-template.js';
import createSearchPageAfter from './templates/search-after-template.js';
import Api from "./api.js";

class App{
    constructor(appContainer, navLinks){
        //references
        this.appContainer = appContainer;
        this.navLinks = navLinks;

        // Init Project Manager
        this.projectManager = new ProjectManager();

        // Init User area
        this.userContainer = document.querySelector('#user');

        //routing
        page('/', () => {
            page('/projects');
        });

        page('/projects', () => {
            this.initNav();
            this.showAllProjects();
        });

        page('/emergency-projects', () => {
            this.initNav();
            this.showCategoryProjects('Emergenze');
        });

        page('/sport-projects', () => {
            this.initNav();
            this.showCategoryProjects('Sport');
        });

        page('/eco-projects', () => {
            this.initNav();
            this.showCategoryProjects('Eco');
        });

        page('/project/:projectId', ( (ctx) => {
            this.initNav();
            this.showProject(ctx.params.projectId);
        }));


        page('/projects/my-projects', (() => {
            if(!this.isLoggedIn()) {
                page('/not-found');
                return;
            }

            this.initNav();
            this.showAllProjectsByUser();
        }));

        page('/projects/followed', ((ctx) => {
            if(!this.isLoggedIn()) {
                page('/not-found');
                return;
            }

            this.initNav();
            this.showFollowed();
        }));

        page('/add-project', () => {
            if(!this.isLoggedIn()) {
                page('/not-found');
                return;
            }

            this.addProject();
        });
        
        page('/search', () => {
            this.initNav();
            this.showSearchPage();
        });

        page('/documents/bookmarked', ((ctx) => {
            if(!this.isLoggedIn()) {
                page('/not-found');
                return;
            }
            
            this.initNav();
            this.showBookmarked();
        }));

        
        page('/documents/purchase', ((ctx) => {
            if(!this.isLoggedIn()) {
                page('/not-found');
                return;
            }
            
            this.initNav();
            this.showPurchase();
        }));
        
        page('/document/:documentId', ( (ctx) => {
            this.initNav();
            this.showDocument(ctx.params.documentId);
        }));

        page('/login', () => {
            if(this.isLoggedIn())
                page('/logout');
            else {
                this.appContainer.innerHTML = createLoginForm();
                document.getElementById('login-form').addEventListener('submit', this.onLoginSubmitted);
            }
        });

        page('/register', () => {
            if(this.isLoggedIn())
                page('/logout');
            else{
                this.appContainer.innerHTML = createRegisterForm();
                document.getElementById('register-form').addEventListener('submit', this.onRegisterSubmitted);
            }
        });

        page('/logout', () => {
            if(this.isLoggedIn())
                this.onLogout();
            else
                page('/');
        });

        page('/not-found', () => {
            this.appContainer.innerHTML = createNotFoundPage();
            setTimeout(()=>{
                page('/');
            }, 5000);
        });

        page('*', () => {
            page('/projects');
        });

        page();
    }

    initNav = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        this.navLinks.innerHTML = createNavLink((user !== null)? user.role: 0);
        this.userContainer.innerHTML = (user !== null)? createUserArea(user.name, user.role) : createUserArea('Scopri di più', 0); 
    }

    showSearchPage = () => {
        this.appContainer.innerHTML = createSearchPage();

        const form = document.getElementById('search-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const category = form.category.value;
            const project = form.project.value;
            const document = form.document.value;

            this.searchPage(this.appContainer, category, project, document);
        });
    }

    searchPage = async (content, category, project, document) => {
        let response = await fetch(`/api/search?category=${category}&project=${project}&document=${document}`);
        const responseJson = await response.json();

        if (response.ok) {
            const projects = responseJson[0];
            const documents = responseJson[1];

            content.innerHTML = createSearchPageAfter([category, project, document], projects, documents);

        } else throw responseJson;
    }

    showAllProjects = async () => {
        try {
            await this.projectManager.getAllProjects();
            this.showProjects('I nostri progetti', this.projectManager.projects);
        }
        catch(err) {
            throw err;
        }
    }

    showCategoryProjects = async (categ) => {
        try {
            await this.projectManager.getCategoryProjects(categ);
            this.showProjects(categ, this.projectManager.projects);
        }
        catch(err) {
            throw err;
        }
    }

    showAllProjectsByUser = async () => {
        try {
            await this.projectManager.getAllProjectsByUser();
            this.showProjects('Progetti che hai creato', this.projectManager.projects);
        }
        catch(err) {
            throw err;
        }
    }
    
    showBookmarked = async () => {
        try {
            const userLocal = JSON.parse(localStorage.getItem('user'));
            let response = await fetch(`/api/documents-bookmarked/${userLocal.id}`);
            
            const documents = await response.json()
            
            if(documents.length === 0) {
                this.appContainer.innerHTML = '<h1 class="margintop-3 normal-text text-center">Nessun documento tra i favoriti</h1>';
                return;
            }

            this.showDocuments('Documenti che ti piacciono', documents);
        }
        catch(err) {
            throw err;
        }
    }

    showPurchase = async () => {
        try {
            const userLocal = JSON.parse(localStorage.getItem('user'));
            let response = await fetch(`/api/documents-purchases/${userLocal.id}`);
            
            const documents = await response.json();
            if(documents.error === 'No purchase') {
                this.appContainer.innerHTML = '<h1 class="margintop-3 normal-text text-center">Nessun documento acquistato</h1>';
                return;
            }

            this.showDocuments('Documenti acquistati', documents);
        }
        catch(err) {
            throw err;
        }
    }
    
    showDocuments = async (title, documents) => {
        this.appContainer.innerHTML = createTable(title);
        const docTable = document.querySelector('#my-contain');
    
        for(let d of documents) {
            const docRow = createDocumentRow(d);
            docTable.insertAdjacentHTML('beforeend', docRow);
        }
    }
    
    showFollowed = async () => {
        try {
            await this.projectManager.getAllFollowedProjects();
            if(this.projectManager.projects.length==0){
                this.showProjects('Non ci sono progetti che ti piacciono');
            }else this.showProjects('Progetti che ti piacciono', this.projectManager.projects);
        }
        catch(err) {
            throw err;
        }
    }

    showDocument = async (documentId) => {
        try {
            this.appContainer.innerHTML = await createDocumentPage(documentId);

            document.getElementById('bookmark-icon').addEventListener('click', () => {
                const iconButton = document.getElementById('bookmark-icon');
                const bookmarkedBefore = iconButton.src.endsWith('/img-video/star-filld.svg');

                const userId = JSON.parse(localStorage.getItem('user')).id;

                if(!bookmarkedBefore) {
                    iconButton.src = '/img-video/star-filld.svg';
                    iconButton.title = 'Premi per smettere di seguire';
                    Api.doDocumentBookmark(userId, documentId);
                } else {
                    iconButton.src = '/img-video/stard.svg';
                    iconButton.title = 'Premi per seguire';
                    Api.doDocumentUnBookmark(userId, documentId);
                }

            });

            // Add comment modal
            var addModal = document.getElementById('addModal');
            var dismissButtonAdd = document.getElementById('addDismissButton');
            var formAdd = document.getElementById('addForm');

            addModal.addEventListener('shown.bs.modal', () => dismissButtonAdd.focus());

            formAdd.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(addModal);
                modal.hide();

                const comment = {
                    'date': moment().format('YYYY-MM-DD'), 'text': formAdd.message.value,
                    'creator': formAdd.creator.value, 'document': documentId
                };
                this.createComment(comment);
            });

            // Edit document modal
            var editModal = document.getElementById('editModal');
            var dismissButtonEdit = document.getElementById('editDismissButton');
            var form = document.getElementById('editForm');
        
            editModal.addEventListener('shown.bs.modal', function () {
                dismissButtonEdit.focus();
            });

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(editModal)
                modal.hide();

                const document = {'id':form.documentId.value, 'title':form.documentTitle.value, 'description':form.description.value, 'date':form.documentDate.value, 'cost':form.documentCost.value, 'project' : form.documentProject, 'owner': form.documentOwner.value};
                this.editDocument(document);
            });

            // Delete document modal
            var deleteModal = document.getElementById('deleteModal');
            var dismissButton = document.getElementById('confirmDismissButton');
            var deleteButton = document.getElementById('confirmDeleteButton');
        
            deleteModal.addEventListener('shown.bs.modal', function () {
                dismissButton.focus();
            });

            deleteButton.addEventListener('click', () => {
                var modal = bootstrap.Modal.getInstance(deleteModal)
                modal.hide();
                this.deleteDocument(documentId);
            });

            //Payment modal
            var paymentModal = document.getElementById('paymentModal');
            var paymentDismissButton = document.getElementById('paymentDismissButton');
            var paymentForm = document.getElementById('paymentForm');

            paymentModal.addEventListener('shown.bs.modal', () => paymentDismissButton.focus());

            const creditCardChange = document.getElementById('cardNumber');
            creditCardChange.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
            });

            const creditCardExpire = document.getElementById('cardExpire');
            creditCardExpire.addEventListener('input', (e) => {

                if (isNaN(e.data))
                    e.target.value = e.target.value.slice(0, -1);

                if (e.inputType === 'deleteContentBackward' && e.target.value.length === 2)
                    e.target.value = e.target.value.slice(0, -1);
                else if (e.target.value.length === 2)
                    e.target.value = e.target.value + "/";
            });

            paymentForm.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(paymentModal);

                const paymentCard = {
                    'cardNumber': paymentForm.cardNumber.value,
                    'cardExpire': paymentForm.cardExpire.value,
                    'cardCVV': paymentForm.cardCVV.value
                };

                if (!this.checkValidity(paymentCard)) {
                    const errorMessages = document.getElementById('pay-error-messages');
                    errorMessages.innerHTML = 'Dati inseriti non validi!';
                } else {
                    modal.hide();

                    this.buyDocument(paymentForm.userLogged.value, documentId);
                    page(`/document/${documentId}`);
                }
            });

            // COMMENTS
            try {
                 // Edit modal
                 var editCommentModals = document.querySelectorAll('[id^="editCommentModal-"]');

                 Array.from(editCommentModals).forEach((editCommentModal) => {
                     const id = editCommentModal.id.split('-')[1];
 
                     var dismissButtonComment = document.getElementById('editCommentDismissButton-' + id);
                     var formCommentEdit = document.getElementById('editCommentForm-' + id);
 
                     editCommentModal.addEventListener('shown.bs.modal', function () {
                         dismissButtonComment.focus();
                     });
 
                     formCommentEdit.addEventListener('submit', (event) => {
                         event.preventDefault();
                         var modal = bootstrap.Modal.getInstance(editCommentModal)
                         modal.hide();
 
                         const comment = { 'id': formCommentEdit.commentId.value, 'date': formCommentEdit.dateComment.value, 'text': formCommentEdit.contentComment.value, 'creator': formCommentEdit.creatorComment.value, 'document': documentId };
                         this.editComment(comment);
                     });
                 });

                // Delete comment modal
                var deleteCommentModals = document.querySelectorAll('[id^="deleteCommentModal-"]');

                Array.from(deleteCommentModals).forEach((deleteCommentModal) => {
                    const id = deleteCommentModal.id.split('-')[1];

                    var dismissCommentButton = document.getElementById('confirmDeleteCommentDismissButton-' + id);
                    var deleteCommentButton = document.getElementById('confirmDeleteCommentButton-' + id);

                    deleteCommentModal.addEventListener('shown.bs.modal', function () {
                        dismissCommentButton.focus();
                    });

                    deleteCommentButton.addEventListener('click', () => {
                        var modal = bootstrap.Modal.getInstance(deleteCommentModal)
                        modal.hide();

                        const commentId = document.getElementById('custom-comment-' + id).value;
                        this.deleteComment(commentId);
                    });
                });
            } catch(err) {
                'ignored';
            }
        }
        catch(err) {
            throw err;
        }
    }

    checkValidity = (card) => {
        // Check card number
        if (card.cardNumber.replaceAll(' ', '').length !== 16)
            return false;

        // Check card expire
        const month = parseInt(card.cardExpire.split('/')[0], 10);
        const year = parseInt(card.cardExpire.split('/')[1], 10);

        if (month > 12 || month < 1)
            return false;

        const yearNow = parseInt(moment().format('YY'));
        const monthNow = parseInt(moment().format('MM'));

        if (year < yearNow)
            return false;
        else if (year === yearNow && month <= monthNow)
            return false;

        // Check card cvv
        const cvv = card.cardCVV;
        if (cvv.length !== 3 || !/^[0-9]+$/.test(cvv))
            return false;

        return true;
    }

    buyDocument = async (user, document) => {
        await Api.doDocumentBuy(user, document);
    }
    
    showProject = async (projectId) => {
        try {
            this.appContainer.innerHTML = await createProjectPage(projectId);

            document.getElementById('follow-icon').addEventListener('click', () => {

                const iconButton = document.getElementById('follow-icon');
                const followedBefore = iconButton.src.endsWith('/img-video/star-fill.svg');

                const userId = JSON.parse(localStorage.getItem('user')).id;

                if(!followedBefore) {
                    iconButton.src = '/img-video/star-fill.svg';
                    iconButton.title = 'Premi per smettere di seguire';
                    Api.doProjectFollow(userId, projectId);
                } else {
                    iconButton.src = '/img-video/star.svg';
                    iconButton.title = 'Premi per seguire';
                    Api.doProjectUnFollow(userId, projectId);
                }

            });

            // Add document modal
            var addModal = document.getElementById('addModal');
            var dismissButtonEdit = document.getElementById('addDismissButton');
            var formAdd = document.getElementById('addForm');
        
            addModal.addEventListener('shown.bs.modal', function () {
                dismissButtonEdit.focus();
            })

            formAdd.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(addModal)
                modal.hide();

                const document = {'title':formAdd.title.value, 'description':formAdd.description.value, 'date' : moment().format("YYYY-MM-DD"), 'cost':formAdd.cost.value, 'project':formAdd.project.value, 'owner': formAdd.owner.value};
                this.addDocument(document);
            });

            // Donation modal
            var donationModal = document.getElementById('donationModal');
            var donationDismissButton = document.getElementById('donationDismissButton');
            var donationForm = document.getElementById('donationForm');

            donationModal.addEventListener('shown.bs.modal', () => donationDismissButton.focus());

            const creditCardChange = document.getElementById('cardNumber');
            creditCardChange.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
            });

            const creditCardExpire = document.getElementById('cardExpire');
            creditCardExpire.addEventListener('input', (e) => {

                if (isNaN(e.data))
                    e.target.value = e.target.value.slice(0, -1);

                if (e.inputType === 'deleteContentBackward' && e.target.value.length === 2)
                    e.target.value = e.target.value.slice(0, -1);
                else if (e.target.value.length === 2)
                    e.target.value = e.target.value + "/";
            });

            donationForm.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(donationModal);

                const paymentCard = {
                    'cardNumber': donationForm.cardNumber.value,
                    'cardExpire': donationForm.cardExpire.value,
                    'cardCVV': donationForm.cardCVV.value
                };

                if (!this.checkValidity(paymentCard)) {
                    const errorMessages = document.getElementById('donation-error-messages');
                    errorMessages.innerHTML = 'Dati inseriti non validi!';
                } else {
                    modal.hide();

                    const money = donationForm.money.value;

                    this.donationProject(donationForm.userLogged.value, projectId, money);
                    page(`/project/${projectId}`);
                }
            });

            // Edit project modal
            var editModal = document.getElementById('editModal');
            var dismissButtonEdit = document.getElementById('editDismissButton');
            var form = document.getElementById('editForm');
        
            editModal.addEventListener('shown.bs.modal', function () {
                dismissButtonEdit.focus();
            })

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                var modal = bootstrap.Modal.getInstance(editModal)
                modal.hide();

                const formData = new FormData();
                formData.append('id', event.target.inputId.value);
                formData.append('title', event.target.title.value);
                formData.append('description', event.target.description.value);
                formData.append('category', event.target.category.value);
                formData.append('image', event.target.image.files[0]);
                formData.append('author', event.target.author.value);
                this.editProject(formData, form.inputId.value);
            });

            // Delete project modal
            var deleteModal = document.getElementById('deleteModal');
            var dismissButton = document.getElementById('confirmDismissButton');
            var deleteButton = document.getElementById('confirmDeleteButton');
        
            deleteModal.addEventListener('shown.bs.modal', function () {
                dismissButton.focus();
            })

            deleteButton.addEventListener('click', () => {
                var modal = bootstrap.Modal.getInstance(deleteModal)
                modal.hide();

                this.deleteProject(projectId);
            });
        }
        catch(err) {
            throw err;
        }
    }

    donationProject = async (userId, projectId, money) => {
        await Api.doProjectDonation(userId, projectId, money);
    }

    showProjects = async (title, projects) => {
        this.appContainer.innerHTML = createTable(title);
        const projTable = document.querySelector('#my-contain');
    
        for(let p of projects) {
            const projRow = createProjectRow(p);
            projTable.insertAdjacentHTML('beforeend', projRow);
        }
    }

    addProject = () => {
        this.appContainer.innerHTML = createAddForm();
        //document.getElementById('fileUpload').addEventListener('change', event => handleImageUpload(event));
        document.getElementById('add-form').addEventListener('submit', this.onProjectSubmitted);
    }

    editProject = async (project, id) => {
        await Api.doProjectUpdate(project);
        page(`/project/${id}`);
    }

    deleteProject = async (projectId) => {
        await Api.doProjectDelete(projectId);
        page('/');
    }
    
    addDocument = async (document) => {
        let newId = await Api.doDocumentUpload(document);
        page(`/document/${newId}`);
    }

    editDocument = async (document) => {
        await Api.doDocumentUpdate(document);
        page(`/document/${document.id}`);
    }

    deleteDocument = async (documentId) => {
        await Api.doDocumentDelete(documentId);
        page('/');
    }

    createComment = async (comment) => {
        await Api.doCommentUpload(comment);
        page(`/document/${comment.document}`);
    }

    editComment = async (comment) => {
        await Api.doCommentUpdate(comment);
        page(`/document/${comment.document}`);
    }

    deleteComment = async (commentId) => {
        await Api.doCommentDelete(commentId);
        page('/');
    }
    
    onLoginSubmitted = async (event) => {
        event.preventDefault();
        const form = event.target;
        const alertMessage = document.getElementById('error-messages');

        if(form.checkValidity()) {
            try {
                const user = await Api.doLogin(form.email.value, form.password.value);
                localStorage.setItem('user', JSON.stringify(user));
                page.redirect('/');
            } catch(error) {
                if (error) {
                    const errorMsg = error;
                    // add an alert message in DOM
                    alertMessage.innerHTML = createAlert('danger', errorMsg);
                    // automatically remove the flash message after 3 sec
                    setTimeout(() => {
                        alertMessage.innerHTML = '';
                    }, 3000);
                }
            }
        }
    }

    onRegisterSubmitted = async (event) => {
        event.preventDefault();
        const form = event.target;
        const alertMessage = document.getElementById('error-messages');
        
        if(form.checkValidity()) {
            try {
                const user = await Api.doRegister(form.name.value, form.surname.value, form.email.value, form.password.value, form.role.value);
                localStorage.setItem('user', JSON.stringify(user));
                page.redirect('/');
            } catch(error) {
                if (error) {
                    const errorMsg = error;
                    // add an alert message in DOM
                    alertMessage.innerHTML = createAlert('danger', errorMsg);
                    // automatically remove the flash message after 3 sec
                    setTimeout(() => {
                        alertMessage.innerHTML = '';
                    }, 3000);
                }
            }
        }
    }

    onProjectSubmitted = async (event) => {
        event.preventDefault();
        const form = event.target;

        const userId = JSON.parse(localStorage.getItem('user')).id;

        if(form.checkValidity()) {
            const formData = new FormData();
            formData.append('title', event.target.title.value);
            formData.append('description', event.target.description.value);
            formData.append('category', event.target.category.value);
            formData.append('image', event.target.image.files[0]);
            formData.append('author', userId);
            try {
                const projectId = await Api.doProjectUpload(formData);
                page.redirect(`/project/${projectId}`);
            } catch(error) {
                throw error;
            }
        }
    }

    isLoggedIn = () => {
        return localStorage.getItem('user') !== null;
    }

    onLogout = () => {
        Api.doLogout();
        localStorage.clear();
        page('/login');
    }
}

export default App;
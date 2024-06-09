'use strict';
import Api from '../api.js';

async function createProjectPage(id) {

    const project = await fetch(`/api/project/${id}`);
    
    if(project.status === 404)
        return '<div class="d-flex margintop-3"><h1 class="text-center">Progetto non trovato!</h1></div>';
    
    const projectJson = await project.json();
    
    const userProject = await Api.getUserById(projectJson.author);
    let user = JSON.parse(localStorage.getItem('user'));
    const userRole = (user !== null)? user.role : 0;
    if(user === null) user = {'id' : -1};


    const documentList = await fetch(`/api/project/${id}/documents`);
    const documentListJson = await documentList.json();

    const followed = await fetch(`/api/projects-followed?u=${user.id}&p=${id}`);
    const followedJson = await followed.json();
    
    return `<div class="poster margintop-3" id="poster-section">
                <div class="poster__img">
                    <img src="/File/proj_img/${projectJson.image}" alt="">
                </div>
                <div class="poster__content">
                    <h3 class="big-text"> <img src="/img-video/star${followedJson.result? '-fill':''}.svg" id="follow-icon" title="Premi per ${followedJson.result? 'smettere di ':''}seguire" alt="Icona follow" width="50" height="50" class="cursor-pointer ${(userRole === 0)? 'visually-hidden' : ''}"> ${projectJson.title}</h3>
                    <h6 class="margintop-0"><span class="badge bg-info align-middle text-capitalize">${projectJson.category}</span> - Creatore: ${userProject.name} ${userProject.surname}</h6>
                    <p class="margintop-1">${projectJson.description}</p>

                    <!-- Edit button -->
                    <a href="" class="button margintop-0 ${(user.id !== projectJson.author)? 'visually-hidden' : ''}" data-bs-toggle="modal" data-bs-target="#editModal">
                        Modifica
                    </a>
                        
                    <!-- Delete button -->
                    <a href="" class="button margintop-0 ${(user.id !== projectJson.author)? 'visually-hidden' : ''}" data-bs-toggle="modal" data-bs-target="#deleteModal">
                        Elimina
                    </a>
                </div>
            </div>

            <section class="panel-blue margintop-3">
                <div class="grid">
                    <div class="col">
                        <h3 class="big-text tw">
                            Documenti
                            <a class="tw cursor-pointer ${(user.id !== projectJson.author)? 'visually-hidden' : ''}" data-bs-toggle="modal" data-bs-target="#addModal">
                                <img src="/img-video/newDoc.svg" alt="Icona aggiungi" title="Aggiungi documento">
                            </a>
                        </h3>
                        ${createDocumentView(documentListJson)}
                    </div>
                    <div class="col">
                        <h3 class="big-text tw">
                            Donazioni
                            <a class="tw cursor-pointer ${(userRole === 0 || user.id === projectJson.author)? 'visually-hidden' : ''}" data-bs-toggle="modal" data-bs-target="#donationModal">
                                <img src="/img-video/donazione.svg" alt="Icona donazione" title="Dona">
                            </a>
                        </h3>
                        <ul class="tw">
                            ${await createDonationView(id)}
                        </ul>
                    </div>
                </div>
            </section> 

            <footer class="footer margintop-4" id="foot">
                <div class="grid">
                    <div class="col">
                        <h4 class="normal-text tw">Contatti</h4>
                        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16"> <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/> </svg> +39 0141 102 525 </br> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16"> <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/> </svg> +39 384 01 11 713 </p>
                    </div>
                    <div class="col">
                        <h4 class="normal-text tw">Ci puoi trovare su</h4>
                        <p> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16"> <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/> </svg> Instagram </br> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16"> <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/> </svg> Facebook </br> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16"> <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/> </svg> Linkedin </p>
                    </div>
                    <div class="col">
                        <h4 class="normal-text tw">Indirizzo</h4>
                        <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"> <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/> </svg> Piazzale Fabrizio de Andrè </br> 14100 Asti AT</p>
                    </div>
                    <div class="col">
                        <p>
                        <a href="http://validator.w3.org/check/referer"> 
                        <img width="88" src="https://upload.wikimedia.org/wikipedia/commons/b/bb/W3C_HTML5_certified.png" alt="Valid HTML5!"></a>
                        <p>
                        <a href="http://jigsaw.w3.org/css-validator/check/referer">
                        <img src="http://jigsaw.w3.org/css-validator/images/vcss" alt="Valid CSS!" ></a>
                        </p>  
                    </div>
                </div>
            </footer>
            
            <!-- Add modal -->
            <div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
                <form method="POST" id="addForm"> <!-- TODO Form control -->
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="normal-text" id="addModalLabel">Aggiungi un nuovo documento al progetto</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body row">
                                <div id="error-messages"></div>
                                
                                <input type="hidden" id="project" name="project" value="${id}">
                                <input type="hidden" id="owner" name="owner" value="${user.id}">
                        
                                <div class="form-group col-md-6">
                                    <label id="title">Titolo</label>
                                    <input type="text" name="title" class="form-control" placeholder="Inserisci il titolo del documento" required />
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label id="cost">Costo</label>
                                    <input type="number" min="0" id="cost" name="cost" class="form-control" placeholder="Inserisci il costo del documento" required />
                                    </div>
                        
                                <div class="form-group col-12 mt-3">
                                    <label id="description">Descrizione</label>
                                    <textarea name="description" class="form-control" placeholder="Descrizione del progtto" required></textarea>
                                </div>
                            
                            </div>
                            <div class="modal-footer">
                                <button type="button" id="addDismissButton" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                <button type="submit" id="confirmAddButton" class="btn btn-info">Aggiungi</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Donation modal -->
            <div class="modal fade" id="donationModal" tabindex="-1" aria-labelledby="donationModallabel" aria-hidden="true">
                <form method="POST" id="donationForm"> <!-- TODO Form control -->
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="normal-text" id="donationModallabel">Donazione</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body row">
                                <div class="mx-auto btn-danger" id="donation-error-messages"></div>

                                <input type="number" name="userLogged" value="${user.id}" hidden>

                                <div class="form-group my-2">
                                    <label id="cardOwner">Intestatario della carta</label>
                                    <input type="text" id="cardOwner" name="cardOwner" class="form-control" placeholder="Mario Rossi" required />
                                </div>

                                <div class="form-group my-2">
                                    <label id="cardNumber">Numero della carta</label>
                                    <input type="text" id="cardNumber" name="cardNumber" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required />
                                </div>

                                <div class="form-group my-2 col-md-6">
                                    <label id="cardExpire">Scadenza carta</label>
                                    <input type="text" id="cardExpire" name="cardExpire" class="form-control" placeholder="MM/AA" maxlength="5" required />
                                </div>
                                
                                <div class="form-group my-2 col-md-6">
                                    <label id="cardCVV">CVV</label>
                                    <input type="text" id="cardCVV" name="cardCVV" class="form-control" placeholder="XXX" maxlength="3" required />
                                </div>

                                <div class="form-group my-2 col-md-6">
                                    <label id="money">Importo</label>
                                    <input type="number" step="1" id="money" name="money" class="form-control" placeholder="€1" min="1" required />
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" id="donationDismissButton" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                <button type="submit" id="confirmDonationButton" class="btn btn-info">Dona</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Edit modal -->
            <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editeModalLabel" aria-hidden="true">
                <form method="POST" id="editForm"> <!-- TODO Form control -->
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="normal-text" id="editeModalLabel">Modifica il progetto</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body row">
                                <div id="error-messages"></div>
                                <input type="hidden" id="inputId" name="inputId" value="${id}">
                                <input type="hidden" id="author" name="author" value="${userProject.id}">
                            
                                <div class="form-group col-md-6">
                                    <label id="title">Titolo</label>
                                    <input type="text" name="title" class="form-control" placeholder="Inserisci il titolo del progetto" value="${projectJson.title}" required />
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label id="category">Categoria</label>
                                    <input type="text" name="category" class="form-control" placeholder="Inserisci la categoria del progetto" value="${projectJson.category}" required />
                                </div>
                            
                                <div class="form-group col-12 mt-3">
                                    <label id="description">Descrizione</label>
                                    <textarea name="description" class="form-control" placeholder="Descrizione del progtto" required>${projectJson.description}</textarea>
                                </div>
                        
                                <div class="form-group col-12 mt-3">
                                    <label id="image">Immagine del progetto</label>
                                    <input type="file" name="image" id="fileUpload" class="form-control" accept="image/png, image/jpeg"></input> <!-- TODO -->
                                </div>
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" id="editDismissButton" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                <button type="submit" id="confirmEditButton" class="btn btn-info">Modifica</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Delete modal -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="normal-text" id="deleteModalLabel">Eliminazione progetto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Vuoi davvero eliminare il tuo progetto?
                            <br><br>
                            L'eliminazione sarà irreversibile.
                        </div>
                        <div class="modal-footer">
                            <button type="button" id="confirmDismissButton" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" id="confirmDeleteButton" class="btn btn-danger">Elimina</button>
                        </div>
                    </div>
                </div>
            </div>`;
}

const createDocumentView = (documentList) => {
    if(documentList.length === 0)
        return '<h5 class="margintop-0 tw"> Nessun documento disponibile. </h5>';
    
    let result = '';

    for(const doc of documentList) {
        result += ` <div class="polaroid cursor-pointer"><a href="/document/${doc.id}" class="no-link">
                        <div>${doc.title}</div>
                        <div>${doc.cost !== 0.0 ? "€ " + doc.cost : "Gratuito"}</div>
                    </a></div>`;
    }

    return result;
}

const createDonationView = async (projectId) => {
    let response = await fetch(`/api/project/${projectId}/donations`);
    const responseJson = await response.json();

    if (responseJson.error === 'No donation')
        return '<li class="margintop-0"> Nessuna donazione effettuata. </li>';

    let result = '';
    let total = 0;

    for(const donation of responseJson) {
        total += donation.money;
        const user = await Api.getUserById(donation.user);
        result += `<li class="margintop-0"> ${user.name} ${user.surname} = ${donation.money} € </li>`;
    }

    result += `<li class="margintop-0"><h5 class="tw">Totale donazioni: € ${total}</h5></li>`;

    return result;
}

export default createProjectPage;
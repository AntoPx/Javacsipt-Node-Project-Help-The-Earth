'use strict';

function createAddForm() {
    return` <form method="POST" id="add-form" class="col-6 row mx-auto margintop-3">

                <div id="error-messages"></div>

                <h3 class="text-center">Inserisci un nuovo progetto</h3>

                <div class="form-group col-md-6 margintop-0">
                    <label id="title" class="form-label">Titolo</label>
                    <input type="text" name="title" class="form-control" placeholder="Inserisci il titolo del progetto" required />
                </div>

                <div class="form-group col-md-6 margintop-0">
                    <label id="category" class="form-label">Categoria</label>
                    <select class="form-select" id="category" name="category" required>
                        <option selected disabled label="Scegli la categoria"></option>
                        <option value="Sport">Sport</option>
                        <option value="Emergenze">Emergenze</option>
                        <option value="Eco">Eco-green</option>
                    </select>
                </div>

                <div class="form-group col-12 margintop-0">
                    <label id="description" class="form-label">Descrizione</label>
                    <textarea name="description" class="form-control textarea" placeholder="Descrizione del progtto" required></textarea>
                </div>

                <div class="form-group col-12 mt-3 margintop-0">
                    <label id="image" class="form-label">Immagine del progetto</label>
                    <input type="file" name="image" id="fileUpload" class="form-control" accept="image/png, image/jpeg" required></input>
                </div>

                <div class="col-12 margintop-0">
                    <button type="submit" class="btn btn-info mt-2 btn-center">Aggiungi</button>
                </div>

            </form>`;
}

export default createAddForm;
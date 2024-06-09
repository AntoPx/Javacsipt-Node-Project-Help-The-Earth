'use strict';

function createSearchPage() {
    return `
    <form method="POST" id="search-form" class="mx-auto col-6 margintop-3">
        <div id="error-messages"></div>
        <h3>Ricerca avanzata (Compila il form dove ritieni necessario)</h3>
        <br>
        <div class="form-group">
            <label id="category" class="form-label">Categoria</label>
            <select class="form-select" id="category" name="category">
                <option selected disabled label="Scegli la categoria"></option>
                <option value="Sport">Sport</option>
                <option value="Emergenze">Emergenze</option>
                <option value="Eco">Eco-green</option>
            </select>
        </div>
        <br>
        <div class="form-group">
            <label for="project">Progetto</label>
            <input type="text" name="project" id="project" class="form-control" />
        </div>
        <br>
        <div class="form-group">
            <label for="document">Documento</label>
            <input type="text" name="document" id="document" class="form-control" />
        </div>
        <br>
        <button type="submit" class="btn btn-info mt-3 center btn-center">Cerca</button>
    </form>
    `;
}

export default createSearchPage;
'use strict';

function createUserArea(name, role) {
    return `<!-- User area -->
    <div class="btn-group">
        <a href="/search" class="btn tw">Ricerca</a></li>
        <button type="button" class="btn dropdown-toggle tw" data-bs-toggle="dropdown" aria-expanded="true">
            ${name}
        </button>
        ${createDropdown(role)}
    </div>`;
}

function createDropdown(role) {
    switch(role) {
        case 0:
            return `<ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/login">Accedi</a></li>
                <li><a class="dropdown-item" href="/register">Registrati</a></li>
            </ul>`;
        default:
            return `<ul class="dropdown-menu">
                <li><a class="dropdown-item hover-bg-red" href="/logout">Esci</a></li>
            </ul>`;

    }
}

export default createUserArea;
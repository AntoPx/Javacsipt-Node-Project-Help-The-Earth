"use strict";

export function createNavLink(role) {
    return  `<div class="btn-group">
                <a href="/" class="big-text2 tw">HOME</a>
            </div>
            <div class="btn-group">
                <button type="button" class="btn dropdown-toggle tw" data-bs-toggle="dropdown" aria-expanded="true">
                    Categorie
                </button>
                ${createDropdownCateg()}
            </div>
            <div class="btn-group">
                <button type="button" class="btn dropdown-toggle tw ${role === 0? 'visually-hidden' : ''}" data-bs-toggle="dropdown" aria-expanded="true">
                    Progetti
                </button>
                ${createDropdownProj(role)}
            </div>
            <div class="btn-group">
                <button type="button" class="btn dropdown-toggle tw ${role === 0? 'visually-hidden' : ''}" data-bs-toggle="dropdown" aria-expanded="true">
                    Documenti
                </button>
                ${createDropdownDoc()}
            </div>`;
}

function createDropdownProj(role) {
    return `<ul class="dropdown-menu">
                <li><a class="dropdown-item ${role !== 1? 'visually-hidden' : ''}" href="/projects/my-projects">Miei</a></li>
                <li><a class="dropdown-item" href="/projects/followed">Preferiti</a></li>
            </ul>`;
}

function createDropdownDoc() {
    return `<ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/documents/bookmarked">Seguiti</a></li>
                <li><a class="dropdown-item" href="/documents/purchase">Acquistati</a></li>
            </ul>`;
}

function createDropdownCateg() {
    return `<ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/sport-projects">Sport</a></li>
                <li><a class="dropdown-item" href="/emergency-projects">Emergenze</a></li>
                <li><a class="dropdown-item" href="/eco-projects">Eco-green</a></li>
            </ul>`;
}

export default createNavLink;
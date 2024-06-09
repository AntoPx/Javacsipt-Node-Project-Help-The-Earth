'use strict';

class Project {

    constructor(id, title, description, category, image, author) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.image = image;
        this.author = author;
    }
}

module.exports = Project;
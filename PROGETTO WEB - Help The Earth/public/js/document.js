'use strict';

class Document {

    constructor(id, title, description, date, cost, project, owner) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.cost = cost;
        this.project = project;
        this.owner = owner;
    }

    static from(json) {
        const p = Object.assign(new Document(), json);

        return p;
    }

}

export default Document;
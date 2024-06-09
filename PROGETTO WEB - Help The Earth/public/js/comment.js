'use strict';

class Comment {

    constructor(id, date, text, creator, document) {
        this.id = id;
        this.date = date;
        this.text = text;
        this.creator = creator;
        this.document = document;
    }

    static from(json) {
        const p = Object.assign(new Comment(), json);

        return p;
    }

}

export default Comment;
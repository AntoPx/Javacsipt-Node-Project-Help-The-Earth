'use strict';
import Project from './project.js';

class ProjectManager {
    
    constructor() {
        this.projects = [];
    }

    // Get all projects
    async getAllProjects() {
        let response = await fetch('/api/projects');
        const projectsJson = await response.json();

        if(response.ok) {
            this.projects = projectsJson.map((x) => Project.from(x));
            return this.projects;
        } else throw projectsJson;
    }

    // Get all category projects
    async getCategoryProjects(categ) {
        let response = await fetch('/api/projects');
        const projectsJson = await response.json();

        if(response.ok) {
            this.projects = projectsJson.filter((x) => x.category === categ).map((x) => Project.from(x));
            return this.projects;
        } else throw projectsJson;
    }

    // Get all user's projects
    async getAllProjectsByUser() {
        let response = await fetch('/api/projects');
        const projectsJson = await response.json();

        if(response.ok) {
            const userSenderId = JSON.parse(localStorage.getItem('user')).id;
            this.projects = projectsJson.filter((x) => x.author === userSenderId).map((x) => Project.from(x));
            return this.projects;
        } else throw projectsJson;
    }

    //Get all followed project
    async getAllFollowedProjects() {
        const userId = JSON.parse(localStorage.getItem('user')).id;

        let response = await fetch(`/api/projects-followed/${userId}`);
        const projectsJson = await response.json();

        if(projectsJson.length === 0)
            document.getElementById('app-container').innerHTML = '<h1 class="margintop-3">Nessun progetto seguito</h1>';

        if(response.ok) {
            this.projects = projectsJson.map((x) => Project.from(x));
            return this.projects;
        } else throw projectsJson;
    }

    // Get specific project
    async getProject(id) {
        let response = await fetch(`/api/project/${id}`);
        const projectJson = await response.json();

        if(response.ok) {
            return Project.from(projectJson);
        } else throw projectJson;
    }
}

export default ProjectManager;
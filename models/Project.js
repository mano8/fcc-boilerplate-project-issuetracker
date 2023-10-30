let mongoose = require('mongoose')
let validator = require('validator')
const MongoHelper = require('../utils/mongoHelper');
const Ut = require('../utils/utils');
var slugify = require('slugify')
let projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Project name is required!'],
            unique: [true, 'Project name must be unique!'],
            trim: true,
            minLength: [
                2, 
                'Project name must contain at least two characters!'
            ],
            maxLength: [
                80, 
                'Project name must contain 80 characters maxi!'
            ],
            match: [
                /^([A-zÀ-ú0-9 ]+(?:(?:[_-])[A-zÀ-ú0-9 ]+)*)$/, 
                'Project name can contain only Alphanumerical characters or "[_-]", spaces and accents are accepted.'
            ]
        },
        slug:{
            type: String,
            unique: [true, 'Project slug must be unique!'],
            trim: true,
            minLength: [
                2, 
                'Project slug must contain at least two characters!'
            ],
            maxLength: [
                80, 
                'Project slug must contain 80 characters maxi!'
            ],
            match: [
                /^([A-z0-9]+(?:(?:[_-])[A-z0-9]+)*)$/, 
                'Project slug can contain only Alphanumerical characters or "[_-]".'
            ]
        }
    },
    {
        statics: {
            unslugify(value){
                let result;
                if(Ut.isStrNotEmpty(value)){
                    result = value.replace('-', ' ');
                    result = Ut.capitalize(result)
                }
                return result
            },
            getProjectBySlug(projectSlug){
                return new Promise((resolve, reject) => {
                    this.findOne({"slug": projectSlug})
                        .then(projectItem=>{
                            if(Ut.isObject(projectItem)){
                                resolve(projectItem)
                            }
                            else{
                                resolve(`Undefined project with slug ${projectSlug}`)
                            }
                            
                        })
                        .catch((err)=>{
                            reject(err)
                        })
                }) 
            },
            getOrCreateProjectBySlug(projectSlug){
                return new Promise((resolve, reject) => {
                    this.getProjectBySlug(projectSlug)
                        .then((projectFind)=>{
                            if(Ut.isObject(projectFind)){
                                resolve(projectFind)
                            }
                            else{
                                this.create({"name": this.unslugify(projectSlug)})
                                    .then(createdProject=>{
                                        resolve(createdProject)
                                    })
                                    .catch(err=>{
                                        reject(err)
                                    });
                            }
                        })
                        .catch((err)=>{
                            reject(err)
                        });
                });
                
            }
        }
    });

    projectSchema.pre('save', function (next) {
        this.slug = slugify(this.name);
        next();
       });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
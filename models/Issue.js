const mongoose = require('mongoose')
const validator = require('validator')
const Project = require('../models/Project.js');
const Ut = require('../utils/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const MongoHelper = require('../utils/mongoHelper');
let issueSchema = new mongoose.Schema(
    {
        project_id: {
            type: ObjectId,
            required: true,
        },
        issue_title: {
            type: String,
            required: true,
        },
        issue_text: {
            type: String,
            required: true,
        },
        created_on: {
            type: String,
            default: MongoHelper.getIsoDate(),
        },
        updated_on: {
            type: String,
            default: MongoHelper.getIsoDate(),
        },
        created_by: {
            type: String,
            required: true
        },
        assigned_to: {
            type: String,
        },
        open: {
            type: Boolean,
            default: true,
        },
        status_text: {
            type: String,
        }
    },
    {
        statics: {
            getIssueKeys() {
                return [
                    '_id', 'issue_title', 'issue_text',
                    'created_by', 'assigned_to', 'status_text',
                    'created_on', 'updated_on', 'open'
                ];
            },
            getIssueFilters(projectId, filters) {
                let cleanedFilters = Ut.filterObjectByKey(filters, this.getIssueKeys())
                if (Ut.isObject(cleanedFilters)) {
                    let result = { ...cleanedFilters }
                    result.project_id = projectId
                    return result
                }
                return { project_id: projectId }
            },
            prepareIssue(userIssue, getEmpty=false){
                let result;
                if(Ut.isObject(userIssue)){
                    result = Ut.filterObjectByKey(userIssue, this.getIssueKeys(), getEmpty);
                    if(result.open !== undefined && result.open !== ''  && result.open !== null){
                        result.open = (result.open === true || result.open === 'true') ? true : false;
                    }
                    
                }
                return result;
            },
            getIssuesByProjectSlug(projectSlug, filters = null) {
                return new Promise((resolve, reject) => {
                    Project.getProjectBySlug(projectSlug)
                        .then(projectItem => {
                            const issueFilters = this.getIssueFilters(projectItem._id, filters)
                            this.find(issueFilters)
                                .select(this.getIssueKeys())
                                .then(issueItems => {
                                    resolve(issueItems)
                                })
                                .catch(error => {
                                    reject(error)
                                })
                        })
                        .catch(error => {
                            reject(error)
                        })
                })
            },
            AddIssue(projectSlug, issueData) {
                return new Promise((resolve, reject) => {
                    Project.getOrCreateProjectBySlug(projectSlug)
                        .then(projectItem => {
                            let issueItem =this.prepareIssue(issueData)
                            if(Ut.isObject(issueItem)){
                                issueItem.project_id = projectItem._id;
                                this.create(issueItem)
                                    .then(savedIssue=>{
                                        resolve(savedIssue)
                                    })
                                    .catch(error => {
                                        reject(error)
                                    })
                            }else{
                                reject("Unable to create new Issue, invalid data.")  
                            }
                        })
                        .catch(error => {
                            reject(error)
                        })
                })
            },
            UpdateIssue(projectSlug, issueData) {
                return new Promise((resolve, reject) => {
                    Project.getOrCreateProjectBySlug(projectSlug)
                        .then(projectItem => {
                            
                            let issueItem =this.prepareIssue(issueData, true)
                            if(!Ut.isStrNotEmpty(issueItem._id)){
                                resolve({ error: 'missing _id', '_id': issueItem._id })
                            }
                            else if(Ut.isObject(issueItem)){
                                issueItem.project_id = projectItem._id;
                                const issueId = issueItem._id;
                                delete issueItem._id;
                                if(Object.keys(issueItem).length > 1){
                                    this.findByIdAndUpdate(issueId, issueItem, {returnDocument: 'after'})
                                    .then(savedIssue=>{
                                        resolve(savedIssue)
                                    })
                                    .catch(() => {
                                        resolve({ error: 'could not update', '_id': issueItem._id })
                                    })
                                }
                                else{
                                    resolve({ error: 'no update field(s) sent', '_id': issueId })
                                }
                            }else{
                                resolve({ error: 'could not update', '_id': issueItem._id })  
                            }
                        })
                        .catch(() => {
                            reject({ error: 'could not update', '_id': 0 })
                        })
                })
            },
            deleteIssueById(issueId){
                return new Promise((resolve, reject)=>{
                    if(Ut.isStrNotEmpty(issueId)){
                        this.deleteOne({"_id": issueId})
                            .then((data)=>{
                            if(Ut.isObject(data) && Ut.isPositiveNumber(data.deletedCount)){
                                resolve({ result: 'successfully deleted', '_id': issueId })
                            }else{
                                resolve({ error: 'could not delete', '_id': issueId })
                            }
                            
                            })
                            .catch((err)=>{
                                resolve({ error: 'could not delete', '_id': issueId })
                            })
                    }
                    else{
                        resolve({ 'error': 'missing _id' })
                    }
                })
              
            }

        }
    }
);

issueSchema.pre('validate', function (next) {
    this.updated_on = MongoHelper.getIsoDate();
    next();
   });

module.exports = mongoose.model('Issue', issueSchema);
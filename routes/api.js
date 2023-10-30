'use strict';
let Project = require('../models/Project.js');
let Issue = require('../models/Issue.js');
const Ut = require('../utils/utils');
module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      const projectSlug = req.params.project;
      const filters = req.query
      Issue.getIssuesByProjectSlug(projectSlug, filters)
        .then(issueItems => {
          res.json(issueItems)
        })
        .catch(err=> {
          res.json({ 'error': 'Not Found' })
        })
    })

    .post(function (req, res) {
      const projectSlug = req.params.project;
      const issueItem = req.body;
      Issue.AddIssue(projectSlug, issueItem)
        .then(savedIssue=>{
          res.json(Ut.filterObjectByKey(savedIssue.toObject(), Issue.getIssueKeys()))
        })
        .catch(err=> {
          res.json({ error: 'required field(s) missing' })
        })
    })

    .put(function (req, res) {
      const projectSlug = req.params.project;
      const issueItem = req.body;
      Issue.UpdateIssue(projectSlug, issueItem)
        .then(savedIssue=>{
          if(Ut.isObject(savedIssue) && !savedIssue.hasOwnProperty('error')){
            res.json({  result: 'successfully updated', '_id': savedIssue._id })
          } 
          else{
            res.json(savedIssue)
          }
        })
        .catch(err=> {
          res.json({ error: 'Fatal Error'})
        })
    })

    .delete(function (req, res) {
      let issueId = req.body._id;
      Issue.deleteIssueById(issueId)
        .then(result=>{
          res.json(result)
        })
        .catch(err=> {
          res.json({ error: 'Fatal Error' })
        })
    });

};

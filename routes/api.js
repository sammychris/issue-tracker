/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

require('dotenv').config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let searchQuery = req.query;

      if (searchQuery._id) searchQuery._id = new ObjectId(searchQuery._id);
      if (searchQuery.open) searchQuery.open = String(searchQuery.open) == "true";
      
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        db.collection(project)
          .find(searchQuery).toArray((err, data) => res.json(data));
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };

      if(!issue.issue_title || !issue.issue_text || !issue.created_by) return res.send('missing inputs');

      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection(project).insertOne(issue, (err, data) => {
          expect(err).to.equal(null);
          issue._id = data.insertedId;
          res.json(issue);
        })
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let _id = req.body._id.trim();
      delete req.body._id;
      let newData = req.body;
      for(let key in newData) if(!newData[key].trim()) delete  newData[key];

      if(newData.open) newData.open = newData.open == 'true';
      if(Object.keys(newData).length === 0) return res.send('No Updated Field Sent');
      
      newData.updated_on = new Date();
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection(project).updateOne({_id: new ObjectId(_id)}, { $set: newData}, () => {
            res.send('Updated Successfully!');
            console.log('Updated Successfully!');
          });
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let _id = req.body._id.trim();
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        expect(err).to.equal(null);
        db.collection(project).deleteOne({_id: new ObjectId(_id)}, (err, data) => {
          expect(err).to.equal(null);
          res.send('Deleted '+_id);
          console.log('Deleted Successfully!');
        });
      });
    });
    
};

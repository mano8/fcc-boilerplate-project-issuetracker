const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let _id_test;
suite('Functional Tests', function () {
    suite('test /api/issues/{project}', function () {
        test('Test POST /api/issues/apitest complete form', function (done) {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    issue_title: 'test',
                    issue_text: 'new test',
                    created_by: 'toto',
                    assigned_to: 'titi',
                    status_text: 'running'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.equal(res.body.issue_title, "test");
                    assert.strictEqual(res.body.issue_text, "new test");
                    assert.strictEqual(res.body.created_by, "toto");
                    assert.strictEqual(res.body.assigned_to, "titi");
                    assert.strictEqual(res.body.status_text, "running");
                    assert.strictEqual(res.body.open, true);
                    _id_test = res.body._id;
                    done();
                });
        });

        test('Test POST /api/issues/apitest required fields', function (done) {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    issue_title: 'test',
                    issue_text: 'new test',
                    created_by: 'toto'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.strictEqual(res.body.issue_title, "test");
                    assert.strictEqual(res.body.issue_text, "new test");
                    assert.strictEqual(res.body.created_by, "toto");
                    assert.strictEqual(res.body.open, true);
                    done();
                });
        });

        test('Test POST /api/issues/apitest missing required fields', function (done) {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    issue_title: 'test',
                    issue_text: 'new test'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'error', 'response should return an error');
                    assert.strictEqual(res.body.error, "required field(s) missing");
                    done();
                });
        });

        test('Test GET /api/issues/apitest request', function (done) {
            chai
                .request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isTrue(res.body.length > 0)
                    done();
                });
        });

        test('Test GET /api/issues/apitest with one filter', function (done) {
            chai
                .request(server)
                .get('/api/issues/apitest?issue_title=test')

                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isObject(res.body[0], 'the first item should be an object');
                    assert.strictEqual(res.body[0].issue_title, "test");
                    done();
                });
        });

        test('Test GET /api/issues/apitest with multiple filters', function (done) {
            chai
                .request(server)
                .get('/api/issues/apitest?issue_title=test&open=true')

                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isObject(res.body[0], 'the first item should be an object');
                    assert.strictEqual(res.body[0].issue_title, "test");
                    done();
                });
        });

        test('Test PUT /api/issues/apitest Update one field', function (done) {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: _id_test,
                    issue_title: 'test1A2B'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'result', 'response should return a result message');
                    assert.strictEqual(res.body.result, "successfully updated");
                    assert.strictEqual(res.body._id, _id_test);
                    done();
                });
        });

        test('Test PUT /api/issues/apitest Update multiple field', function (done) {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: _id_test,
                    issue_title: 'test1A2B',
                    issue_text: 'new test1A2B',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'result', 'response should return a result message');
                    assert.strictEqual(res.body.result, "successfully updated");
                    assert.strictEqual(res.body._id, _id_test);
                    done();
                });
        });

        test('Test PUT /api/issues/apitest Update with missing _id', function (done) {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    issue_title: 'test1A2B',
                    issue_text: 'new test1A2B',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'error', 'response should return an error message');
                    assert.strictEqual(res.body.error, "missing _id");
                    done();
                });
        });

        test('Test PUT /api/issues/apitest Update with no fields to update', function (done) {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: _id_test
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'error', 'response should return an error message');
                    assert.strictEqual(res.body.error, "no update field(s) sent");
                    assert.strictEqual(res.body._id, _id_test);
                    done();
                });
        });

        test('Test PUT /api/issues/apitest Update with an invalid _id', function (done) {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: false,
                    issue_text: 'new test1A2B',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'error', 'response should return an error message');
                    assert.strictEqual(res.body.error, "could not update");
                    done();
                });
        });

        test('Test DELETE /api/issues/apitest DELETE', function (done) {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: _id_test
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'result', 'response should return a result message');
                    assert.strictEqual(res.body.result, "successfully deleted");
                    assert.strictEqual(res.body._id, _id_test);
                    done();
                });
        });

        test('Test DELETE /api/issues/apitest DELETE with an invalid _id', function (done) {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    _id: false
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, 'error', 'response should return an error message');
                    assert.equal(res.body.error, 'could not delete');
                    done();
                });
        });

        test('Test DELETE /api/issues/apitest DELETE with an invalid _id', function (done) {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    console.log('test /api/convert -> body: ', res.body)
                    assert.equal(res.body.error, "missing _id");
                    done();
                });
        });

    })
});

teardown(function() {
    chai.request(server)
      .get('/')
  });

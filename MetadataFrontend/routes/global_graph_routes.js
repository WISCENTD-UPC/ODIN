/**
 * Created by snadal on 18/05/16.
 */
var fs = require('fs'),
    formidable = require('formidable'),
    config = require(__dirname+'/../config'),
    request = require('request'),
    randomstring = require("randomstring"),
    async = require('async'),
    upload_path = config.FILES_PATH;

exports.getGlobalGraph = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "globalGraph/"+req.params.globalGraphID, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving global graph");
        }
    });
};

exports.deleteGlobalGraph = function (req, res, next) {
    request.delete(config.METADATA_DATA_LAYER_URL + "globalGraph/"+req.params.globalGraphID, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).send("OK");
        } else {
            res.status(500).send("Error retrieving global graph");
        }
    });
};

exports.getGlobalGraphFromNamedGraph = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "globalGraph/namedGraph/"+encodeURIComponent(req.params.namedGraph), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving global graph");
        }
    });
};

/*
exports.getBDIOntologyFromGraph = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "bdi_ontology/graph/"+encodeURIComponent(req.params.graph), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving BDI Ontology");
        }
    });
};
*/
exports.getAllGlobalGraphs = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "globalGraph/", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving list of global graphs");
        }
    });
};

exports.getFeaturesForGraph = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/features", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving list of features for the global graph");
        }
    });
};

exports.getFeaturesConceptsForGraph = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/featuresAndConcepts", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error retrieving list of features and concepts for the global graph");
        }
    });
};

exports.postGlobalGraph = function (req, res, next) {
    if (!(req.body.hasOwnProperty('name')) || req.body.name==null
       || !(req.body.hasOwnProperty('defaultNamespace')) || req.body.defaultNamespace==null){
        res.status(400).json({msg: "(Bad Request) data format: {name, defaultNamespace}"});
    } else {
        var objGlobalGraph = new Object();
        objGlobalGraph.name = req.body.name;
        objGlobalGraph.defaultNamespace = req.body.defaultNamespace;

        request.post({
            url: config.METADATA_DATA_LAYER_URL + "globalGraph/",
            body: JSON.stringify(objGlobalGraph)
        }, function done(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(JSON.parse(body));
            } else {
                res.status(500).send("Error storing global graph");
            }
        });
    }
};

exports.postGraph = function (req, res, next) {
    request.post({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/triple/",
        data: req.body
    }, function done(err, results) {
        res.status(200).json("ok");
    });
};

exports.postTriple = function (req, res, next) {
    request.post({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/triple/",
        data: req.body
        //encodeURIComponent(req.body.s) + "/" + encodeURIComponent(req.body.p) + "/" + encodeURIComponent(req.body.o)
    }, function done(err, results) {
        res.status(200).json("ok");
    });
};

exports.postGraphicalGraph = function (req, res, next) {
    request.post({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+req.params.globalGraphID+"/graphicalGraph",
        body: JSON.stringify(req.body.graphicalGraph)
    }, function done(err, results) {
        res.status(200).json("ok");
    });
};

exports.postTTL = function (req, res, next) {
    request.post({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/TTL",
        body: JSON.stringify(req.body)
    }, function done(err, results) {
        res.status(200).json("ok");
    });
};

exports.postImport = function (req, res, next) {
    var form = new formidable.IncomingForm({uploadDir: upload_path});
    var resultForm = new Object();

    form.on('file', function(field, file) {
        var newFilePath = form.uploadDir + "/"+Date.now() + '-' + file.name
        fs.rename(file.path, newFilePath,
            function (err) {if (err) throw err;});

        resultForm.path = newFilePath;

    });

    form.on('field', function(name, field) {
        resultForm.name = field;
    });

    form.on('error', function (err) {
        console.log('An error has occured with datasource form upload' + err);
    });

    form.parse(req, function (err, fields, files) {
        const formData = {
            // Pass data via Streams
            "file":  fs.createReadStream(resultForm.path)
        };
        request.post({url:config.METADATA_DATA_LAYER_URL + "globalGraph/upload", formData: formData}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            var pathFront = resultForm.path
            resultForm.path = body;
            console.log("GlobalGraph upload successful, file path is: "+resultForm.path);
            request.post({
                url: config.METADATA_DATA_LAYER_URL + "globalGraph/import",
                body:JSON.stringify(resultForm)
            }, function done(err, results) {
                fs.unlink(pathFront, (err) => {
                    if (err) {
                        console.log("failed to delete local file from frontend:"+err);
                    }
                });
                res.status(200).json("ok");
            });
        });
    });


};

exports.deleteNode = function (req, res, next) {
    request.delete({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/node",
        body: JSON.stringify(req.body)
    }, function done(err, results) {
        if(results.statusCode == 409)
            res.status(409).json("cannot delete");
        else
            res.status(200).json("ok");
    });
};

exports.deleteProperty = function (req, res, next) {
    request.delete({
        url: config.METADATA_DATA_LAYER_URL + "globalGraph/"+encodeURIComponent(req.params.namedGraph)+"/property",
        body: JSON.stringify(req.body)
    }, function done(err, results) {
        if(results.statusCode == 409)
            res.status(409).json("cannot delete");
        else
            res.status(200).json("ok");
    });
};

exports.postSparQLQuery = function (req, res) {
    var query = req.body;
    request.post({
        url: config.METADATA_DATA_LAYER_URL + "bdi_ontology/sparQLQuery/",
        body: JSON.stringify(query)
    }, function done(error, response, body) {
        //console.log("Got response "+error+" - "+response+" - "+body);
        if (!error && response.statusCode == 200) {
            res.status(200).json(JSON.parse(body));
        } else {
            res.status(500).send("Error posting SparQL query");
        }
    });
};
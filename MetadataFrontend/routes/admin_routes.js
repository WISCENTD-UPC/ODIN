/**
 * Created by snadal on 7/06/16.
 */
var fs = require('fs'),
    config = require(__dirname+'/../config'),
    request = require('request'),
    path = require('path'),
    randomstring = require("randomstring"),
    async = require('async');

exports.deleteAll = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "admin/deleteAll/", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //delete directory for datasources uploaded
            fs.readdir(config.FILES_PATH, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(config.FILES_PATH, file), err => {
                        if (err) throw err;
                    });
                }
            });
            res.status(200).json((body));
        } else {
            res.status(500).send("Error");
        }
    });
};

exports.demoPrepare = function (req, res, next) {
    request.get(config.METADATA_DATA_LAYER_URL + "admin/demoPrepare/", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json((body));
        } else {
            res.status(500).send("Error");
        }
    });
};

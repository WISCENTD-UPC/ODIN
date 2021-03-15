/**
 * Created by Kashif-Rabbani
 */
function getIntegratedFileDetails() {
    $.get("/bdiIntegratedDataSources", function (data) {
        console.log(data);
        var i = 1;
        $.each((data), function (key, value) {

            var dataSource = JSON.parse(value);

            var dataSourcesNames = [];

            dataSource.dataSources.forEach(function (ds) {
                //console.log(ds.dataSourceName);
                dataSourcesNames.push(ds.dataSourceName);
            });

            // if(dataSource.name){
            //    var fakeName = "WISCENTD";
            // }

            // if(dataSource.schema_iri){
            //     var fakeIri = "http://who.int/a8412bf6c634499e93f2b58b0c4d56e8";
            // }

            $('#integratedDataSources').find('tbody')
                .append($('<tr>')
                    .append($('<td>').append('<input type="checkbox" class="dataSourceCheckbox" name="dataSource" value = "' + dataSource.dataSourceID + "__" + dataSource.name + '" /> '))
                    .append($('<td>')
                        .text(i)
                    ).append($('<td>').text(dataSource.name))
                    .append($('<td>')
                        .text(dataSourcesNames.join(", "))
                    ).append($('<td>')
                        .text(dataSource.schema_iri)
                    )//.append($('<td>').append($('<a href="/view_data_source?dataSourceID=' + (dataSource.dataSourceID) + '">').append($('<span class="fa fa-search"></span>'))))
                    .append($('<td class="text-center">').append($('<a href="/view?IntegratedDataSourceID=' + (dataSource.dataSourceID) + '">').append($('<span class="fa fa-search"></span>')))
                    ).append($('<td class="text-center BootstrapActionButton">')
                        .append($('<button  value="' + dataSource.dataSourceID + '" class="btn btn-outline-dark pop-function bootstrap-button" rel="popover" >').append($('<i color="green" class="fa fa-circle-notch "></i></button>'))))
                    .append($('<td class="text-center deleteWrapper">')
                        .append($('<button  value="' + dataSource.dataSourceID + '" class="btn btn-outline-light pop-function delete-button" rel="popover" >').append($('<span color="red" class="fa fa-trash"></span></button>'))))
                );

            ++i;
        });
    });
}

function getParsedFileDetails() {
    $.get("/bdiDataSources", function (data) {
        console.log(data);
        var i = 1;
        $.each((data), function (key, value) {
            var dataSource = JSON.parse(value);
            $('#dataSources').find('tbody')
                .append($('<tr>')
                    .append($('<td>').append('<input type="checkbox" class="dataSourceCheckbox" name="dataSource" value = "' + dataSource.dataSourceID + "__" + dataSource.name + '" /> '))
                    .append($('<td>')
                        .text(i)
                    ).append($('<td>')
                        .text(dataSource.name)
                    ).append($('<td>')
                        .text(dataSource.type)
                    ).append($('<td>')
                        .text(dataSource.schema_iri)
                    )//.append($('<td>').append($('<a href="/view_data_source?dataSourceID=' + (dataSource.dataSourceID) + '">').append($('<span class="fa fa-search"></span>'))))
                    .append($('<td class="text-center">').append($('<a href="/view?dataSourceID=' + (dataSource.dataSourceID) + '">').append($('<span class="fa fa-search"></span>')))
                    )
                    .append($('<td class="text-center deleteWrapper">')
                        .append($('<button  value="' + dataSource.dataSourceID + '" class="btn btn-outline-light pop-function delete-button" rel="popover" >').append($('<span color="red" class="fa fa-trash"></span></button>'))))
                );

            ++i;
        });
    });
}

function handler(dataSource) {
    $.ajax({
        url: '/fileupload',
        method: "POST",
        data: dataSource,
        processData: false,
        contentType: false,
        xhr: function () {
            var xhr = new XMLHttpRequest();
            console.log("Printing data source information");
            console.log(dataSource);
            if (dataSource.get("givenType") !== 'SQL') {
                // Add progress event listener to the upload.
                xhr.upload.addEventListener('progress', function (event) {
                    var progressBar = $('.progress-bar');

                    if (event.lengthComputable) {
                        var percent = (event.loaded / event.total) * 100;
                        progressBar.width(percent + '%');

                        if (percent === 100) {
                            progressBar.removeClass('active');
                        }
                    }
                });
            }
            return xhr;
        }
    }).done(function (data) {
        console.log({ data })
        console.log("Return: " + JSON.stringify(data));
        console.log(data[0].filename.split('.').pop());
        var fileExtension = data[0].filename.split('.').pop();
        console.log({ fileExtension })
        console.log(data[0].status)
        if (data[0].status === true && data[0].type === fileExtension) {
            parseSource(data);
        } else {
            alert("Please check the file format. You have selected " + data[0].type + " but you are uploading a " + fileExtension + " file");
        }

    }).fail(function (err) {
        alert("Error " + JSON.stringify(err));
    });
}

function parseSource(data) {
    console.log(JSON.stringify(data));
    toggleModal();
    var clickHandler = function (ee) {
        ee.preventDefault();
        ee.stopImmediatePropagation();
        toggleModal();
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/triggerExtraction',
            success: function (response) {
                console.log({ response })
                console.log('Success');
                console.log(JSON.stringify(response));
                window.location.href = '/bdi';
            },
            error: function (response) {
                alert('Upload failed \n Please check if OWL2VOWL Service is running?\n' + JSON.stringify(response.responseText));
                console.log(JSON.stringify(response));
            }
        });
        return false;
    };
    $('#ModalProceedButton').one('click', clickHandler);
}

function toggleModal() {
    $('#confirmationModal').modal('toggle');
}

function handleProgressBar() {
    $('#json-tab').on('click', function () {
        $('.progress-bar').width('0%');
        $(this).closest('form').find("input[type=file],input[type=text]").val("");
    });

    $('#xml-tab').on('click', function () {
        $('.progress-bar').width('0%');
        $(this).closest('form').find("input[type=file],input[type=text]").val("");
    });

    $('#csv-tab').on('click', function () {
        $('.progress-bar').width('0%');
        $(this).closest('form').find("input[type=file],input[type=text]").val("");
    });

    $('#sqldatabase-tab').on('click', function () {
        $('.progress-bar').width('0%');
        $(this).closest('form').find("input[type=file],input[type=text]").val("");
    });

    $('#json_pathForm').on('click', function () {
        $('.progress-bar').width('0%');
    });

    $('#xml_pathForm').on('click', function () {
        $('.progress-bar').width('0%');
    });

    $('#sql_jdbcForm').on('click', function () {
        $('.progress-bar').width('0%');
    });
}

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

//Endpoint per arxius validats[API]
//class active quan es clica a un li
//Submit carrega el li active

function parseKey(key) {
    let ret = btoa(key)
    //while (ret[ret.length-1] === "=") ret.slice(0, -1)
    return ret
}

function printElementsFromHbase() {



    $('#ButtonDataLakeModal').on("click", function () {
        $('#DataLakeModal').modal('toggle')
        if (!$('#DataLakeModal').find('tbody').find("td").length) {
            $.ajax({
                url: "http://localhost:12345/api/hbase/validatedRows",
                type: 'GET',
                dataType: 'json', // added data type
            }).done(function (data) {
                console.log($('#DataLakeModal'))
                console.log(data)
                let key = 0;
                let nPages = Math.trunc(data.length/10);
                if(data.length%10 !== 0) ++nPages;
                console.log(nPages)

                if (nPages === 1) {
                    data.forEach(row => {
                        $('#DataLakeModal').find('tbody')
                            .append($('<tr>').attr('id', btoa(row.key).split("=")[0])
                                .append($('<td>').text(row["Data Source Name"]))
                                .append($('<td>').text(row["Data Type"]))
                                .append($('<td>').text(row["Confidentiality"]))
                                .append($('<td>').text(row["Select disease"]))
                                .append($('<td>').text(row.filename))
                                .append($('<td>').text(row.Classification))
                                .on("click", function () {
                                    $(this).parent().children().removeClass("table-active")
                                    $('#' + $(this).attr("id")).addClass("table-active")
                                    $('#SelectedDataLakeRow').text(row["Data Source Name"] + " > " + row.filename)
                                }))
                    })
                } else {
                    for (let i = 0; i < 10; ++i) {
                        row = data[i]
                        $('#DataLakeModal').find('tbody')
                        .append($('<tr>').attr('id', btoa(row.key).split("=")[0])
                            .append($('<td>').text(row["Data Source Name"]))
                            .append($('<td>').text(row["Data Type"]))
                            .append($('<td>').text(row["Confidentiality"]))
                            .append($('<td>').text(row["Select disease"]))
                            .append($('<td>').text(row.filename))
                            .append($('<td>').text(row.Classification))
                            .on("click", function () {
                                $(this).parent().children().removeClass("table-active")
                                //$('#' + btoa($(this).attr("id"))).addClass("table-active")
                                $('#' + $(this).attr("id")).addClass("table-active")
                    
                                $('#SelectedDataLakeRow').text(row["Data Source Name"] + " > " + row.filename)
                            }))
                    }
                    //Add Pagination
                    $("#DLPagination").append(
                        $('<li>').addClass("page-item active").append(
                            $('<a>').addClass("page-link").text("1")
                        )
                    )
                    for (let i = 1; i < nPages; ++i)
                        $("#DLPagination").append(
                            $('<li>').addClass("page-item").append(
                                $('<a>').addClass("page-link").text(i+1)
                            )
                        )
                    $("#DLPagination>li").on("click", function() {
                        $(this).parent().children().removeClass("active")
                        if (!$(this).hasClass("active")) {
                            $(this).addClass("active")
                            let page = $(this)[0].innerText
                            console.log(page)
                            $('#DataLakeModal').find('tbody').empty()
                            for (let i = page*10 - 10; i < page*10 && i < data.length; ++i) {
                                row = data[i]
                                $('#DataLakeModal').find('tbody')
                                .append($('<tr>').attr('id', btoa(row.key).split("=")[0])
                                    .append($('<td>').text(row["Data Source Name"]))
                                    .append($('<td>').text(row["Data Type"]))
                                    .append($('<td>').text(row["Confidentiality"]))
                                    .append($('<td>').text(row["Select disease"]))
                                    .append($('<td>').text(row.filename))
                                    .append($('<td>').text(row.Classification))
                                    .on("click", function () {
                                        $(this).parent().children().removeClass("table-active")
                                        $('#' + $(this).attr("id")).addClass("table-active")
                                        $('#SelectedDataLakeRow').text(row["Data Source Name"] + " > " + row.filename)
                                    }))
                            }
                        }
                    })
                }

                $('#SearchDL-btn').on("click", function() {
                    const searchval = $('#SearchDL').val()
                    if (searchval !== "") {
                        $('#DataLakeModal').find('tbody').empty()
                        const filtered = data.filter((row) => row["Data Source Name"].search(searchval) !== -1)
                        for (let i = 0; i < 10 && i < filtered.length; ++i) {
                            row = filtered[i]
                            $('#DataLakeModal').find('tbody')
                            .append($('<tr>').attr('id', btoa(row.key).split("=")[0])
                                .append($('<td>').text(row["Data Source Name"]))
                                .append($('<td>').text(row["Data Type"]))
                                .append($('<td>').text(row["Confidentiality"]))
                                .append($('<td>').text(row["Select disease"]))
                                .append($('<td>').text(row.filename))
                                .append($('<td>').text(row.Classification))
                                .on("click", function () {
                                    $(this).parent().children().removeClass("table-active")
                                    $('#' + $(this).attr("id")).addClass("table-active")
                                    $('#SelectedDataLakeRow').text(row["Data Source Name"] + " > " + row.filename)
                                }))
                        }
                    } else {
                        $('#DataLakeModal').find('tbody').empty()
                        for (let i = 0; i < 10 && i < data.length; ++i) {
                            row = data[i]
                            $('#DataLakeModal').find('tbody')
                            .append($('<tr>').attr('id', btoa(row.key).split("=")[0])
                                .append($('<td>').text(row["Data Source Name"]))
                                .append($('<td>').text(row["Data Type"]))
                                .append($('<td>').text(row["Confidentiality"]))
                                .append($('<td>').text(row["Select disease"]))
                                .append($('<td>').text(row.filename))
                                .append($('<td>').text(row.Classification))
                                .on("click", function () {
                                    $(this).parent().children().removeClass("table-active")
                                    $('#' + $(this).attr("id")).addClass("table-active")
                                    $('#SelectedDataLakeRow').text(row["Data Source Name"] + " > " + row.filename)
                                }))
                        }
                    }
                })
            })
        }
    })

}

function isXML(xmlStr) {
    var parseXml;

    if (typeof window.DOMParser != "undefined") {
        parseXml = function (xmlStr) {
            return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function (xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        return false;
    }

    try {
        parseXml(xmlStr);
    } catch (e) {
        return false;
    }
    return true;
}

function cleanActiveClasses() {
    $('#local-tab').on("click", function (e) {
        $(".tab-content>div>div>div>ul>li>a").removeClass("active")
    })
    $('#remote-tab').on("click", function (e) {
        $(".tab-content>div>div>ul>li>a").removeClass("active")
    })
    $('#LocalRemoteForm').on("click", function (e) {
        $(".tab-content>div").removeClass("active")
    })
}

$(function () {
    /*    $("#instructions").collapse({
           toggle: true
        });

        $("#schemaInstructions").collapse({
            toggle: true
        });*/

    getParsedFileDetails();
    getIntegratedFileDetails();
    printElementsFromHbase();
    cleanActiveClasses();

    $('#dataSourceForm').on("submit", function (e) {
        e.preventDefault();
        var dataSource = new FormData();
        switch ($($('.nav-tabs .active')[1]).attr("id")) {

            case "json-tab":
                if ($("#file_path").get(0).files.length === 0) {
                    console.log("jsonfile");
                    return false;
                }
                dataSource.append("givenName", $("#givenName").val());
                dataSource.append("givenType", "json");
                // Get the files from input, create new FormData.
                var files = $('#file_path').get(0).files;
                // Append the files to the formData.
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    dataSource.append('JSON_FILE', file, file.name);
                }
                handler(dataSource);
                break;

            case "xml-tab":
                if ($("#xml_path").get(0).files.length === 0) {
                    console.log("xmltab");
                    return false;
                }
                dataSource.append("givenName", $("#givenName").val());
                dataSource.append("givenType", "xml");
                // Get the files from input, create new FormData.
                var filesXML = $('#xml_path').get(0).files;

                // Append the files to the formData.
                for (var x = 0; x < filesXML.length; x++) {
                    var fileXML = filesXML[x];
                    dataSource.append('XML_FILE', fileXML, fileXML.name);
                }
                handler(dataSource);
                break;

            case "csv-tab":
                if ($("#csv_path").get(0).files.length === 0) {
                    console.log("csvtab");
                    return false;
                }
                dataSource.append("givenName", $("#givenName").val());
                dataSource.append("givenType", "csv");
                // Get the files from input, create new FormData.
                var filesCSV = $('#csv_path').get(0).files;

                // Append the files to the formData.
                for (var k = 0; k < filesCSV.length; k++) {
                    var fileCSV = filesCSV[k];
                    dataSource.append('CSV_FILE', fileCSV, fileCSV.name);
                }
                handler(dataSource);
                break;

            case "sqldatabase-tab":

                if ($("#sql_path").val() === '') {
                    console.log("sqldb");
                    return false;
                }
                dataSource.append("givenName", $("#givenName").val());
                dataSource.append("givenType", "SQL");
                dataSource.append("sql_jdbc", $("#sql_path").val());
                handler(dataSource);
                break;

            case "datalake-tab":
                const key = $('#SelectedDataLakeRow')[0].innerHTML
                const URL = "http://localhost:12345/api/hbase/getData/" + encodeURI(key)
                const filename = key.split('$')[2]
                console.log(filename)
                $.ajax({
                    url: URL,
                    type: 'GET',
                    dataType: 'json'
                }).done(function (data) {
                    console.log(data)
                    const result = data.$
                    var blob = new Blob([_base64ToArrayBuffer(data.$)]);
                    console.log(blob)
                    const file = new File([blob], "testname.json", {
                        type: "application/json",
                    })
                    var dataSource = new FormData();
                    dataSource.append("givenName", $("#givenName").val());
                    blob.text().then((text) => {
                        try {
                            JSON.parse(text);
                            // Do your JSON handling here
                            console.log("detected json file")
                            dataSource.append("givenType", "json");
                            dataSource.append('JSON_FILE', file, "filename1337.json")
                            handler(dataSource);
                        } catch (err) {
                            console.log(err)
                            if (/^([a-zA-Z0-9\s_\\.\-:])+(.json)$/.test(filename.toLowerCase())) {
                                try {
                                    JSON.parse(text.split("}")[0] + "}")
                                    console.log("detected json file")
                                    dataSource.append("givenType", "json")
                                    dataSource.append('JSON_FILE', file, "filename1337.json")
                                    handler(dataSource);
                                } catch (err) {
                                    // Is CSV?
                                    // TODO: Check length
                                    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
                                    if (regex.test(filename.toLowerCase())) {
                                        console.log("detected csv file")
                                        dataSource.append("givenType", "csv");
                                        dataSource.append('CSV_FILE', file, filename)
                                        handler(dataSource);
                                    } else if (isXML(text)) {
                                        console.log("detected xml file")
                                        dataSource.append("givenType", "xml");
                                        dataSource.append('CSV_FILE', file, filename)
                                        handler(dataSource);
                                    } else {
                                        alert("Please check the file format. You have should upload a csv, a json or a xml file");
                                    }
                                }
                            } else {
                                // Is CSV?
                                var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
                                if (regex.test(filename.toLowerCase())) {
                                    console.log("detected csv file")
                                    dataSource.append("givenType", "csv");
                                    dataSource.append('CSV_FILE', file, filename)
                                    handler(dataSource);
                                } else if (isXML(text)) {
                                    console.log("detected xml file")
                                    dataSource.append("givenType", "xml");
                                    dataSource.append('CSV_FILE', file, filename)
                                    handler(dataSource);
                                } else {
                                    alert("Please check the file format. You have should upload a csv, a json or a xml file");
                                }
                            }
                        }
                    })

                })
                break;
        }
    });
    $('#integrateDataSourcesButton').on("click", function (e) {
        e.preventDefault();
        if (!$("#integrateDataSourcesButton").hasClass('disabled')) {
            console.log("Clicked #integrateDataSourcesButton");

            var dataSources = [];
            $.each($("input[name='dataSource']:checked"), function () {
                dataSources.push($(this).val());
            });
            console.log("Selected data Sources are: " + dataSources.join(", "));
            var object = {};
            object.id1 = dataSources[0].split("__")[0];
            object.id2 = dataSources[1].split("__")[0];
            object.s1Name = dataSources[0].split("__")[1];
            object.s2Name = dataSources[1].split("__")[1];
            console.log(object);

            if (object.id1.includes("INTEGRATED-") && object.id2.includes("INTEGRATED-")) {
                console.log("Integration of Global Graphs not allowed yet.");
            } else {
                window.location.href = '/integration/' + object.id1 + '&' + object.id2 + '&' + object.s1Name + '&' + object.s2Name;
            }
        }
    });
    handleProgressBar();
});


$(document).ready(function () {

    if (sessionStorage.getItem('CheckSBSGuideBDI') == "true")
        $('#CheckSBSGuideBDI').prop('checked', true);
    else
        $('#CheckSBSGuideBDI').prop('checked', false);
    $('#CheckSBSGuideBDI').change(function () {
        sessionStorage.setItem('CheckSBSGuideBDI', $(this).prop('checked'));
        if ($(this).prop('checked')) {
            introJs().start();
            introJs().addHints();
        } else {
            introJs().exit();
        }
    });

    if (sessionStorage.getItem('CheckSBSGuideBDI') == "true") {
        introJs().start();
        introJs().addHints();
    }

    $(document).ajaxSend(function () {
        $("#overlay").fadeIn(100);
    });

    $(document).ajaxStop(function () {
        $("#overlay").fadeOut(100);
    });

    var popOverSettings = {
        placement: 'top',
        container: 'body',
        html: true,
        selector: '[rel="popover"]',
        trigger: "focus"
        /*content: function () {
            return $(bodyPopOver).html();
        }*/
    };

    $('body').popover(popOverSettings);

    $("body").on('click', '.delete-button', function () {
        var bodyPopOver =
            '<div id="popover-content">\n' +
            '    <p>Are you sure? <br></p> <button value="' + $(this).val() + '" class="btn btn-sm btn-danger delete-confirmed" id="DeleteButtonSaysYes">Yes</button>\n' +
            '</div>';

        if ($('.popover').hasClass('in')) {
            $(this).popover('hide');
        } else {
            $(this).attr('data-content', bodyPopOver);
            $(this).popover('show');
        }
    });

    $("body").on('click', '.bootstrap-button', function () {
        var bodyPopOver =
            '<div id="popover-content">\n' +
            '    <p>Bootstrapping will take some time. Are you sure to proceed? <br></p> <button value="' + $(this).val() + '" class="btn btn-sm btn-success bootstrap-confirmed" id="DeleteButtonSaysYes">START</button>\n' +
            '</div>';

        if ($('.popover').hasClass('in')) {
            $(this).popover('hide');
        } else {
            $(this).attr('data-content', bodyPopOver);
            $(this).popover('show');
        }
    });

    $("body").on('click', '.delete-confirmed', function () {
        console.log($(this).val());
        $.get("/deleteDataSource/" + $(this).val(), function (data) {
            console.log(data);
            if (data === "DELETED") {
                window.location.href = "/bdi";
            }
        });
    });

    $("body").on('click', '.bootstrap-confirmed', function () {
        console.log($(this).val());
        $.get("/bdiBootstrapping/" + $(this).val(), function (data) {
            console.log(data);
            if (data === "BOOTSTRAPPED") {
                window.location.href = "/bdi";
            } else {
                alert("An error occured while bootstrapping...");
            }
        });
    });


    $("body").on('change', 'input[type=checkbox]', function () {
        //$('[data-toggle="popover"]').popover();
        var checkedCheckedBoxes = $('input[type=checkbox]:checked').length;
        var integrateButton = $("#integrateDataSourcesButton");
        if (checkedCheckedBoxes > 2) {
            $(this).prop('checked', false);
            console.log("You can maximum select two sources at a time.");
        }

        if (checkedCheckedBoxes === 2) {
            integrateButton.removeClass("disabled");
            integrateButton.prop('disabled', false);
        }
        if (checkedCheckedBoxes < 2) {
            integrateButton.addClass("disabled");
            integrateButton.prop('disabled', true);
        }
        /*if (!integrateButton.hasClass('disabled')) {

        }*/
    });


});

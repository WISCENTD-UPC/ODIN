/**
 * Created by snadal on 07/06/16.
 */

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function validation() {
    var flag = true;
    $("input").removeClass("is-invalid")

    if($("#inputHost").val() == ""){
        $("#inputHost").addClass("is-invalid");
        flag = false;
    }

    if($("#inputDBname").val() == ""){
        $("#inputDBname").addClass("is-invalid");
        flag = false;
    }

    if($("#inputUser").val() == ""){
        $("#inputUser").addClass("is-invalid");
        flag = false;
    }


    return flag;
}

function buildJDBCString(){
    var strJDBC = "jdbc:";

   var dbms = $("#selectDBMS").children("option:selected").val();
   if(dbms == "Postgress")
       strJDBC+="postgresql://";
   else if(dbms == "Mysql")
       strJDBC+="mysql://";
   else
       strJDBC+="";

    strJDBC+=$("#inputHost").val();

    if(!$("#inputPort").val() == "")
        strJDBC+=":"+$("#inputPort").val()+"/";
    else
        strJDBC+="/";

    strJDBC+=$("#inputDBname").val();


   if(!$("#inputUser").val() == "" )
        strJDBC+="?user="+$("#inputUser").val()+"&password="+$("#inputPassword").val();

   return strJDBC;
}

$(function() {

    //Trigger label for filename
    $('#json_path').on('change',function(){
        var fileName = $(this).val().replace("C:\\fakepath\\", "");;
        $(this).next('.custom-file-label').html(fileName);
    });
    $('#csv_path').on('change',function(){
        var fileName = $(this).val().replace("C:\\fakepath\\", "");;
        $(this).next('.custom-file-label').html(fileName);
    });

    $('#submitDataSource').on("click", function(e){
        e.preventDefault();

        var dataSource = new Object();
        dataSource.name = $("#name").val();
        if(dataSource.name == ""){
            alert("It's required to give a name.")
            return;
        }

        switch ($('.nav-tabs .active').attr('id')) {
            case "avro-tab":
                dataSource.type = "avro";
                dataSource.avro_path = $("#avro_path").val();
                break;

            case "csv-tab":
                dataSource.type = "csv";
                dataSource.csv_path = uploadFile('#csv_path');
                break;

            case "mongodb-tab":
                dataSource.type = "mongodb";
                dataSource.mongodb_connectionString = $("#mongodb_connectionString").val();
                dataSource.mongodb_database = $("#mongodb_database").val();
                break;

            case "neo4j-tab":
                dataSource.type = "neo4j";
                break;

            case "parquet-tab":
                dataSource.type = "parquet";
                dataSource.parquet_path = $("#parquet_path").val();
                break;

            case "json-tab":
                dataSource.type = "json";
                dataSource.json_path = uploadFile('#json_path');
                // dataSource.json_path = $("#json_path").val();
                break;

            case "restapi-tab":
                dataSource.type = "restapi";
                dataSource.restapi_url = $("#restapi_url").val();
                dataSource.restapi_format = $("#restapi_format").val();
                break;

            case "sqldatabase-tab":
                dataSource.type = "sql";
                dataSource.sql_jdbc = $("#sql_jdbc").val();
                break;
        }
        $.ajax({
            url: '/dataSource',
            method: "POST",
            data: dataSource
        }).done(function() {
            window.location.href = '/manage_data_sources';
        }).fail(function(err) {
            alert("error "+JSON.stringify(err));
        });
    });

    $('#sql_jdbc_test').on("click", function(e){
        e.preventDefault();

        if(!validation())
            return ;

        var dataSource = new Object();
        dataSource.type = "sql";
        dataSource.sql_jdbc = buildJDBCString();

        $.ajax({
            url: 'dataSource/test/connection',
            method: "POST",
            data: dataSource
        }).done(function() {
            $("#alertSQL").empty();
            $("#alertSQL").append("<div class=\"alert alert-green alert-dismissible fade show\" role=\"alert\"><strong>" +
                "Successful connection!</strong><button class=\"close\" type=\"button\" data-dismiss=\"alert\" aria-label=\"Close\"" +
                "><span aria-hidden=\"true\">&times;</span></button></div>");
        }).fail(function(err) {
            $("#alertSQL").empty();
            $("#alertSQL").append("<div class=\"alert alert-red alert-dismissible fade show\" role=\"alert\"><strong>" +
                "Unsuccessful connection!</strong> Make sure the information provided is correct.<button class=\"close\"" +
                " type=\"button\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>");
        });
    });

});


function uploadFile(selector,callback){
    var dataSource = new FormData();
    dataSource.append('file',$(selector).prop('files')[0]);

    var path = "";
    $.ajax({
        url: '/dataSource/fileupload',
        method: "POST",
        data: dataSource,
        processData: false,
        async: false,
        contentType: false,
    }).done(function (data) {
        console.log("Return: " + JSON.stringify(data));
        path = data.path;
    }).fail(function (err) {
        console.log("Error " + JSON.stringify(err));
    });
    return path;
}


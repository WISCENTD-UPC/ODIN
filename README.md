
# Metadata Management System
The Metadata Management System (MDM) is responsible of providing the other components with the necessary information to describe and model raw data, as well as keeping the footprint about data usage. With this purpose, the MDM contains all the metadata artifacts needed to deal with data governance and assist data exploitation.

The main artifact currently managed by the MDM is the Big Data Integration (BDI) ontology. The introduced ontology builds upon known ideas from data integration research and includes two layers in order to provide analysts with an integrated and format-agnostic view of the sources. We exploit this structure to handle the evolution of source schema via semi-automated transformations on the ontology upon service releases. Our approach is based on well known Semantic Web technologies, specifically RDF, which contrary to other schema definition languages (e.g., XSD) enable (a) reutilization of existing vocabularies, (b) self-description of data, and (c) publishing such data on the web.

## Subcomponents
The MDM is composed of two independent subcomponents:
- Metadata Frontend  
- Metadata Storage

### Metadata Frontend
The [Metadata Frontend][mdm_frontend] is a NodeJS webserver which serves as dispatcher for REST API calls, as well as web interface to aid the user on the design and management of the BDI ontology.

In the [config.js][config.properties.frontend] file, different parameters can be customized such as the port where the API is deployed or the pointers to the Metadata Storage port.

The [webpack.config.js][webpack.config.frontend] is used to bundle all files related to the graph gui. Different parameters can be customized such as the output file, minification, etc.

### Metadata Storage
The [Metadata Storage][mdm_storage] is a Java application which exposes its functionalities as REST APIs using Jersey webservices (note, however, that only the Metadata Frontend is supposed to interact with it). This subcomponent implements all algorithms necessary to generate and maintain the BDI ontology, as well as the management of its storage. Precisely, regarding data storage, it uses two data stores:
  - MongoDB, for system metadata such as the pointers to the different RDF graphs composing the ontology
  - Jena TDB, to store the BDI ontology as RDF graphs

In the [web.xml][config.properties.storage] file, different parameters can be customized, such as the location for both the MongoDB and RDF stores.

## External API specification
The specification for the APIs that interact with other components can be found in http://docs.metadatamanagementsystem.apiary.io/

## Installation and deployment instructions
In the following subsections we provide details on the installation of the different subcomponents composing the MDM.

### Metadata Frontend
On the command line, in the Metadata Frontend directory, run the following command to install all the dependent NodeJS modules:

```sh
$ npm install
```
Then, we can start the server:
```sh
$ npm run start
```

### Metadata Storage
This subcomponent can be built using **gradle**, a WAR file must be generated:
```sh
gradle war
```
Once the WAR has been generated, it can be deployed into a servlet container such as **Apache Tomcat**

This subcomponent also requires an external **OWL2VOWL** service to be running prior to execution of both the components:
```sh
java -jar MDM/OWLtoVOWLService/owl2vowl-rest-service.jar
```
Execute the above command to run the service.
### Is it working?
With both services running, issue the following **curl** request.
```sh
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: 2f1123ba-418a-f614-7659-6b59fd6d49d8" -d '{
	"event":"TwitterMonitor",
    "schemaVersion" : "Sample_Version_1",
    "jsonInstances" : "{\"SocialNetworksMonitoredData\":{\"idOutput\":\"12345\",\"confId\":\"67890\",\"searchTimeStamp\":\"2016-07-19 17:23:00.000\",\"numDataItems\":1,\"DataItems\":[{\"idItem\":\"6253282\",\"timeStamp\":\"2016-05-25 20:03\",\"message\":\"Game on. Big ten network in 10 mins. Hoop for water. Flint we got ya back\",\"author\":\"@SnoopDogg\",\"link\":\"https:\/\/twitter.com\/SnoopDogg\/status\/734894106967703552\"}]}}"
}' "http://localhost:3000/release/"
```
You should get a similar output to the following one. This is the Kafka topic where the data analysis components will expect to read the data from the provided event and schema version.
```json
{
    "kafkaTopic" : "11ac9475-0389-41ca-b5d7-224049414863"
}
```

### Change HOSTNAME and PORT of the fetched API (api-data-entry)
The api variables are stored at the first lines of [bdi_index_script.js](MetadataFrontend/public/js/bdi_index_script.js)
```js
const api_config = {
    "HOSTNAME": "localhost",
    "PORT": 12345
}
```

   [mdm_frontend]: <https://github.com/supersede-project/big_data/tree/master/data_management/MetadataManagementSystem/MetadataFrontend>
   [mdm_storage]: <https://github.com/supersede-project/big_data/tree/master/data_management/MetadataManagementSystem/MetadataStorage>
   [config.properties.frontend]: <https://github.com/supersede-project/big_data/blob/master/data_management/MetadataManagementSystem/MetadataFrontend/config.js>
   [config.properties.storage]: <https://github.com/supersede-project/big_data/blob/master/data_management/MetadataManagementSystem/MetadataStorage/src/main/webapp/WEB-INF/web.xml>
   [forever]: <https://github.com/foreverjs/forever>
   [webpack.config.frontend]: <https://github.com/serginf/MDM/blob/webVowl/MetadataFrontend/webpack.config.js>

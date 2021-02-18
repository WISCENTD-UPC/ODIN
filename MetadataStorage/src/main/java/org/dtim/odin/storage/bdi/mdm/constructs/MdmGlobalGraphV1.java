//package org.dtim.odin.storage.bdi.mdm.constructs;
//
//import com.mongodb.MongoClient;
//import Namespaces;
//import GlobalGraph;
//import OWLtoWebVOWL;
//import org.dtim.odin.storage.util.MongoCollections;
//import RDFUtil;
//import Utils;
//import net.minidev.json.JSONObject;
//import org.apache.commons.lang3.StringEscapeUtils;
//import org.apache.jena.query.Dataset;
//import org.apache.jena.query.ReadWrite;
//import org.apache.jena.rdf.model.Model;
//import org.apache.jena.rdf.model.Resource;
//import org.apache.jena.rdf.model.impl.PropertyImpl;
//import org.apache.jena.rdf.model.impl.ResourceImpl;
//import org.bson.Document;
//import org.semarglproject.vocab.RDF;
//
//import java.util.HashMap;
//import java.util.UUID;
//
///**
// * Created by Kashif-Rabbani in September 2019
// */
//public class MdmGlobalGraphV1 {
//    private String bdiGgIri = "";
//    private String mdmGgIri = "";
//    private String bdiGgName = "";
//    private String mdmGgGraphicalGraph = "";
//    HashMap<String, String> nodesIds;
//
//    public HashMap<String, String> getNodesIds() {
//        return nodesIds;
//    }
//
//    MdmGlobalGraphV1(String name, String iri, String mdmGgIri) {
//        this.bdiGgIri = iri;
//        this.bdiGgName = name;
//        this.mdmGgIri = mdmGgIri;
//        run();
//    }
//
//    private void run() {
//        constructGlobalGraph();
//        getGraphicalVowlGraph();
//        insertMdmGgInMongo();
//    }
//
//    private void getGraphicalVowlGraph() {
//        try {
//            OWLtoWebVOWL owltoWebVowl = new OWLtoWebVOWL();
//            owltoWebVowl.setNamespace(Namespaces.G.val());
//            owltoWebVowl.setTitle(bdiGgName);
//            String vowlJson = owltoWebVowl.convert(mdmGgIri);
//            nodesIds = owltoWebVowl.getNodesId();
//            mdmGgGraphicalGraph = "\" " + StringEscapeUtils.escapeJava(vowlJson) + "\"";
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    private void insertMdmGgInMongo() {
//        JSONObject objBody = new JSONObject();
//        MongoClient client = Utils.getMongoDBClient();
//        objBody.put("globalGraphID", UUID.randomUUID().toString().replace("-", ""));
//        objBody.put("namedGraph", mdmGgIri);
//        objBody.put("defaultNamespace", Namespaces.G.val());
//        objBody.put("name", bdiGgName);
//        objBody.put("graphicalGraph", mdmGgGraphicalGraph);
//        MongoCollections.getGlobalGraphCollection(client).insertOne(Document.parse(objBody.toJSONString()));
//        client.close();
//    }
//
//    /**
//     * This method is to transform the Integrated Global Graph into MDM Global Graph i.e. Concepts, features etc...
//     */
//    private void constructGlobalGraph() {
//        Dataset ds = Utils.getTDBDataset();
//        ds.begin(ReadWrite.WRITE);
//
//        //Create MDM Global Graph i.e. create a named graph in the TDB
//        if (ds.containsNamedModel(mdmGgIri)) {
//            //System.out.println("TRUE, already existed. Removing...");
//            ds.removeNamedModel(mdmGgIri);
//        }
//
//        Model mdmGlobalGraph = ds.getNamedModel(mdmGgIri);
//        //System.out.println("Size: " + mdmGlobalGraph.size());
//
//        /* Query to get Classes from BDI Global Graph and convert to Concepts of MDM's Global Graph*/
//        classesToConcepts(mdmGlobalGraph);
//        /* Query to get Properties from BDI Global Graph and convert to Features of MDM's Global Graph*/
//        propertiesToFeatures(mdmGlobalGraph);
//        /* Query to get Object Properties from BDI Global Graph and convert to ????  of MDM's Global Graph AND Create hasRelation edge*/
//        objectPropertiesToRelations(mdmGlobalGraph);
//        /* Query to get Classes and their properties from BDI Global Graph to create hasFeature edges between Concepts and Features of MDM Global Graph*/
//        connectConceptsAndFeatures(mdmGlobalGraph);
//        //Query to get the sameAs or equivalentProperty relationship of features
//        handleSameAsEdges(mdmGlobalGraph);
//        //Query to connect classes having subClassOf relationships
//        connectSuperAndSubClasses(mdmGlobalGraph);
//
//        mdmGlobalGraph.commit();
//        mdmGlobalGraph.close();
//        ds.commit();
//        ds.end();
//        ds.close();
//    }
//
//    private void classesToConcepts(Model mdmGlobalGraph) {
//        String getClasses = "SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?s ?p ?o. ?s rdf:type rdfs:Class. FILTER NOT EXISTS {?o rdf:type ?x.} }}";
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getClasses, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.print(triple.getResource("s") + "\t");
//            //System.out.print(triple.get("p") + "\t");
//            //System.out.print(triple.get("o") + "\n");
//            mdmGlobalGraph.add(triple.getResource("s"), new PropertyImpl(RDF.TYPE), new ResourceImpl(GlobalGraph.CONCEPT.val()));
//        });
//    }
//
//    private void propertiesToFeatures(Model mdmGlobalGraph) {
//        String getProperties = " SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?property rdfs:domain ?domain; rdfs:range ?range . FILTER NOT EXISTS {?range rdf:type rdfs:Class.}} }";
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getProperties, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.print(triple.get("property") + "\t");
//            //System.out.print(triple.get("domain") + "\t");
//            //System.out.print(triple.get("range") + "\n");
//            mdmGlobalGraph.add(triple.getResource("property"), new PropertyImpl(RDF.TYPE), new ResourceImpl(GlobalGraph.FEATURE.val()));
//        });
//        /*Properties without domain and range*/
//        String getAloneProperties = " SELECT * WHERE { GRAPH <" + bdiGgIri + "> " +
//                "{ ?property rdf:type rdf:Property . FILTER NOT EXISTS {?property rdfs:domain ?d ; rdfs:range ?r. }} }";
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getAloneProperties, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.print(triple.get("property") + "\n");
//            mdmGlobalGraph.add(triple.getResource("property"), new PropertyImpl(RDF.TYPE), new ResourceImpl(GlobalGraph.FEATURE.val()));
//        });
//    }
//
//    private void objectPropertiesToRelations(Model mdmGlobalGraph) {
//        String getObjectProperties = " SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?property rdfs:domain ?domain; rdfs:range ?range . ?range rdf:type rdfs:Class.} }";
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getObjectProperties, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.print(triple.get("property") + "\t");
//            //System.out.print(triple.get("domain") + "\t");
//            //System.out.print(triple.get("range") + "\n");
//            mdmGlobalGraph.add(triple.getResource("domain"), new PropertyImpl(triple.get("property").toString()), triple.getResource("range"));
//        });
//        //connectConcepts
//    }
//
//    private void connectConceptsAndFeatures(Model mdmGlobalGraph) {
//        String getClasses = "SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?s ?p ?o. ?s rdf:type rdfs:Class. }}";
//
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getClasses, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.println();
//            //System.out.println();
//            //System.out.print(triple.get("s") + "\n");
//            Resource classResource = triple.getResource("s");
//            String getClassProperties = " SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?property rdfs:domain <" + triple.get("s") + ">; rdfs:range ?range. FILTER NOT EXISTS {?range rdf:type rdfs:Class.}}} ";
//            RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getClassProperties, bdiGgIri).forEachRemaining(featureTriples -> {
//                //System.out.print(featureTriples.get("property") + "\t");
//
//                mdmGlobalGraph.add(classResource, new PropertyImpl(GlobalGraph.HAS_FEATURE.val()), featureTriples.getResource("property"));
//            });
//        });
//    }
//
//    private void handleSameAsEdges(Model mdmGlobalGraph) {
//        //System.out.println(bdiGgIri);
//        String getClasses = "SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?s  owl:equivalentProperty ?p } }";
//        //System.out.println("Finding same as relationships");
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getClasses, bdiGgIri).forEachRemaining(triple -> {
//
//            Resource A = null;
//            Resource B = null;
//
//            if (triple.getResource("p").toString().contains(Namespaces.G.val())) {
//                A = triple.getResource("p");
//                B = triple.getResource("s");
//            }
//
//            if (triple.getResource("s").toString().contains(Namespaces.G.val())) {
//                A = triple.getResource("s");
//                B = triple.getResource("p");
//            }
//            //System.out.print(A + "\t" + B + "\n");
//            //System.out.print(triple.get("s") + "\n");
//            /*WARNING: By declaring sameAs property as a feature will result in lot of unconnected nodes in the visualization of global graph*/
//            mdmGlobalGraph.add(B, new PropertyImpl(RDF.TYPE), new ResourceImpl(GlobalGraph.FEATURE.val()));
//            //mdmGlobalGraph.add(triple.getResource("p"), OWL.sameAs, triple.getResource("s"));
//            mdmGlobalGraph.add(A, new PropertyImpl(GlobalGraph.SAME_AS.val()), B);
//        });
//    }
//
//    private void connectSuperAndSubClasses(Model mdmGlobalGraph) {
//        String getClasses = "SELECT * WHERE { GRAPH <" + bdiGgIri + "> { ?s ?p ?o. ?s rdfs:subClassOf ?o. }}";
//        RDFUtil.runAQuery(RDFUtil.sparqlQueryPrefixes + getClasses, bdiGgIri).forEachRemaining(triple -> {
//            //System.out.print(triple.getResource("s") + "\t");
//            //System.out.print(triple.get("p") + "\t" + triple.get("o")  + "\n");
//            mdmGlobalGraph.add(triple.getResource("s"), new PropertyImpl(triple.get("p").toString()), triple.getResource("o"));
//        });
//    }
//}

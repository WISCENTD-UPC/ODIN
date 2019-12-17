package org.dtim.odin.storage.parsers;

import com.google.gson.Gson;
import org.apache.jena.graph.Triple;
import org.apache.jena.rdf.model.impl.PropertyImpl;
import org.apache.jena.rdf.model.impl.ResourceImpl;
import org.apache.jena.vocabulary.RDF;
import org.dtim.odin.storage.db.jena.GraphOperations;
import org.dtim.odin.storage.parsers.models.*;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class OWLtoWebVOWL {

    @Inject
    GraphOperations graphO = new GraphOperations();

    String prefix = "G";
    String namespace = "";
    String title = "";
    HashMap<String, String> nodesId;

    public HashMap<String, String> getNodesId() { return nodesId; }

    public OWLtoWebVOWL() {
    }

    public OWLtoWebVOWL(String prefix) {
        this.prefix = prefix;
    }


    public Header generateHeader() {
        Header h = new Header();
        List<String> baseIri = new ArrayList<>();
        baseIri.add("http://www.w3.org/2000/01/rdf-schema");
        h.setBaseIris(baseIri);
        h.setDescription(new ElementLangEn("new Ontology description"));
        h.setIri(namespace);
        List<String> lang = new ArrayList<>();
        lang.add("en");
        h.setLanguages(lang);
        h.setTitle(new ElementLangEn(this.title));
        return h;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String convert(String graphIRI) {

        List<Triple> triples = new ArrayList<>();
        //TODO: (javier) create method to extract list
        graphO.runAQuery(graphO.sparqlQueryPrefixes + " SELECT ?s ?p ?o WHERE { GRAPH <" + graphIRI + "> { ?s ?p ?o . FILTER NOT EXISTS {?s G:sameAs ?o .}} }").forEachRemaining(res -> {
            triples.add(new Triple(new ResourceImpl(res.get("s").toString()).asNode(),
                    new PropertyImpl(res.get("p").toString()).asNode(), new ResourceImpl(res.get("o").toString()).asNode()));
        });
        /*Hiding the sameAs features from the Graphical Global Graph*/
        HashMap<Triple, String> triplesHashMap = new HashMap<>();
        graphO.runAQuery(graphO.sparqlQueryPrefixes + " SELECT * WHERE { GRAPH <" + graphIRI + "> " +
                "{  ?s G:sameAs ?o . ?o a ?x.  } }").forEachRemaining(res -> {
            //triplesToBeRemoved.add(new Triple(new ResourceImpl(res.get("o").toString()).asNode(), RDF.type.asNode(), new ResourceImpl(res.get("x").toString()).asNode()));
            triplesHashMap.put(new Triple(new ResourceImpl(res.get("o").toString()).asNode(), RDF.type.asNode(), new ResourceImpl(res.get("x").toString()).asNode()), "");
        });

        List<Nodes> nodes = new ArrayList<>();
        List<Property> properties = new ArrayList<>();

        List<ClassAttribute> classA = new ArrayList<>();
        List<PropertyAttribute> proA = new ArrayList<>();

        nodesId = new HashMap<String, String>();
        List<Triple> cleanTriples = new ArrayList<>();

        int i = 1;
        //look for types triples and create nodes;
        for (Triple triple : triples) {
            if (triple.getPredicate().getURI().equals("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) {
                String id = "Class" + i;
                nodesId.put(triple.getSubject().getURI(), id);
                //this check is to hide to triples like feature sameAs feature. Such features are not required because they are subsumed by the global iri feature.
                if(!triplesHashMap.containsKey(triple)){
                    nodes.add(new Nodes(id, getType(triple.getObject().getURI())));
                    classA.add(new ClassAttribute(id, triple.getSubject().getURI(), getBaseIri(triple.getSubject().getURI()), getLastElem(triple.getSubject().getURI())));
                }
                i++;
            } else {
                cleanTriples.add(triple);
            }
        }

        int iProperties = 1;
        //create properties
        for (Triple triple : cleanTriples) {

            String id = "objectProperty" + iProperties;

            if (triple.getPredicate().getURI().equals("http://www.essi.upc.edu/~snadal/BDIOntology/Global/hasFeature")) {
                properties.add(new Property(id, getType(triple.getPredicate().getURI())));
                proA.add(new PropertyAttribute(id, getBaseIri(getBaseIri(triple.getPredicate().getURI())) + id,
                        getBaseIri(triple.getPredicate().getURI()), "hasFeature"
                        , nodesId.get(triple.getSubject().getURI()), nodesId.get(triple.getObject().getURI())));
            } else {
                properties.add(new Property(id, "G:hasRelation"));
                proA.add(new PropertyAttribute(id, triple.getPredicate().getURI(),
                        getBaseIri(triple.getPredicate().getURI()), getLastElem(triple.getPredicate().getURI())
                        , nodesId.get(triple.getSubject().getURI()), nodesId.get(triple.getObject().getURI())));
            }
            iProperties++;
        }

        JsonWebVowl json = new JsonWebVowl(generateHeader(), new ArrayList<>(), nodes, classA, properties, proA);

        return new Gson().toJson(json).replace("classes", "class");
    }

    public String getType(String iri) {
        String[] bits = iri.split("/");
        String type = bits[bits.length - 1]; // it could throw an exception when split empty....CHECK!
        return prefix + ":" + type;
    }

    public String getLastElem(String iri) {
        String[] bits = iri.split("/");
        String label = bits[bits.length - 1]; // it could throw an exception when split empty....CHECK!
        return label;
    }

    public String getBaseIri(String iri) {
        String[] elem = iri.split("/");
        String baseIri = "";
        for (int i = 0; i < elem.length - 1; i++) {
            baseIri += elem[i] + "/";
        }
        return baseIri;
    }


}

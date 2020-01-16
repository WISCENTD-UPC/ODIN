package org.dtim.odin.storage.parsers;

import com.google.gson.Gson;
import org.apache.jena.graph.Triple;
import org.dtim.odin.storage.db.jena.GraphOperations;
import org.dtim.odin.storage.model.Namespaces;
import org.dtim.odin.storage.model.metamodel.GlobalGraph;
import org.dtim.odin.storage.parsers.models.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ImportOWLtoWebVowl {

    GraphOperations graphO = GraphOperations.getInstance();

    String prefix = "G";
    String namespace = "";
    String title = "";
    public ImportOWLtoWebVowl(){}

    public ImportOWLtoWebVowl(String prefix){
        this.prefix = prefix;
    }


    public Header generateHeader(){
        Header h = new Header();
        List<String> baseIri = new ArrayList<>();
        baseIri.add("http://www.w3.org/2000/01/rdf-schema");
        h.setBaseIris(baseIri);
        h.setDescription(new ElementLangEn("new Ontology description"));
        h.setIri(namespace);
        List<String> lang = new ArrayList<>();
        lang.add("en");
        h.setLanguages(lang);
        if(title.equals(""))
            h.setTitle(new ElementLangEn("title1"));
        else
            h.setTitle(new ElementLangEn(title));
        return h;
    }

    public void setNamespace(String namespace){
        this.namespace = namespace;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String convert(String graphIRI, String defaultNamespace){

        List<Triple> triples = new ArrayList<>();
        graphO.runAQuery("SELECT ?s ?p ?o WHERE { GRAPH <" + graphIRI + "> { ?s ?p ?o } }").forEachRemaining(res -> {

        });

        List<Nodes> nodes = new ArrayList<>();
        List<Property> properties = new ArrayList<>();

        List<ClassAttribute> classA = new ArrayList<>();
        List<PropertyAttribute> proA = new ArrayList<>();

        HashMap<String, String> nodesId = new HashMap<String, String>();
        List<Triple> cleanTriples = new ArrayList<>();

        int i = 1;
        //look for rdf:type predicate to create nodes;
        for (Triple triple : triples) {
            if(triple.getPredicate().getURI().equals("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")){
                String id = "Class"+i;
                nodes.add(new Nodes(id,getType(triple.getObject().getURI())));
                nodesId.put(triple.getSubject().getURI(),id);
                classA.add(new ClassAttribute(id,triple.getSubject().getURI(),getBaseIri(triple.getSubject().getURI()),getLastElem(triple.getSubject().getURI())));
                i++;
            }else{
                cleanTriples.add(triple);
            }
        }

        int iProperties = 1;
        //create properties
        for (Triple triple : cleanTriples) {

            String id = "objectProperty"+iProperties;

            if(triple.getPredicate().getURI().equals(GlobalGraph.HAS_FEATURE.val())){
                properties.add(new Property(id, getType(triple.getPredicate().getURI())));
                proA.add(new PropertyAttribute(id,getBaseIri(getBaseIri(triple.getPredicate().getURI()))+id,
                        getBaseIri(triple.getPredicate().getURI()),"hasFeature"
                        ,nodesId.get(triple.getSubject().getURI()),nodesId.get(triple.getObject().getURI()) ));
            }else if(triple.getPredicate().getURI().equals(Namespaces.rdfs.val() + "subClassOf")){
                properties.add(new Property(id, "rdfs:subClassOf"));
                proA.add(new PropertyAttribute(
                        id,defaultNamespace+id,defaultNamespace,"Subclass of"
                        ,nodesId.get(triple.getSubject().getURI()),nodesId.get(triple.getObject().getURI())
                ));
            }else{
                properties.add(new Property(id, "G:hasRelation"));
                proA.add(new PropertyAttribute(id,triple.getPredicate().getURI(),
                        getBaseIri(triple.getPredicate().getURI()),getLastElem(triple.getPredicate().getURI())
                        ,nodesId.get(triple.getSubject().getURI()),nodesId.get(triple.getObject().getURI()) ));
            }

            iProperties++;
        }

        JsonWebVowl json = new JsonWebVowl(generateHeader(),new ArrayList<>(),nodes,classA,properties,proA);

        return new Gson().toJson(json).replace("classes","class") ;
    }

    public String getType(String iri){
        String[] bits = iri.split("/");
        String type = bits[bits.length-1]; // it could throw an exception when split empty....CHECK!
        return prefix+":"+type;
    }

    public String getLastElem(String iri){
        String regex = "/";
        if(iri.contains("#"))
            regex = "#";
        String[] bits = iri.split(regex);
        String label = bits[bits.length-1]; // it could throw an exception when split empty....CHECK!
        return label;
    }

    public String getBaseIri(String iri){
        String[] elem = iri.split("/");
        String baseIri = "";
        for (int i = 0; i < elem.length-1; i++) {
            baseIri += elem[i]+"/";
        }
        return baseIri;
    }



}

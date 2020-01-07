package org.dtim.odin.storage.bdi.mdm.constructs;

import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;
import org.dtim.odin.storage.db.jena.GraphOperations;
import org.dtim.odin.storage.model.Namespaces;
import org.dtim.odin.storage.resources.bdi.SchemaIntegrationHelper;

import java.util.logging.Logger;

/**
 * Created by Kashif-Rabbani in June 2019
 */
public class Conversion {

    GraphOperations graphO = new GraphOperations();

    private static final Logger LOGGER = Logger.getLogger(Conversion.class.getName());
    //private JSONObject wrapper = new JSONObject();
    private JSONObject globalGraphInfo = new JSONObject();
    //private String postWrapperUrl = ConfigManager.getProperty("metadata_data_storage_url") + "wrapper/";
    private String mdmGlobalGraphIri = "";

    public Conversion(String bdiGlobalGraphId) {
        SchemaIntegrationHelper schemaIntegrationHelper = new SchemaIntegrationHelper();
        String initGlobalGraphInfo = schemaIntegrationHelper.getIntegratedDataSourceInfo(bdiGlobalGraphId);
        if (!initGlobalGraphInfo.isEmpty()) {
            globalGraphInfo = (JSONObject) JSONValue.parse(initGlobalGraphInfo);
        }
        mdmGlobalGraphIri = Namespaces.G.val() + bdiGlobalGraphId;
        runFlow();
    }

    /**
     * This method performs conversion in steps
     * Global Graph
     * Wrappers
     * LAV Mappings
     * Sub Graph Mappings
     */
    private void runFlow() {
        LOGGER.info("Creating MDM Global Graph");
        MDMGlobalGraph mdmGlobalGraph = new MDMGlobalGraph(globalGraphInfo.getAsString("name"), globalGraphInfo.getAsString("schema_iri"), mdmGlobalGraphIri); /*schema_iri is IRI (namedGraph) of the BDI graph which need to be converted into MDM graph*/
        LOGGER.info("Creating MDM Wrappers");
        new MDMWrapper(globalGraphInfo, mdmGlobalGraphIri);
        LOGGER.info("Creating MDM LAV Mappings including subgraphs covering");
        new MDMLavMapping(mdmGlobalGraphIri, mdmGlobalGraph.getNodesIds(),globalGraphInfo.getAsString("schema_iri"));
    }

    /**
     * This method is for testing
     */
    private void seeTheTriplesOfNamedGraph() {
        String getClassProperties = " SELECT * WHERE { GRAPH <" + mdmGlobalGraphIri + "> { ?s ?p ?o .}} ";
        graphO.runAQuery(graphO.sparqlQueryPrefixes + getClassProperties).forEachRemaining(triple -> {
            //System.out.print(triple.get("s") + "\t" + triple.get("p") + "\t" + triple.get("o") + "\n");
        });
    }

}

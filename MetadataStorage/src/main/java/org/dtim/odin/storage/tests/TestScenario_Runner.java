package org.dtim.odin.storage.tests;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.ReadWrite;
import org.dtim.odin.storage.ApacheMain;
import org.dtim.odin.storage.model.omq.ConjunctiveQuery;
import org.dtim.odin.storage.model.omq.QueryRewriting_EdgeBased;
import org.dtim.odin.storage.util.Tuple2;
import org.dtim.odin.storage.util.Utils;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Given an scenario name (stored in ODIN/datasets/scenarios), it will parse all the files
 * (prefixes, metamodel, global graph, queries, ...) to rewrite the different queries.
 */
public class TestScenario_Runner {

    private static String basePath = "/home/snadal/UPC/Projects/ODIN/";

    public static void main(String[] args) throws Exception {
        if (args.length != 1) throw new Exception("Scenario name not provided");
        String scenario = args[0];
        String baseURI = "http://www.essi.upc.edu/~snadal/"+scenario;
        String scenarioPath = basePath + "datasets/scenarios/"+scenario+"/";

        ApacheMain.configPath = basePath + "MetadataStorage/config.sergi.properties";
        TestUtils.deleteTDB();
        Map<String, String> prefixes = TestUtils.populatePrefixes(scenarioPath + "prefixes.txt");
        TestUtils.populateTriples(baseURI, scenarioPath + "metamodel.txt", prefixes);
        TestUtils.populateTriples(baseURI, scenarioPath + "global_graph.txt", prefixes);
        TestUtils.populateTriples(baseURI,scenarioPath+"source_graph.txt", prefixes);
        TestUtils.populateMappings(scenarioPath+"mappings.txt",
                scenarioPath + "global_graph.txt", prefixes);

        List<Tuple2<String, String>> queries = TestUtils.getQueries(scenarioPath + "queries.txt", prefixes);

        Dataset T = Utils.getTDBDataset();
        T.begin(ReadWrite.READ);

        for (Tuple2<String, String> query : queries) {
            System.out.println(query._1);
            Set<ConjunctiveQuery> CQs = QueryRewriting_EdgeBased.rewriteToUnionOfConjunctiveQueries(QueryRewriting_EdgeBased.parseSPARQL(query._2,T),T)._2;
            System.out.println(CQs);
        }
        T.end();
        T.close();
        TestUtils.deleteTDB();
    }
}

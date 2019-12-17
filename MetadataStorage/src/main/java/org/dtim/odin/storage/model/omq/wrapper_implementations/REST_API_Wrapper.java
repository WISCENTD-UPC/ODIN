package org.dtim.odin.storage.model.omq.wrapper_implementations;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.dtim.odin.storage.model.omq.relational_operators.Wrapper;

import java.io.IOException;
import java.util.List;

public class REST_API_Wrapper extends Wrapper {

    private String url;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public REST_API_Wrapper(String name) {
        super(name);
    }

    @Override
    public String preview(List<String> attributes) throws Exception {
        JSONArray data = new JSONArray();

        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(this.url);
        ResponseHandler<String> responseHandler = new ResponseHandler<String>() {
            @Override
            public String handleResponse(HttpResponse response) throws ClientProtocolException, IOException {
                int status = response.getStatusLine().getStatusCode();
                if (status >= 200 && status < 300) {
                    HttpEntity entity = response.getEntity();
                    return entity != null ? EntityUtils.toString(entity) : null;
                }
                return null;
            }
        };
        String responseBody = httpClient.execute(httpGet, responseHandler);
        if (responseBody != null) {
            JSONArray resp = (JSONArray)JSONValue.parse(responseBody);
            for (int i = 0; i < resp.size() && i < 10; ++i) {
                JSONArray arr = new JSONArray();
                for (int j = 0; j < attributes.size(); ++j) {
                    JSONObject datum = new JSONObject();
                    datum.put("attribute",attributes.get(j));
                    datum.put("value",((JSONObject)resp.get(i)).getAsString(attributes.get(j)));
                    arr.add(datum);
                }
                data.add(arr);
            }
        }
        JSONObject res = new JSONObject(); res.put("data",data);
        return res.toJSONString();
    }

}

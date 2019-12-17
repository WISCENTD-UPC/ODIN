package org.dtim.odin.storage.bdi.extraction.metamodel;

import org.dtim.odin.storage.bdi.extraction.Namespaces;

/**
 * Created by snadal on 22/11/16.
 */
public enum SourceLevel {

    RDFProperty(Namespaces.S.val()+"RDFProperty"),
    HAS_ATTRIBUTE(Namespaces.S.val()+"hasAttribute"),
    EMBEDDED_OBJECT(Namespaces.S.val()+"EmbeddedObject"),
    HAS_EMBEDDED_OBJECT(Namespaces.S.val()+"hasEmbeddedObject"),
    ORDERED_OBJECT(Namespaces.S.val()+"OrderedObject"),
    HAS_ORDERED_OBJECT(Namespaces.S.val()+"hasOrderedObject"),
    ARRAY(Namespaces.S.val()+"Array"),
    HAS_ARRAY(Namespaces.S.val()+"hasArray"),
    SCHEMA_VERSION(Namespaces.S.val()+"Schema"),
    PRODUCES(Namespaces.S.val()+"produces"),
    EVENT(Namespaces.S.val()+"Event"),
    MEDIA_TYPE(Namespaces.dcat.val()+"mediaType"),
    FORMAT(Namespaces.dct.val()+"format"),

    KAFKA_TOPIC(Namespaces.S.val()+"KafkaTopic"),
    HAS_KAFKA_TOPIC(Namespaces.S.val()+"hasKafkaTopic");

    private String element;

    SourceLevel(String element) {
        this.element = element;
    }

    public String val() {
        return element;
    }
}

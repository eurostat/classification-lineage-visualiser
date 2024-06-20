function queryBuilderForCodeId(category, path) {
  const regex = /(\d{4})(?=\/?>$)/;
  const match = regex.exec(path);
  const year = match ? match[1] : null;
  const inScheme = category+year

	return `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX : ${path}

    SELECT ?ID ?CODE ?LABEL WHERE { 
        ?s a skos:Concept;
            skos:inScheme :${inScheme};
            dc:identifier ?ID;
            skos:notation ?CODE;
            skos:altLabel ?LABEL.
        FILTER ( datatype(?CODE) = xsd:string  &&  LANG(?LABEL) = "en")
    }
`;
}

function queryBuilderForVersion(category) {
	return `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  SELECT DISTINCT ?URI ?NOTATION
  WHERE { 
    ?URI a skos:ConceptScheme ;
        skos:prefLabel ?Title ;
        dct:creator <http://publications.europa.eu/resource/authority/corporate-body/ESTAT> ;
        skos:notation ?NOTATION ;
        xkos:belongsTo ?classFamily ;
        owl:versionInfo ?version.
    FILTER (regex(?NOTATION, "${category.toUpperCase()}.*") && regex(?version, "\\\\d{4}"))
  }
  ORDER BY DESC(?version)
`;
}

export function queryBuilder(category, path) {
	if (category === "cn") {
		return queryBuilderForCodeId(category, path);
	} else if (category === "prodcom") {
		return queryBuilderForVersion(category);
	}
}

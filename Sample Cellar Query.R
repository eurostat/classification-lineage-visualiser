library(httr)

endpoint<-"http://publications.europa.eu/webapi/rdf/sparql"
SPARQL.query <- "prefix cdm: <http://publications.europa.eu/ontology/cdm#>
select distinct?work
                 where
                 {
                 ?work cdm:resource_legal_in-force 'true'^^<http://www.w3.org/2001/XMLSchema#boolean> ;
                 a cdm:legislation_secondary;
                 cdm:work_is_about_concept_eurovoc <http://eurovoc.europa.eu/5482> .
                 }"

response <- POST(url = endpoint, accept("text/csv"), body = list(query = SPARQL.query))

data <- read.csv(text=content(response, "text"), sep= ",")
## Classification Lineage Visualiser Prototype
A front-end application to visualize the lineage of classification items over time. This prototype is built using HTML, CSS, and JavaScript. The user select form is populated with data from an RDF database using SPARQL queries. The application allows users to select a concept and view its evolution over different years.

## Features
### Dynamic Search with Typeahead
- The prototype implements a multi-stage selection process using cascading dropdown menus. Selecting an option in the "family" dropdown dynamically populates the "version" and "concept" dropdowns with real-time filtering based on user-defined criteria.
- The "concept" dropdown displays both the code and label for each concept.
- This ensures that the user always selects a valid concept.
### Retrieve Data Over the Years
- The application begins by displaying the selected concept for a specific year. It then retrieves target classifications (or data) from the correspondence tables. Finally, it iterates through the available targets, querying data for each year to visualize the evolution of the concept over time.


## Recent Development Overview

**Classification Lineage Visualizer Prototype:**

* I've finalized the design of the initial prototype for the classification lineage visualizer. This includes functionality to:
    * Visualize concept changes over time.
    * Select concept code using a dropdown menu.

**SPARQL Query Development:**

* I'm currently developing SPARQL queries to retrieve data for the visualizer. This involves creating:
    * Dropdowns populated with a version (year).
    * Dropdowns populated with a concepts list.
    * Tracking mechanisms for concept changes and continuity.

**Progress on Specific Tasks:**

* Cascading dropdowns with a typeahead for concept selection are complete and functional. 
* Data retrieval from the RDF database used in dropdowns is operational.
* The application is now able to query data for different years to show the evolution of concepts.

**Development Environment Setup:**

* The development environment is configured, including a proxy to address CORS errors.

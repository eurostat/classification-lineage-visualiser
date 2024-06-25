## Classification Lineage Visualiser Prototype
A front-end application to visualize the lineage of classification items over time. This prototype is built using HTML, CSS, and JavaScript. The user select form is populated with data from an RDF database using SPARQL queries. The application allows users to select a concept and view its evolution over different years.

## Features
### Dynamic Search with Typeahead
- The prototype implements a multi-stage selection process using cascading dropdown menus. Selecting an option in the "category" dropdown dynamically populates the "version" and "concept" dropdowns with real-time filtering based on user-defined criteria.
- The "concept" dropdown displays both the code and label for each concept.
- This ensures that the user always selects a valid concept.
### Retrieve Data Over the Years
- The application starts with the original version, which is defined by a specific year. It then iterates over available years, querying data for each year to show the evolution of the concept.
### Look Around for ID
- Based on the version selected by the user, the application sets a reference year.
- The application first looks ahead by incrementing the reference year and querying data for each subsequent year.
- Then, it looks behind by decrementing the reference year (subtracting 1 each time) and querying data for each previous year.

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

**Version Control and Documentation:**

* All development is tracked and managed using Git.
* Continuous documentation is being maintained throughout the development process.


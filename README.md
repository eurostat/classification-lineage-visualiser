## Classification Lineage Visualiser Prototype

This front-end application, built using HTML and JavaScript, allows users to explore the evolution of classification items over time. Users can select a concept from a dropdown menu and the application then displays the concept's lineage across different years.

### Key Features

* **Dynamic Search with Typeahead:**
    * The application employs a multi-stage selection process with cascading dropdowns. Selecting an option in one dropdown dynamically filters and populates subsequent dropdowns based on user selections.
    * The "concept" dropdown displays both concept code and label, ensuring users choose valid concepts.

* **Visualising Lineage Over Time:**
    * Upon selecting a concept and year, the application retrieves relevant data from correspondence tables, then iterates through available years, querying data for each year to visualise the concept's evolution.


### Achievements

* **Core Functionality:** Successfully implemented the core feature of visualising concept changes over time.
* **Concept Selection:** Implemented a user-friendly dropdown menu for selecting concept codes.
* **Data Retrieval:** Optimised SPARQL queries for efficient data retrieval.
* **Lineage Rendering:** Enhanced logic for clear and accurate display of lineage relationships.
* **Concept Dropdown Population:** Improved the process of populating the dropdown menu with relevant concept codes.


### Latest Developments In This Version

* **Concept ID Dropdown:** The current implementation displays codes at level 3 depth (PRODCOM) and level 5 depth (CN). Refinements based on user feedback may be necessary.
* **Data Retrieval:** A new logic for retrieving backward-looking data is being evaluated for performance and accuracy.
* **Code Optimisation:** Code cleaning and optimisation are ongoing to improve efficiency and maintainability.

### Project Success

The Classification Lineage Visualiser prototype has successfully achieved its goals. The project aimed to create a visual representation of concept changes over time. This involved implementing a user interface with cascading dropdowns for concept selection, fetching data using SPARQL queries, and developing logic for lineage rendering and dropdown population.

### Development Environment
**CORS proxy:**

* A development environment has been configured, including a proxy to address CORS errors. Please refer to the [cors anywhere demo](https://cors-anywhere.herokuapp.com/corsdemo) for proxy usage.
* This is a demo server and not intended for production use. Limiting 50 queries per 60 minutes.

**Cache Management:**
This application caches data to improve performance. User needs to clear the cache manually to fetch the latest data and avoid memory issues. Memory usages is average and wont cause any issues in short term. Please see developer tools for memory usage : `F12` -> `Application` -> `Storage` -> `Clear site data`

#### Main Files

* **queryBuilder.js**: Contains functions to build SPARQL queries for data retrieval.
* **dataForGraphs.js**: Contains the main data retrieval logic and functions to produce data for graphs.
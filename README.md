## Classification Lineage Visualiser
A front-end application to visualize the lineage of classification items over time.

## Features
### Dynamic Search with Typeahead
- The prototype implements a multi-stage selection process using cascading dropdown menus. Selecting an option in the "category" dropdown dynamically populates the "version" and "concept" dropdowns with real-time filtering based on user-defined criteria.
- The "concept" dropdown displays both the code and label for each concept.
- This ensures that the user always selects a valid concept.
### Retrieve Data Over the Years
- The application starts with the original version, which is defined by a specific year. It then iterates over available years, querying data for each year to show the evolution of the concept.
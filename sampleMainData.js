export function mainData() {
  // Fetch the data
  fetch('./data/cn2017_match_target.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const bindings = data.results.bindings;
      const startId = '321511000080'; // Replace with your starting ID
      const startYear = 2017; // Replace with the starting year for your given ID

      // Function to extract ID from URI
      const extractId = (uri) => uri.split('/').pop();

      // Function to create a node
      const createNode = (id, year, nodes, idToNodes) => {
        const node = {
          id: `${id}-${year}`,
          label: id,
          year: year,
        };
        nodes.push(node);
        idToNodes[node.id] = node;
        return node;
      };

      // Function to process parents (descendants)
      const processParents = (id, year, sourceMap, idToNodes, edges, queue, processedEdges, nodes) => {
        if (sourceMap[id]) {
          sourceMap[id].forEach(({ targetId, year }) => {
            const edgeKey = `${id}-${year}->${targetId}-${year + 1}`;
            if (!processedEdges.has(edgeKey)) {
              if (!idToNodes[`${id}-${year}`]) createNode(id, year, nodes, idToNodes);
              if (!idToNodes[`${targetId}-${year + 1}`]) createNode(targetId, year + 1, nodes, idToNodes);

              edges.push({ source: `${id}-${year}`, target: `${targetId}-${year + 1}` });
              processedEdges.add(edgeKey);
            console.log("Parents", id.substring(4,8) , targetId.substring(4,8), year)

              queue.push({ id: targetId, year: year + 1 });
            }
          });
        }
      };

      // Function to process children (ancestors)
      const processChildren = (id, year, targetMap, idToNodes, edges, queue, processedEdges, nodes) => {
        if (targetMap[id]) {
          targetMap[id].forEach(({ sourceId, year }) => {
            const edgeKey = `${sourceId}-${year}->${id}-${year + 1}`;
            if (!processedEdges.has(edgeKey)) {
              if (!idToNodes[`${sourceId}-${year}`]) createNode(sourceId, year, nodes, idToNodes);
              if (!idToNodes[`${id}-${year + 1}`]) createNode(id, year + 1, nodes, idToNodes);

              edges.push({ source: `${sourceId}-${year}`, target: `${id}-${year + 1}` });
              processedEdges.add(edgeKey);
            console.log("children", id.substring(4,8) ,  sourceId.substring(4,8), year)

              queue.push({ id: sourceId, year: year });
            }
          });
        }
      };

      // Function to ensure continuity of nodes
      const ensureContinuity = (startId, nodes, idToNodes, edges) => {
        const minYear = 2017; // Math.min(...allYears);
        const maxYear = 2023; // Math.max(...allYears);

        for (let year = minYear; year <= maxYear; year++) {
          if (!idToNodes[`${startId}-${year}`]) {
            // Create a new node
            const node = {
              id: `${startId}-${year}`,
              label: startId,
              year: year,
            };
            nodes.push(node);
            idToNodes[node.id] = node;

            if (year > minYear) {
              edges.push({
                source: `${startId}-${year}`,
                target: `${startId}-${year+1}`
              });
            }
          }
        }
      };

      // Main function to process data
      const processData = (bindings, startId, startYear) => {
        const nodes = [];
        const edges = [];
        const idToNodes = {};
        const processedNodes = new Set(); // Set to keep track of processed nodes
        const processedEdges = new Set(); // Set to keep track of processed edges
        const queue = [{ id: startId, year: startYear }];

        // Map source IDs and target IDs to their records for quick lookup
        const sourceMap = {};
        const targetMap = {};

        bindings.forEach(record => {
          const sourceId = extractId(record.source.value);
          const targetId = extractId(record.target.value);
          const year = parseInt(record.year.value);

          if (!sourceMap[sourceId]) sourceMap[sourceId] = [];
          if (!targetMap[targetId]) targetMap[targetId] = [];

          sourceMap[sourceId].push({ targetId, year });
          targetMap[targetId].push({ sourceId, year });
        });

        // Processing loop for descendants and ancestors
        while (queue.length > 0) {
          const { id, year } = queue.shift();
          const currentNodeKey = `${id}-${year}`;
          console.log("queue", id.substring(4,8), year);

          if (processedNodes.has(currentNodeKey)) {
            continue; // Skip if this node has already been processed
          }
          processedNodes.add(currentNodeKey);

          processParents(id, year, sourceMap, idToNodes, edges, queue, processedEdges, nodes);
          processChildren(id, year, targetMap, idToNodes, edges, queue, processedEdges, nodes);
        }

        // ensureContinuity(startId, nodes, idToNodes, edges);

        return { nodes, edges };
      };

      const result = processData(bindings, startId, startYear);
      console.log(result.nodes);
      console.log(result.edges);
    })
  .catch(error => { console.error('There has been a problem with your fetch operation:', error); });
}
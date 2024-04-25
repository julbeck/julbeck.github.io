var data = [
  {"Survived": "Perished", "Sex": "Male", "Age": "Adult", "Class": "Crew", "value": 670},
  {"Survived": "Perished", "Sex": "Male", "Age": "Adult", "Class": "Third Class", "value": 387},
  {"Survived": "Perished", "Sex": "Male", "Age": "Adult", "Class": "Second Class", "value": 154},
  {"Survived": "Perished", "Sex": "Male", "Age": "Adult", "Class": "First Class", "value": 118},
  {"Survived": "Perished", "Sex": "Male", "Age": "Child", "Class": "Third Class", "value": 35},
  {"Survived": "Perished", "Sex": "Female", "Age": "Adult", "Class": "Crew", "value": 3},
  {"Survived": "Perished", "Sex": "Female", "Age": "Adult", "Class": "Third Class", "value": 89},
  {"Survived": "Perished", "Sex": "Female", "Age": "Adult", "Class": "Second Class", "value": 13},
  {"Survived": "Perished", "Sex": "Female", "Age": "Adult", "Class": "First Class", "value": 4},
  {"Survived": "Perished", "Sex": "Female", "Age": "Child", "Class": "Third Class", "value": 17},
  {"Survived": "Survived", "Sex": "Male", "Age": "Adult", "Class": "Crew", "value": 192},
  {"Survived": "Survived", "Sex": "Male", "Age": "Adult", "Class": "Third Class", "value": 75},
  {"Survived": "Survived", "Sex": "Male", "Age": "Adult", "Class": "Second Class", "value": 14},
  {"Survived": "Survived", "Sex": "Male", "Age": "Adult", "Class": "First Class", "value": 57},
  {"Survived": "Survived", "Sex": "Male", "Age": "Child", "Class": "Third Class", "value": 13},
  {"Survived": "Survived", "Sex": "Male", "Age": "Child", "Class": "Second Class", "value": 11},
  {"Survived": "Survived", "Sex": "Male", "Age": "Child", "Class": "First Class", "value": 5},
  {"Survived": "Survived", "Sex": "Female", "Age": "Adult", "Class": "Crew", "value": 20},
  {"Survived": "Survived", "Sex": "Female", "Age": "Adult", "Class": "Third Class", "value": 76},
  {"Survived": "Survived", "Sex": "Female", "Age": "Adult", "Class": "Second Class", "value": 80},
  {"Survived": "Survived", "Sex": "Female", "Age": "Adult", "Class": "First Class", "value": 140},
  {"Survived": "Survived", "Sex": "Female", "Age": "Child", "Class": "Third Class", "value": 14},
  {"Survived": "Survived", "Sex": "Female", "Age": "Child", "Class": "Second Class", "value": 13},
  {"Survived": "Survived", "Sex": "Female", "Age": "Child", "Class": "First Class", "value": 1}
  ];

// var data = d3.csv("../js/titanic.csv")
//       .then(function(data) {
    var data = d3.json("../data/parallelize.json")
        .then(function(data) {
        const keys = ['Season', 'Type', 'Severity', 'value'].slice(0, -1);
        let index = -1;
        const nodes_array = [];
        const nodeByKey = new d3.InternMap([], JSON.stringify);
        const indexByKey = new d3.InternMap([], JSON.stringify);
        const links_array = [];

        // Define the graph object and populate its properties
        const graph = {
          nodes: nodes_array,
          links: links_array
        };

        // Perform necessary calculations
        for (const k of keys) {
          for (const d of data) {
            const key = [k, d[k]];
            if (nodeByKey.has(key)) continue;
            const node = { name: d[k] };
            nodes_array.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
          }
        }

        for (let i = 1; i < keys.length; ++i) {
          const a = keys[i - 1];
          const b = keys[i];
          const prefix = keys.slice(0, i + 1);
          const linkByKey = new d3.InternMap([], JSON.stringify);
          for (const d of data) {
            const names = prefix.map(k => d[k]);
            const value = d.value || 1;
            let link = linkByKey.get(names);
            if (link) { link.value += value; continue; }
            link = {
              source: indexByKey.get([a, d[a]]),
              target: indexByKey.get([b, d[b]]),
              names,
              value
            };
            links_array.push(link);
            linkByKey.set(names, link);
          }
        }

        ///////////////////////////////WORKS UNTIL HERE

        const width = 928;
        const height = 720;

        const sankey = d3.sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(4)
          .nodePadding(20)
          .extent([[0, 5], [width, height - 5]]);

        const {nodes, links} = sankey({
          nodes: graph.nodes.map(d => Object.create(d)),
          links: graph.links.map(d => Object.create(d))
        });

        const color = d3.scaleOrdinal(["Spring", "Summer", "Fall", "Winter"], ["#d989a5", "#da4f81", "#dba7b9", "#de0d55"]).unknown("#ccc");

        const svg = d3.select("#visualization")
            .append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;");

        svg.append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
          .append("title")
            .text(d => `${d.name}\n${d.value.toLocaleString()}`);

        svg.append("g")
            .attr("fill", "none")
          .selectAll("g")
          .data(links)
          .join("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.names[0]))
            .attr("stroke-width", d => d.width)
            .style("mix-blend-mode", "multiply")
          .append("title")
            .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

        svg.append("g")
            .style("font", "10px sans-serif")
          .selectAll("text")
          .data(nodes)
          .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name)
          .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => ` ${d.value.toLocaleString()}`);
      });
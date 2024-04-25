
function _key(Swatches,chart) {
  return(Swatches(chart.scales.color))
}

function _chart(d3,data) {

  // Specify the dimensions of the chart.
  const width = 928;
  const height = width;
  const margin = 1; // to avoid clipping the root circle stroke
  const name = d => d.cluster.split(".").pop(); // "Strings" of "flare.util.Strings"
  const group = d => d.cluster.split(".")[1]; // "util" of "flare.util.Strings"
  const names = d => name(d).split(/(?=[A-Z][a-z])|\s+/g); // ["Legend", "Item"] of "flare.vis.legend.LegendItems"

  // Create a categorical color scale.
  const color = d3.scaleOrdinal(d3.schemeSet1);

  // Create the pack layout.
  const pack = d3.pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(3);

  // Compute the hierarchy from the (flat) data; expose the values
  // for each node; lastly apply the pack layout.
  const root = pack(d3.hierarchy({children: data})
      .sum(d => d.count));

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-margin, -margin, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .attr("text-anchor", "middle");

  // Place each (leaf) node according to the layout’s x and y values.
  const node = svg.append("g")
    .selectAll()
    .data(root.leaves())
    .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

  // Add a title.
  node.append("title")
      .text(d => `${d.data.cluster}\n${d.data.count}`);

  // Add a filled circle.
  node.append("circle")
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color(group(d.data)))
      .attr("r", d => d.r);

  // Add a label.
  const text = node.append("text")
      .attr("clip-path", d => `circle(${d.r})`);

  // Add a tspan for each CamelCase-separated word.
  text.selectAll()
    .data(d => names(d.data))
    .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
      .text(d => d);

  // Add a tspan for the node’s value.
  text.append("tspan")
      .attr("x", 0)
      .attr("y", d => `${names(d.data).length / 2 + 0.35}em`)
      .attr("fill-opacity", 0.7)
      .text(d => d.data.count);

  return Object.assign(svg.node(), {scales: {color}});
}

function _data(FileAttachment) {
  return(
    FileAttachment("bfro_bubble.json").json()
      .then((data) => {
        data.forEach((d) => {
          //d.count = +d.count; // convert type as numeric
        });
      return data;
    })
  );
}   

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["bfro_bubble.json", {url: new URL("../data/bfro_bubble.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("key")).define("key", ["Swatches","chart"], _key);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  return main;
}
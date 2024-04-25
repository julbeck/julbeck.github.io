
function _colors(Inputs,schemes) {
  return(Inputs.select(new Map(schemes.map(s => [s.name, s.colors])), {key: "BuPu", label: "Color scheme"}));
}

function _chart(d3,legend,data,n,colors,labels,topojson,us,states) {

  const svg = d3.create("svg")
      .attr("width", 975)
      .attr("height", 610)
      .attr("viewBox", [0, 0, 975, 610])
      .attr("style", "max-width: 100%; height: auto;");
  
  svg.append(legend)
      .attr("transform", "translate(870,450)");

  const x = d3.scaleQuantile(Array.from(new Set(Array.from(data, d => d.sightings))), d3.range(n));

  const y = d3.scaleQuantile(Array.from(new Set(Array.from(data, d => d.drinking))), d3.range(n));

  const index = d3.index(data, d => d.id);

  const path = d3.geoPath();

  const color = (value) => {
    if (!value) return "#ccc";
    if (value.sightings == 0 && value.drinking == 0) return "#e8e8e8";
    const {sightings: a, drinking: b} = value;
    return colors[y(b) + x(a) * n];
  };

  const format = (value) => {
    if (!value) return "N/A";
    const {sightings: a, drinking: b} = value;
    return `${a} Sightings ${labels[x(a)] && ` (${labels[x(a)]})`}
      ${b}% Drinking ${labels[y(b)] && ` (${labels[y(b)]})`} `;
    };
  
  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
      .attr("fill", d => color(index.get(d.id)))
      .attr("d", path)
    .append("title")
      .text(d => `${d.properties.name}, 
          ${states.get(d.id.slice(0, 2)).name}
          ${format(index.get(d.id))}`);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", "2")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

  return svg.node();
}


function _legend(DOM,svg,n,d3,colors,labels) {
  return(
    () => {
      const k = 24;
      const arrow = DOM.uid();
      return svg`<g font-family=sans-serif font-size=10>
      <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
        <marker id="${arrow.id}" markerHeight=10 markerWidth=10 refX=6 refY=3 orient=auto>
          <path d="M0,0L9,3L0,6Z" />
        </marker>
        ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
          <title>Sightings${labels[j] && ` (${labels[j]})`} Excessive Drinking${labels[i] && ` (${labels[i]})`}</title>
        </rect>`)}
        <line marker-end="${arrow}" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
        <line marker-end="${arrow}" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
        <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">Sightings</text>
        <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">Excessive Drinking</text>
      </g>
    </g>`;
    }
  );
}

function _data(FileAttachment) {
  return(
    FileAttachment("myfips.json").json()
      .then((data) => {
        data.forEach((d) => {
          d.sightings = +d.sightings; // convert type as numeric
          d.drinking = Math.round(+d.drinking * 100).toFixed(2); // convert fractional percentage to decimal
        });
        return data;
      })
  );
}

function _schemes(){
  return(
    [
      {
        name: "RdBu", 
        colors: [
          "#d3d3d3", "#e4acac", "#c85a5a",
          "#b0d5df", "#ad9ea5", "#985356",
          "#64acbe", "#627f8c", "#574249"
        ]
      },
      {
        name: "BuPu", 
        colors: [
          "#d3d3d3", "#ace4e4", "#5ac8c8",
          "#dfb0d6", "#a5add3", "#5698b9", 
          "#be64ac", "#8c62aa", "#3b4994"
        ]
      },
      {
        name: "GnBu", 
        colors: [
          "#d3d3d3", "#b5c0da", "#6c83b5",
          "#b8d6be", "#90b2b3", "#567994",
          "#73ae80", "#5a9178", "#2a5a5b"
        ]
      },
      {
        name: "PuOr", 
        colors: [
          "#d3d3d3", "#e4d9ac", "#c8b35a",
          "#cbb8d7", "#c8ada0", "#af8e53",
          "#9972af", "#976b82", "#804d36"
        ]
      }
    ]
  );
}

function _labels() {
  return(["low", "med", "high"]);
}

function _n(colors) {
  return(Math.floor(Math.sqrt(colors.length)));
}

function _states(us) {
  return(new Map(us.objects.states.geometries.map(d => [d.id, d.properties])));
}

function _us(FileAttachment) {
  return(FileAttachment("counties-albers-10m.json").json());
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map (
    [
      ["counties-albers-10m.json", {url: new URL("../data/counties-albers-10m.json", import.meta.url), mimeType: "application/json", toString}],
      ["myfips.json", {url: new URL("../data/myfips.json", import.meta.url), mimeType: "application/json", toString}]
    ]
  );
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  
  main.variable(observer("chart")).define("chart", ["d3","legend","data","n","colors","labels","topojson","us","states"], _chart);

  main.variable(observer("viewof colors")).define("viewof colors", ["Inputs","schemes"], _colors);
  main.variable(observer("colors")).define("colors", ["Generators", "viewof colors"], (G, _) => G.input(_));
  

  main.variable(observer("legend")).define("legend", ["DOM","svg","n","d3","colors","labels"], _legend);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("schemes")).define("schemes", _schemes);
  main.variable(observer("labels")).define("labels", _labels);
  main.variable(observer("n")).define("n", ["colors"], _n);
  main.variable(observer("states")).define("states", ["us"], _states);
  main.variable(observer("us")).define("us", ["FileAttachment"], _us);
  return main;
}

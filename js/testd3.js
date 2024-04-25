var dataset = [80, 100, 56, 120, 180]

// var svgWidth = 500, svgHeight - 300, barPadidng = 5;
// var barWidth = (svgWidth/ dataset.length);

d3.select('body')
	.selectAll('p')
	.data(dataset)
	.enter()
	.append('p')
	.text(function(d) { return d; });


var canvas = d3.select('#visualization')
			.append('svg')
			.attr("width",300)
			.attr("height",300);

var circle = canvas
			.append('circle')
			.attr('cx',150)		//giving horizontal proporties of circle
			.attr('cy',150)		//giving horizontal proporties of circle
			.attr('r',50)		//giving horizontal proporties of circle
			.attr('fill','red');		//giving horizontal proporties of circle

// var svg = d3.select("svg")
// 	.attr("width",svgWidth)
// 	.attr("height",svgHeight);

// // svg.append('circle')
// // 	.attr('cx','50%')
// // 	.attr('cy','50%')


// var barChart = svg.selectAll("rect")
// 	.data(dataset)
// 	.enter()
// 	.append("rect")
// 	.attr("y", function(d) {return svgHeight - d})
// 	.attr("height", function(d) {return d})
// 	.attr("width", barWidth - barPadding)
// 	.attr("transform", function (d,i) {var translate = [barWidth * i, 0]; return "translate(" + translate + ")";});

         // var width = 300;
         // var height = 300;
         // //Create SVG element
         // const svg = d3.create("svg")
         //    .attr("width", width)
         //    .attr("height", height);
         // //Create and append rectangle element
         // svg.append("rect")
         //    .attr("x", 20)
         //    .attr("y", 20)
         //    .attr("width", 200)
         //    .attr("height", 100)
         //    .attr("fill", "green");
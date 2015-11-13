var fake_data = [];

var format = d3.time.format("%Y-%m-%d %H:%M:%S"); // parse date

var margin = {top: 0, right: 40, bottom: 25, left: 40},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var duration = 1000, limit = 60;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var svg = d3.select('svg#chart')
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMidYMid")
    .append("g") // any transformation applied to the svg group element is applied to all of the child elements
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var axis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

var area = d3.svg.area()
    .x(function(d) { return x(format.parse(d.date)); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

var path = svg.append("path")
    .datum(fake_data)
    .attr("class", "area")
    .attr("d", area);

function tick(msg) {
    var now = format.parse(msg.date);
    fake_data.push(msg);

    // update domain
    x.domain([now - limit * duration, now])

    max = d3.max(fake_data, function(d) {return d.value});
    y.domain([0, max]);

    // redraw path
    path.attr('transform', null)
        .attr("d", area)
        .transition()
        .duration(duration)
        .ease('linear');

    // shift axis left
    axis
        .transition()
        .duration(duration)
        .ease("linear")
        .call(d3.svg.axis().scale(x).orient("bottom").ticks(4).tickFormat(d3.time.format("%H:%M:%S")));

    if (fake_data.length > limit) {
        // remove oldest data
        fake_data.shift();
    }
}

var socket = io.connect('http://' + document.domain + ':' + location.port + '/data');

socket.on('connect_to_server', function(msg) {
    console.log(msg);
});

socket.on('graph_data', function(msg) {
    console.log(msg);
    tick(msg);
});

var id = setInterval(function() {
    socket.emit('message');
}, 1000);

//call crap to get data



const getTicker = async() => {
    await fetch('http://localhost:3000/getCompanyInfo/AAPL').then(response => {
        response.json().then(data => ({
            data:data,
            status:response.status
        })
    ).then(res => {
        console.log(res.status,res.data)

        })
    })
};
const getCeo = async() => {
    await fetch('http://localhost:3000/getAllCeos').then(response => {
        response.json().then(data => ({
                data:data,
                status:response.status
            })
        ).then(res => {
            console.log(res.status,res.data)
        })
    })
};
const getSectors = async() => {
    await fetch('http://localhost:3000/getAllSectors').then(response => {
        response.json().then(data => ({
                data:data,
                status:response.status
            })
        ).then(res => {
            console.log(res.status,res.data)
        })
    })
};
const getSectorCeoSalarySum = async() => {
    await fetch('http://localhost:3000/getSectorCeoSalarySum').then(response => {
        response.json().then(data => ({
                data:data,
                status:response.status
            })
        ).then(res => {
            console.log(res.status,res.data)
        })
    })
};
const getCompanies = async() => {
    await fetch('http://localhost:3000/getCompanies').then(response => {
        response.json().then(data => ({
                data:data,
                status:response.status
            })
        ).then(res => {
            console.log(res.status,res.data)
        })
    })
};

const getPriceData = async() => {
    await fetch('http://localhost:3000/getPriceData/AAPL').then(response => {
        response.json().then(data => ({
                data:data,
                status:response.status
            })
        ).then(res => {
            console.log(res.status,res.data)

        })

    })
};
 //getTicker();
 //getCeo();
 //getSectors();
 //getSectorCeoSalarySum();
 //getCompanies();



function drawChart(input) {
    d3.json('http://localhost:3000/getPriceData/'+ input).then(function(prices) {


        const months = {0 : 'Jan', 1 : 'Feb', 2 : 'Mar', 3 : 'Apr', 4 : 'May', 5 : 'Jun', 6 : 'Jul', 7 : 'Aug', 8 : 'Sep', 9 : 'Oct', 10 : 'Nov', 11 : 'Dec'}

        var dateFormat = d3.timeParse("%Y-%m-%d");
        for (var i = 0; i < prices.length; i++) {

            prices[i]['Date'] = dateFormat(prices[i]['Date'])
        }

        const margin = {top: 15, right: 65, bottom: 205, left: 50},
            w = 1000 - margin.left - margin.right,
            h = 625 - margin.top - margin.bottom;

        var svg = d3.select("#container")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" +margin.left+ "," +margin.top+ ")");

        let dates = _.map(prices, 'Date');

        var xmin = d3.min(prices.map(r => r.Date.getTime()));
        var xmax = d3.max(prices.map(r => r.Date.getTime()));
        var xScale = d3.scaleLinear().domain([-1, dates.length])
            .range([0, w])
        var xDateScale = d3.scaleQuantize().domain([0, dates.length]).range(dates)
        let xBand = d3.scaleBand().domain(d3.range(-1, dates.length)).range([0, w]).padding(0.3)
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(function(d) {
                d = dates[d]
                hours = d.getHours()
                minutes = (d.getMinutes()<10?'0':'') + d.getMinutes()
                amPM = hours < 13 ? 'am' : 'pm'
                return hours + ':' + minutes + amPM + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
            });

        svg.append("text")
            .attr("x", (w / 2))
            .attr("y", 0 - (margin.top / 2) +3 )
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Candlestick for " + input);


        svg.append("rect")
            .attr("id","rect")
            .attr("width", w)
            .attr("height", h)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr("clip-path", "url(#clip)")
            //added title down here



        var gX = svg.append("g")
            .attr("class", "axis x-axis") //Assign "axis" class
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis)

        gX.selectAll(".tick text")
            .call(wrap, xBand.bandwidth())

        var ymin = d3.min(prices.map(r => r.Low));
        var ymax = d3.max(prices.map(r => r.High));
        var yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
        var yAxis = d3.axisLeft()
            .scale(yScale)

        var gY = svg.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis);

        var chartBody = svg.append("g")
            .attr("class", "chartBody")
            .attr("clip-path", "url(#clip)");

        // draw rectangles
        let candles = chartBody.selectAll(".candle")
            .data(prices)
            .enter()
            .append("rect")
            .attr('x', (d, i) => xScale(i) - xBand.bandwidth())
            .attr("class", "candle")
            .attr('y', d => yScale(Math.max(d.Open, d.Close)))
            .attr('width', xBand.bandwidth())
            .attr('height', d => (d.Open === d.Close) ? 1 : yScale(Math.min(d.Open, d.Close))-yScale(Math.max(d.Open, d.Close)))
            .attr("fill", d => (d.Open === d.Close) ? "silver" : (d.Open > d.Close) ? "red" : "green")

        // draw high and low
        let stems = chartBody.selectAll("g.line")
            .data(prices)
            .enter()
            .append("line")
            .attr("class", "stem")
            .attr("x1", (d, i) => xScale(i) - xBand.bandwidth()/2)
            .attr("x2", (d, i) => xScale(i) - xBand.bandwidth()/2)
            .attr("y1", d => yScale(d.High))
            .attr("y2", d => yScale(d.Low))
            .attr("stroke", d => (d.Open === d.Close) ? "white" : (d.Open > d.Close) ? "red" : "green");

        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", w)
            .attr("height", h)

        const extent = [[0, 0], [w, h]];

        var resizeTimer;
        var zoom = d3.zoom()
            .scaleExtent([1, 100])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed)
            .on('zoom.end', zoomend);

        svg.call(zoom)

        function zoomed() {

            var t = d3.event.transform;
            let xScaleZ = t.rescaleX(xScale);

            let hideTicksWithoutLabel = function() {
                d3.selectAll('.xAxis .tick text').each(function(d){
                    if(this.innerHTML === '') {
                        this.parentNode.style.display = 'none'
                    }
                })
            }

            gX.call(
                d3.axisBottom(xScaleZ).tickFormat((d, e, target) => {
                    if (d >= 0 && d <= dates.length-1) {
                        d = dates[d]
                        hours = d.getHours()
                        minutes = (d.getMinutes()<10?'0':'') + d.getMinutes()
                        amPM = hours < 13 ? 'am' : 'pm'
                        return hours + ':' + minutes + amPM + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
                    }
                })
            )

            candles.attr("x", (d, i) => xScaleZ(i) - (xBand.bandwidth()*t.k)/2)
                .attr("width", xBand.bandwidth()*t.k);
            stems.attr("x1", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);
            stems.attr("x2", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);

            hideTicksWithoutLabel();

            gX.selectAll(".tick text")
                .call(wrap, xBand.bandwidth())

        }

        function zoomend() {
            var t = d3.event.transform;
            let xScaleZ = t.rescaleX(xScale);
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(function() {

                var xmin = new Date(xDateScale(Math.floor(xScaleZ.domain()[0])))
                xmax = new Date(xDateScale(Math.floor(xScaleZ.domain()[1])))
                filtered = _.filter(prices, d => ((d.Date >= xmin) && (d.Date <= xmax)))
                minP = +d3.min(filtered, d => d.Low)
                maxP = +d3.max(filtered, d => d.High)
                buffer = Math.floor((maxP - minP) * 0.1)

                yScale.domain([minP - buffer, maxP + buffer])
                candles.transition()
                    .duration(800)
                    .attr("y", (d) => yScale(Math.max(d.Open, d.Close)))
                    .attr("height",  d => (d.Open === d.Close) ? 1 : yScale(Math.min(d.Open, d.Close))-yScale(Math.max(d.Open, d.Close)));

                stems.transition().duration(800)
                    .attr("y1", (d) => yScale(d.High))
                    .attr("y2", (d) => yScale(d.Low))

                gY.transition().duration(800).call(d3.axisLeft().scale(yScale));

            }, 500)

        }
    });
}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}


function drawBarChart(){
    var svg = d3.select("#bar1"),
        margin = {top: 20, right: 20, bottom: 30, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    d3.json('http://localhost:3000/getSectorCeoSalarySum')
        .then((data) => {
            return data.map((d) => {
                d.totalsectorsalaries = +d.totalsectorsalaries;

                return d;
            });
        })
        .then((data) => {
            x.domain(data.map(function(d) { return d.sector; }));
            y.domain([0, d3.max(data, function(d) { return d.totalsectorsalaries; })]);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll(".tick text")
                .call(wrap, x.bandwidth());
           // .selectAll("text")
             //   .attr("transform", function(d){
               //     return "rotate(-10)"
               // });
                //.style("text-anchor","start");

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Total comp (USD)");

            g.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2)+3)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Sector total CEO salaries");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.sector); })
                .attr("y", function(d) { return y(d.totalsectorsalaries); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.totalsectorsalaries);
                })
                .style('cursor', 'pointer')
                .on('mouseover', d => {
                div
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                div
                    .html((d.totalsectorsalaries) + '<br/>')
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY - 28 + 'px');
            })
                .on('mouseout', () => {
                    div
                        .transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        })
        .catch((error) => {
            throw error;
        });



}


function drawHighestCEOChart() {
    var svg = d3.select("#bar2"),
        margin = {top: 20, right: 50, bottom: 120, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.3),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    const div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    d3.json('http://localhost:3000/getAllCeos')
        .then((data) => {
            return data.map((d) => {
                d.salary = +d.salary;

                return d;
            });
        })
        .then((data) => {
            x.domain(data.map(function (d) {
                return d.ceo;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.salary;
            })]);


            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll(".tick text")
                //.call(wrap, x.bandwidth())
                //added below here

                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)"
                });

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Total comp (USD)");

            g.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2)+3)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Top 50 CEO comp.");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.ceo);
                })
                .attr("y", function (d) {
                    return y(d.salary);
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return height - y(d.salary);
                })
                .style('cursor', 'pointer')
                .on('mouseover', d => {
                    div
                        .transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    div
                        .html((d.salary) + '<br/>')
                        .style('left', d3.event.pageX + 'px')
                        .style('top', d3.event.pageY - 28 + 'px');
                })
                .on('mouseout', () => {
                    div
                        .transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        })
        .catch((error) => {
            throw error;
        });
}

function drawBiggestSector() {
    var svg = d3.select("#bar3"),
        margin = {top: 20, right: 20, bottom: 30, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    d3.json('http://localhost:3000/getAllSectors')
        .then((data) => {
            return data.map((d) => {
                d.size = +d.size;

                return d;
            });
        })
        .then((data) => {
            x.domain(data.map(function (d) {
                return d.name;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.size;
            })]);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                //.selectAll("text")
                .selectAll(".tick text")
                .call(wrap, x.bandwidth());
               // .attr("transform", function (d) {
               //     return "rotate(-10)"
              //  });
            //.style("text-anchor","start");

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Total size");

            g.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2)+3)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Top Sectors");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.name);
                })
                .attr("y", function (d) {
                    return y(d.size);
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return height - y(d.size);
                })
                .style('cursor', 'pointer')
                .on('mouseover', d => {
                    div
                        .transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    div
                        .html((d.size) + '<br/>')
                        .style('left', d3.event.pageX + 'px')
                        .style('top', d3.event.pageY - 28 + 'px');
                })
                .on('mouseout', () => {
                    div
                        .transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        })
        .catch((error) => {
            throw error;
        });
}

function drawData(input){
var x=0;
if (input == 'AAL'){
    x=0;
}
    else if (input == 'AAPL'){
        x=1;
    }

else if (input == 'ALK'){
        x=2;
    }

else if (input =='AXP'){
        x=3;
    }
else if (input == 'BA'){
        x=4;
    }
else if (input == 'CAR'){
        x=5;
    }
else if (input == 'CAT'){
        x=6;
    }
else if (input == 'CHRW'){
        x=7;
    }
else if (input == 'CSCO'){
        x=8;
    }
else if (input == 'CSX'){
        x=9;
    }
else if (input == 'CVX'){
        x=10;
    }
else if (input == 'DAL'){
        x=11;
    }
else if (input == 'DIS'){
        x=12;
    }
else if (input == 'DOW'){
        x=13;
    }
else if (input == 'EXPD'){
        x=14;
    }
else if (input == 'FDX'){
        x=15;
    }
else if (input == 'GS'){
        x=16;
    }
else if (input == 'HD'){
        x=17;
    }
else if (input == 'IBM'){
        x=18;
    }
else if (input == 'INTC'){
        x=19;
    }
else if (input == 'JBHT'){
        x=20;
    }
else if (input == 'JBLU'){
        x=21;
    }
else if (input == 'JNJ'){
        x=22;
    }
else if (input == 'JPM'){
        x=23;
    }
else if (input == 'KEX'){
        x=24;
    }
else if (input == 'KO'){
        x=25;
    }
else if (input == 'KSU'){
        x=26;
    }
else if (input == 'LSTR'){
        x=27;
    }
else if (input == 'LUV'){
        x=28;
    }
else if (input == 'MATX'){
        x=29;
    }
else if (input == 'MCD'){
        x=30;
    }
else if (input == 'MMM'){
        x=31;
    }
else if (input == 'MRK'){
        x=32;
    }
else if (input == 'MSFT'){
        x=33;
    }
else if (input == 'NKE'){
        x=34;
    }
else if (input == 'NSC'){
        x=35;
    }
else if (input == 'PFE'){
        x=36;
    }
else if (input == 'PG'){
        x=37;
    }
else if (input == 'R'){
        x=38;
    }
else if (input == 'TRV'){
        x=39;
    }
else if (input == 'UAL'){
        x=40;
    }
else if (input == 'UNH'){
        x=41;
    }
else if (input == 'UNP'){
        x=42;
    }
else if (input == 'UPS'){
        x=43;
    }
else if (input == 'UTX'){
        x=44;
    }
else if (input == 'V'){
        x=45;
    }
else if (input == 'VZ'){
        x=46;
    }
else if (input == 'WBA'){
        x=47;
    }
else if (input == 'WMT'){
        x=48;
    }
else if (input == 'XOM'){
        x=49;
    }
    else{x=0}



    d3.json('http://localhost:3000/getCompanies')
        .then(function(data){
        //console.log(data);
            //nameData = data.map(d=>d.name);
            ceoData = data.map(d=>d.ceo);
            empData = data.map(d=>d.employees);
            sectorData = data.map(d=>d.sector);
        //document.getElementById("myName").innerHTML = nameData[x];
        document.getElementById("myCeo").innerHTML = ceoData[x];
        document.getElementById("myEmp").innerHTML = empData[x];
        document.getElementById("mySector").innerHTML = sectorData[x];
    });

};
window.onload=function(){

    drawChart('AAPL');
    drawData('AAPL');
    drawBarChart();
    drawHighestCEOChart();
    drawBiggestSector();

};
//this works....crudely lol
d3.select('#company')
    .on("change",function(){
        d3.selectAll("svg > *").remove();

        var sect = document.getElementById("company");
        var section = sect.options[sect.selectedIndex].value;
        drawChart(section);
        drawData(section);
        drawBarChart();
        drawHighestCEOChart();
        drawBiggestSector();

    });

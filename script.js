let reset = function() {
    $("td").css("background-color", "white");
    $("th").css("background-color", "#d0d0d0");
}

let clicker = function() {
	$(this).replaceWith("<td id=\"activeItem\"><input id=\"activeInput\" class=\"" + $(this).attr("class") + "\" value=\"" + $(this).html() + "\"></input></td>");
	$("#activeInput").keypress(function (event) {
		if (event['code'] == "Enter")
		{
			$("#activeItem").replaceWith("<td class=\"" + $("#activeInput").attr("class") + "\">" + $("#activeInput").val() + "</td>");
			$("td").click(clicker);
		}
	});
}

let grade = function(mark) {
	if (mark < 50.0) {
        return 'F';
    } else if (mark < 60.0) {
        return 'D';
    } else if (mark < 70.0) {
        return 'C';
    } else if (mark < 80.0) {
        return 'B';
    } else {
        return 'A';
    }
}

let graph = function(dict) {
	var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
	var svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(dict.map(function(d) { return d.grade; }))
    .padding(0.2);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

	console.log(dict);

    svg.selectAll(".bar")
    .data(dict)
    .enter()
    .append("rect")
        .attr("class","bar")
        .attr("x", function(d) { return x(d["grade"]); })
        .attr("y", function(d) { return y(d["frequency"]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d["frequency"]); })
        .attr("fill", "#69b3a2")
}

$(document).ready(function() {
	$.ajax({
		type: 'GET',
		url: 'http://localhost:8000/grades.csv',
		dataType: 'text',
		async: false,
		success: function(response) {
			let rows = response.split('\n');
			let headers = rows[0].split(',');
			headers.splice(0, 1);
			html_head = ""
			for (header in headers) {
				html_head += `<th class="c" id="${header}">${headers[header]}</th>`;
			}
			rows.splice(0, 1);
			html_items = ""
			for (row in rows)
			{
				let items = rows[row].split(',');
				id = items[0];
				items.splice(0, 1);
				let item_html = "";
				for (item in items) {
					item_html += `<td class="c${item} r${row}">${items[item]}</td>`;
				}
				html_items += `
				<tr>
					<th class="r${row}">${id}</th>
					${item_html}
				</tr>
				`;
			}
			$("#root").replaceWith(`
			<table>
				<tr>
					<th>SID</th>
					${html_head}
				</tr>
				${html_items}
			</table>
			<div id="chart"></div>
			`);
		}
	});
	
	$("td").click(clicker);
	
	$("th.c").click(function() {
		reset();
		let values = [];
		let freq = {};
		$(`td.c${$(this).attr('id')}`).map(function () {
			console.log(this.innerHTML);
			values.push(this.innerHTML);
			if (grade(this.innerHTML) in freq)
			{
				freq[grade(this.innerHTML)] += 1;
			}
			else 
			{
				freq[grade(this.innerHTML)] = 1;
			}
		});
		console.log(freq)
		for (let gr in freq) {
			freq[gr] = (freq[gr] / values.length) * 100;
		}
		let dist = [];
		for (const [grade, frequency] of Object.entries(freq)) {
			dist.push({"grade": grade, "frequency": frequency});
		}
		$("#chart").replaceWith(`<div id="chart"></div>`)
		graph(dist);
	});
	
});
const width = 1000;
const height = 500;
const margin = { top: 50, right: 20, bottom: 100, left: 80 };

const svg = d3.select('#heatmap')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', `translate(${margin.left}, ${margin.top})`);

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url).then(data => {
  const baseTemp = data.baseTemperature;
  const monthlyData = data.monthlyVariance;

  const years = [...new Set(monthlyData.map(d => d.year))];
  const months = [...new Set(monthlyData.map(d => d.month))];

  const xScale = d3.scaleBand()
                   .domain(years)
                   .range([0, width]);

  const yScale = d3.scaleBand()
                   .domain(months)
                   .range([0, height]);

  const colorScale = d3.scaleSequential()
                       .interpolator(d3.interpolateRdYlBu)
                       .domain([d3.max(monthlyData, d => d.variance + baseTemp), d3.min(monthlyData, d => d.variance + baseTemp)]);

  const xAxis = d3.axisBottom(xScale)
                  .tickValues(xScale.domain().filter(year => year % 10 === 0));

  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(month => d3.timeFormat('%B')(new Date(0, month - 1)));

  svg.append('g')
     .attr('id', 'x-axis')
     .attr('transform', `translate(0, ${height})`)
     .call(xAxis);

  svg.append('g')
     .attr('id', 'y-axis')
     .call(yAxis);

  svg.selectAll('.cell')
     .data(monthlyData)
     .enter()
     .append('rect')
     .attr('class', 'cell')
     .attr('x', d => xScale(d.year))
     .attr('y', d => yScale(d.month))
     .attr('width', xScale.bandwidth())
     .attr('height', yScale.bandwidth())
     .attr('fill', d => colorScale(d.variance + baseTemp))
     .attr('data-month', d => d.month - 1)
     .attr('data-year', d => d.year)
     .attr('data-temp', d => d.variance + baseTemp)
     .on('mouseover', function (event, d) {
       const tooltip = d3.select('#tooltip');
       tooltip.transition()
              .duration(200)
              .style('opacity', 0.9);

       tooltip.html(`Year: ${d.year}<br>Month: ${d3.timeFormat('%B')(new Date(0, d.month - 1))}<br>Temp: ${(baseTemp + d.variance).toFixed(2)}&#8451;`)
              .attr('data-year', d.year)
              .style('left', (event.pageX + 5) + 'px')
              .style('top', (event.pageY - 28) + 'px');
     })
     .on('mouseout', function () {
       d3.select('#tooltip').transition().duration(500).style('opacity', 0);
     });

  // Legend
  const legendColors = 4;
  const legendScale = d3.scaleLinear()
                        .domain(d3.extent(monthlyData, d => d.variance + baseTemp))
                        .range([0, 300]);

  const legendAxis = d3.axisBottom(legendScale).ticks(legendColors);

  const legend = d3.select('#legend')
                   .append('svg')
                   .attr('width', 320)
                   .attr('height', 50)
                   .append('g')
                   .attr('transform', 'translate(10,10)');

  legend.selectAll('.legend-rect')
        .data(d3.range(legendColors))
        .enter()
        .append('rect')
        .attr('class', 'legend-rect')
        .attr('width', 60)
        .attr('height', 20)
        .attr('x', (d, i) => i * 60)
        .attr('fill', d => colorScale(legendScale.invert(d * 60)));

  legend.append('g')
        .attr('transform', 'translate(0, 20)')
        .call(legendAxis);
});

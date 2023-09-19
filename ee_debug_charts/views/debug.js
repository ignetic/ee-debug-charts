/* Debug chart scripts*/
;(function () {
	"use strict";
	
	const wrapperClass = 'debug-content-wrapper';
	const expanderClass = 'debug-expander';

	function getNodeText(el) {
		if (!el) {
			return '';
		}
		let nodeText = el.textContent || '';
		for (let i = 0; i < el.childNodes.length; i++) {
			let curNode = el.childNodes[i];
			if (curNode.nodeName === "#text") {
				nodeText = curNode.nodeValue;
				break;
			}
		}
		return nodeText;
	}

	function getNodeValue(el, selector) {
		selector = selector || '.query-time';
		let node = el.querySelector(selector);
		let nodeText = getNodeText(node);
		return parseFloat(nodeText);
	}

	// accending sort
	function asc_sort(a, b){
		return (getNodeValue(b)) < (getNodeValue(a)) ? 1 : -1;
	}

	// decending sort
	function dec_sort(a, b){
		return (getNodeValue(b)) > (getNodeValue(a)) ? 1 : -1;
	}

	// Sort queries list alphabetically 
	document.addEventListener('DOMContentLoaded', function() {
		
		let $debugger = document.querySelector('.ee-debugger');

		if ($debugger) {

			let $queriesContent = $debugger.querySelectorAll('.tab.t-2 .debug-content, .tab.t-3 .debug-content');
			
			// wrap contents of tab sections
			for (let i = 0; i < $queriesContent.length; i++) {
				
				let $content = $queriesContent[i];
				
				if ($content && $content.querySelector('ul')) {
					
					let $ulContent = $content.querySelectorAll('ul');
					
					for (let j = 0; j < $ulContent.length; j++) {
						
						let $ul = $ulContent[j];
						let $h2 = $ul.previousElementSibling;
						
						if ($h2.nodeName !== 'H2') {
							return;
						}
						
						// create expander
						let $expander = document.createElement('div');
						$expander.classList.add(expanderClass);
						
						// create wrapper
						let $wrapper = document.createElement('div');
						$wrapper.classList.add(wrapperClass);
						
						// style h2
						$h2.classList.add('btn', 'btn-default', 'btn-large');
						let $chevron = document.createElement('div');
						$chevron.classList.add('chevron', 'bottom');
						$h2.prepend($chevron);

						// add sort buttons
						let $sortButtons = document.createElement('div');
						$sortButtons.classList.add('debug-sort-buttons');
						$sortButtons.innerHTML = '<button class="sort-asc">Sort ASC <span class="chevron top"></span></button> <button class="sort-desc">Sort DESC <span class="chevron bottom"></span></button>';
						
						
						// move h2 and ul into wrapper
						$h2.parentNode.insertBefore($wrapper, $h2);
						$ul.parentNode.insertBefore($wrapper, $ul);
						
						$wrapper.appendChild($h2);
						$expander.appendChild($sortButtons);
						$expander.appendChild($ul);
						
						$wrapper.appendChild($expander);
					}
					
					// buttons
					let $buttons = $content.querySelectorAll('button.sort-asc, button.sort-desc');

					for (let i = 0; i < $buttons.length; i++) {
						$buttons[i].addEventListener('click', function(e){
							let $wrapper = this.closest('.debug-content-wrapper');
							let list = $wrapper.querySelector('ul');
							if (this.classList.contains('sort-asc')) {
								Array.from(list.getElementsByTagName("LI"))
									.sort(asc_sort)
									.forEach(li => list.appendChild(li));
							} else {
								Array.from(list.getElementsByTagName("LI"))
									.sort(dec_sort)
									.forEach(li => list.appendChild(li));
							}
						}, false);
					}
				
				}
			}

			addDebugCharts();
			addDebugScript();

		}
	});


	// Add debug charts
	function addDebugCharts() {

		function loadScriptByURL(id, url, callback) {
		  const isScriptExist = document.getElementById(id);
		  if (!isScriptExist) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			script.id = id;
			script.onload = function () {
			  if (callback) callback();
			};
			document.body.appendChild(script);
		  }
		  if (isScriptExist && callback) callback();
		}

		function debounce(func, wait = 0, immediate = false) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		}

		// load the script by passing the URL
		loadScriptByURL('google-visualization', 'https://www.google.com/jsapi', function () {

			let $chartDiv, $debuggers = document.querySelectorAll('.ee-debugger .tab.t-2 .debug-content .debug-content-wrapper');

			let $duplicate_debugger = $debuggers[0];
			let $query_debugger = $debuggers[1];
			let $template_debugger = document.querySelector('.ee-debugger .tab.t-3 .debug-content .debug-content-wrapper');

			let duplicate_values = [], query_values = [], template_values = []; 
			
			let chartPadding = 30;
			let chartOffset = 40;
			let defaultWidth = 500;
			if (document.querySelector('.ee-debugger .tab-wrap')) {
				defaultWidth = document.querySelector('.ee-debugger .tab-wrap').offsetWidth - chartOffset;
			}


			// Create charts

			// Duplicates chart
			if ($duplicate_debugger) {
			
				$chartDiv = document.createElement('div');
				$chartDiv.classList.add('debug-chart');
				$chartDiv.innerHTML = '<div id="duplicate_chart"></div>';
				$duplicate_debugger.prepend($chartDiv);
				
				let duplicate_count = 0;
				let duplicate_total = 0;
				let $duplicate_list = $duplicate_debugger.querySelectorAll('ul li');
				for (let i = 0; i < $duplicate_list.length; i++) {
					let $this = $duplicate_list[i];
					let $query_time = $this.querySelector('.query-time');
					if (!$query_time) { 
						break;
					}
					let time = parseFloat(getNodeText($query_time));//parseFloat($query_time.contents().get(0).nodeValue);
					let file = $this.querySelector('.query-file').textContent;

					file = file.trim();
					file = file.split("\n")[0];

					duplicate_total += time;
					duplicate_values[duplicate_count] = {};
					duplicate_values[duplicate_count].time = time;
					duplicate_values[duplicate_count].file = file;
					
					$this.setAttribute('data-row-num', duplicate_count);
					
					duplicate_count++;
				}
			
			}

			// Queries chart
			if ($query_debugger) {
				
				$chartDiv = document.createElement('div');
				$chartDiv.classList.add('debug-chart');
				$chartDiv.innerHTML = '<div id="query_chart"></div>';
				$query_debugger.prepend($chartDiv);
				
				let query_count = 0;
				let query_total = 0;
				let $query_list = $query_debugger.querySelectorAll('ul li');
				for (let i = 0; i < $query_list.length; i++) {
					let $this = $query_list[i];
					let $query_time = $this.querySelector('.query-time');
					if (!$query_time) { 
						break;
					}
					let time = parseFloat(getNodeText($query_time));
					let file = $this.querySelector('.query-file').textContent;
					
					file = file.trim();
					
					query_total += time;
					query_values[query_count] = {};
					query_values[query_count].time = query_total.toFixed(5);
					query_values[query_count].file = file;
					query_values[query_count].warn = $this.classList.contains('debug-warn');
					
					$this.setAttribute('data-row-num', query_count);
					
					query_count++;
				}
			
			}
			
			// Templates chart
			if ($template_debugger) {
			
				$chartDiv = document.createElement('div');
				$chartDiv.classList.add('debug-chart');
				$chartDiv.innerHTML = '<div id="template_chart"></div>';
				$template_debugger.prepend($chartDiv);
				
				let template_count = 0;
				let $template_list = $template_debugger.querySelectorAll('ul li');
				for (let i = 0; i < $template_list.length; i++) {
					let $this = $template_list[i];
					let $mark = $this.querySelector('mark');
					if (!$mark) { 
						break;
					}
					var time = getNodeText($mark);//$mark.contents().get(0).nodeValue;
					var file = getNodeText($this);
					var $code = $this.querySelector('code');
					file = file.trim();
					if ($code) {
						file += ' ' + $code.textContent;
					}
					
					time = time.split('/')[0];
					time = time.trim();
					
					template_values[template_count] = {};
					template_values[template_count].time = time;
					template_values[template_count].file = file;
					template_values[template_count].warn = $this.classList.contains('debug-warn');

					$this.setAttribute('data-row-num', template_count);
					
					template_count++;
				}
			
			}


			function drawChartDuplicates() {

				let chart_div = document.getElementById('duplicate_chart');
				
				if (!chart_div) {
					return;
				}

				let data = new google.visualization.DataTable();

				data.addColumn('string', 'Queries');
				data.addColumn('number', 'Duplicates');

				data.addColumn({type: 'string', role: 'tooltip'});

				for (let i in duplicate_values) {
					let value = duplicate_values[i];
					if (typeof value !== 'undefined') {
						let time = parseFloat(value.time);
						data.addRow([value.time+'', time, time+"x\n "+value.file]);
					}
				}

				let chart_width = chart_div.offsetWidth || defaultWidth;
				let area_width = chart_width - (chartPadding * 2);

				let options = {
					height: 208, 
					legend:'in', 
					backgroundColor: 'none',
				};
				if (chart_width > 0) {
					options.width = chart_width,
					options.chartArea = {
						width: area_width, 
						height: 160,
						top: 10,
						left: chartPadding
					};
				}

				// Instantiate and draw the chart.
				let chart = new google.visualization.ColumnChart(chart_div);
				chart.draw(data, options);

				jumpToSelection(chart);
			}


			function drawChartQueries() {

				let chart_div = document.getElementById('query_chart');

				if (!chart_div) {
					return;
				}

				let data = new google.visualization.DataTable();

				data.addColumn('string', 'Queries');
				data.addColumn('number', 'Seconds');

				for (let i in query_values) {
					let value = query_values[i];
					if (typeof value !== 'undefined') {
						let time = parseFloat(value.time);
						data.addRow([value.time, time]);
					}
				}

				// create data view to add color
				let dataView = new google.visualization.DataView(data);
				dataView.setColumns([
					// include x & y column index
					0, 1,
					// add calculated color
					{
						calc: function(data, row) {
							if (typeof query_values[row] !== 'undefined' && query_values[row].warn) {
								return '#ff6666';
							}
						},
						type: 'string',
						role: 'style'
					},
					// add tooltip
					{
						calc: function(data, row) {
							if (typeof query_values[row] !== 'undefined') {
								return query_values[row].time+"s\n "+query_values[row].file;
							}
						},
						type: 'string', 
						role: 'tooltip'
					}
				]);

				let chart_width = chart_div.offsetWidth || defaultWidth;
				let area_width = chart_width - (chartPadding * 2);

				let options = {
					height: 208, 
					legend:'in', 
					backgroundColor: 'none',
					hAxis: {
						slantedText: true,
						textStyle: {
							fontSize: 11,
							bold: false,
							italic: false
						}
					}
				};
				if (chart_width > 0) {
					options.width = chart_width,
					options.chartArea = {
						width: area_width, 
						height: 160,
						top: 10,
						left: chartPadding
					};
				}

				// Instantiate and draw the chart.
				let chart = new google.visualization.LineChart(chart_div);
				chart.draw(dataView, options);

				jumpToSelection(chart);

			}


			function drawChartTemplates() {

				let chart_div = document.getElementById('template_chart');

				if (!chart_div) {
					return;
				}

				let data = new google.visualization.DataTable();

				data.addColumn('string', 'Queries');
				data.addColumn('number', 'Seconds');

				for (let i in template_values) {
					let value = template_values[i];
					if (typeof value !== 'undefined') {
						let time = parseFloat(value.time);
						data.addRow([value.time, time]);
					}
				}

				// create data view to add color
				let dataView = new google.visualization.DataView(data);
				dataView.setColumns([
					// include x & y column index
					0, 1,
					// add calculated color
					{
						calc: function(data, row) {
							if (typeof template_values[row] !== 'undefined' && template_values[row].warn) {
								return '#ff6666';
							}
						},
						type: 'string',
						role: 'style'
					},
					// add tooltip
					{
						calc: function(data, row) {
							if (typeof template_values[row] !== 'undefined') {
								return template_values[row].time+"s\n "+template_values[row].file;
							}
						},
						type: 'string', 
						role: 'tooltip'
					}
				]);

				let chart_width = chart_div.offsetWidth || defaultWidth;
				let area_width = chart_width - (chartPadding * 2);
				
				let options = {
					height: 208,
					legend:'in',
					backgroundColor: 'none',
					hAxis: {
						slantedText: true,
						textStyle: {
							fontSize: 11,
							bold: false,
							italic: false
						}
					}
				};
				if (chart_width > 0) {
					options.width = chart_width,
					options.chartArea = {
						width: area_width, 
						height: 160,
						top: 10,
						left: chartPadding
					};
				}

				// Instantiate and draw the chart.
				let chart = new google.visualization.LineChart(chart_div);
				chart.draw(dataView, options);

				jumpToSelection(chart);

			}

			function findPosition(obj) {
				let currenttop = 0;
				if (obj.offsetParent) {
				do {
					currenttop += obj.offsetTop;
				} while ((obj = obj.offsetParent));
					return [currenttop];
				}
			}

			function jumpToSelection(chart) {
				google.visualization.events.addListener(chart, 'select', function(e) {
					let $chart = chart.container;
					let chart_id = $chart.id;
					let selection = chart.getSelection();
					if (selection.length) {
						let $container = $chart.closest('.' + wrapperClass);
						if (!$container) {
							return;
						}
						let $expander = $container.querySelector('.' + expanderClass);
						if (!$expander) {
							return;
						}
						let $ul = $expander.querySelector('ul');
						if (!$ul) {
							return;
						}
						let selectedIndex = chart.getSelection()[0].row;
						let $row = $ul.querySelector('li[data-row-num="'+selectedIndex+'"]');
						
						$expander.classList.add('expanded');
						
						if ($row) {

							// hide
							for (let i = 0; i < $ul.children.length; i++) {
								let child = $ul.children[i];
								if (child.tagName == 'LI') {
									child.classList.remove('selected');
								}
								let existing = child.querySelector('.back-to-chart');
								if (existing) {
									existing.remove();
								}
							}
							
							// show
							$row.classList.add('selected');
							
							// create link
							let str = '<a href="#'+chart_id+'" class="back-to-chart">Back to chart <span class="chevron top"></span></a>';
							let temp = document.createElement('div');
							temp.innerHTML = str;
							while (temp.firstChild) {
								$row.append(temp.firstChild);
							}

							//$row.scrollIntoView();
							let offset = findPosition($row) - 150;

							window.scrollTo({
								top: offset,
								left: 0,
								behavior: 'smooth'
							});
							
						}
					}
				}); 
			}

			function redrawCharts() {
				drawChartDuplicates();
				drawChartQueries();
				drawChartTemplates();
			}

			function drawCharts() {
				let $tabButtons = document.querySelectorAll('.ee-debugger .tab-bar__tabs button.tab-bar__tab');

				if ($tabButtons.length > 2) {
					$tabButtons[2].addEventListener('click', function(e){
						setTimeout(drawChartDuplicates, 1);
						setTimeout(drawChartQueries, 1);
					}, false);
				}

				if ($tabButtons.length > 3) {
					$tabButtons[3].addEventListener('click', function(e){
						setTimeout(drawChartTemplates, 1);
					}, false);
				}

				window.addEventListener('resize', function() {
					debounce(redrawCharts(), 100);
				}, true);

				redrawCharts();
			}

			let $toggles = document.querySelectorAll('.ee-debugger .'+wrapperClass+' h2');
			for (let i = 0; i < $toggles.length; i++) {
				$toggles[i].addEventListener('click', function(e){
					let $wrapper = this.closest('.'+wrapperClass);
					let $expander = $wrapper.querySelector('.'+expanderClass);
					if ($expander) {
						let style = window.getComputedStyle($expander);
						if (style.display === 'none' || style.height === '0px') {
							$expander.classList.add('expanded');
						} else {
							$expander.classList.remove('expanded');
						}
					}
				}, false);
			}

			let $debugger = document.querySelector('.ee-debugger');
			$debugger.addEventListener('click', function(e) {
				if (e.target.tagName.toLowerCase() === 'a' && e.target.classList.contains('back-to-chart')) {
					e.preventDefault();
					let anchorLink = e.srcElement.attributes.href.textContent;
					let $target = document.querySelector(anchorLink);
					if ($target) {
						let offset = findPosition($target) - 150;
						window.scrollTo({
							top: offset,
							left: 0,
							behavior: 'smooth'
						});
					}
				}
			});
			
			google.load('visualization', '1', {packages:['corechart', 'bar']});
			google.setOnLoadCallback(drawCharts);

		});
	}


/* EE's debug script - missing from non-PAGE REQ's when debugging ACT if ever needed */

	function addDebugScript() {
		"use strict";

		var wrap = document.querySelector('.ee-debugger .tab-wrap');
		var tabs = wrap.querySelectorAll('.tab-bar__tab');
		var sheets = wrap.querySelectorAll('.tab');

		if (!document.querySelector("link[href$='/themes/ee/debug/css/eecms-debug.min.css']")) {
			var link = document.createElement('link');
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = "/themes/ee/debug/css/eecms-debug.min.css";
			document.head.appendChild(link);
		}

		// check if any tabs are hidden, then we know if this script is alreay loaded.
		var already_exists = false;
		if (sheets.length) {
			for (var i = 0; i < sheets.length; i++) {
				var style = window.getComputedStyle(sheets[i]);
				if (style.display === 'none') {
					already_exists = true;
				}
			}
		}
		if (!sheets.length || already_exists) {
			return;
		}
		// end check

		var removeClassFromAll = function(list, klass) {
			for (var i = 0; i < list.length; i++) {
				list[i].classList.remove(klass);
			}
		}

		var handleTabClick = function(evt) {
			evt.preventDefault();

			removeClassFromAll(tabs, 'active');
			removeClassFromAll(sheets, 'tab-open');

			var tab = this;
			var sheet = wrap.querySelector('.tab.' + this.getAttribute('rel'));

			tab.classList.add('active');
			sheet.classList.add('tab-open');
		};

		for (var i = 0; i < tabs.length; i++) {
			tabs[i].addEventListener('click', handleTabClick, false);
		}

		var toggles = wrap.querySelectorAll('a.toggle');

		var toggleVisibility = function(el) {
			var detailElement = wrap.querySelector('.' + el.rel);
			var visible = +detailElement.getAttribute('data-toggle');

			el.innerHTML = ["hide details", "show more"][visible];

			detailElement.style.display = ["block", "none"][visible];
			detailElement.setAttribute('data-toggle', Math.abs(visible - 1));

			return false;
		}

		for (var i = 0; i < toggles.length; i++) {
			toggles[i].addEventListener('click', function(evt) { evt.preventDefault(); toggleVisibility(this); }, false);
		}
	}


})();
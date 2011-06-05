$(document).ready(function() {
	function positionFooter() {
		var main = $('#main'),
			footer = $('footer');

		main.css('paddingBottom', footer.outerHeight());
		footer.css('margin-top', - footer.outerHeight());
	}

	positionFooter();

	$(window).bind('resize', positionFooter);
});

$(window).load(function() {
	$('#slider').nivoSlider({
		controlNav: false,
		directionNav: false
	});
});
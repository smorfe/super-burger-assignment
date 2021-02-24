var finalOrder = {};
var orderLineItems = {};
var finalAmount = 0;

$(document).ready(function () {
	loadProducts();

	$("#place-order-button").click(function () {
		fetch("OrderProcessingServlet", {
			method: "POST",
			body: JSON.stringify({ order: finalOrder }),
			headers: { "content-type": "application/json" },
		}).then(function (response) {
			if (response.ok) {
				console.log("Post Non Apple Payment successful !");
			} else {
				console.log("Post Non Apple Payment Post failed !!!");
			}
		});
	});
	// displaySelectedItemsDiv(false);
	disableNonApplePayButton(true);
});

$(document).on("pageinit", "#cart", function (event) {
	repaintSelectedList();
});

function disableNonApplePayButton(disable) {
	$("#place-order-button").prop("disabled", disable);
}

// function displaySelectedItemsDiv(display) {
// 	if (display) {
// 		$("#selected-products-div").show();
// 	} else {
// 		$("#selected-products-div").hide();
// 	}
// }

function loadProducts() {
	$.getJSON("content/products.json", function (data) {
		var listItems = [];

		$.each(data, function (key, val) {
			var orderLineItem = {
				product: val,
				count: 0,
			};

			orderLineItems[orderLineItem.product.id] = orderLineItem;

			var productHasOptions = typeof orderLineItem.product.options == "undefined";

			var listItem =
				"<div class='list-item'>" +
				'<div class="list-wrapper">' +
				'<div class="list-header">' +
				'<div class="list-image"><img src="content/assets/productImages/' +
				orderLineItem.product.image +
				'"/></div>' +
				"<h2>" +
				orderLineItem.product.name +
				"</h2>" +
				"</div>" +
				'<div class="list-content">' +
				"<p> " +
				orderLineItem.product.description +
				"</p>" +
				(productHasOptions ? "" : "<div class='options-btn-group'><small><strong>Sizes:</strong></small>" + buildOptions(orderLineItem.product.options, orderLineItem.product.id) + "</div>") +
				"</div>" +
				"<div class='list-price'>" +
				(productHasOptions
					? "<p><strong>$" + orderLineItem.product.price / 100 + " ea.</strong></p>"
					: "<p class='product-option-price' id='product-option-price-" + orderLineItem.product.id + "'></p>") +
				'<a id="btn_' +
				orderLineItem.product.id +
				'_add" onclick="productAdded(this)" href="#purchase-popup" class="add-button ' +
				(productHasOptions ? "" : "isDisabled") +
				'" data-rel="popup" data-position-to="#added-product-popup"><span class="add-product-label" id="add-product-label-' +
				orderLineItem.product.id +
				'">' +
				(productHasOptions ? "Add to Cart" : "Select a size") +
				"</span></a>" +
				"</div>" +
				"</div>" +
				"</div>";

			listItems.push(listItem);
		});

		$("#all-products").append(listItems.join(""));
		// Task 2: Add the missing line. Hint: The list may need to be refreshed to reapply the styles as the list is build dynamically instead of static
	});
}

function buildOptions(options, productId) {
	var optionsHTML = "<ul>";

	$.each(options, function (size, price) {
		optionsHTML =
			optionsHTML +
			'<li><label><input type="radio" id="option_PRODprice_' +
			productId +
			"_" +
			size +
			'" name="order_PRODoption_price_' +
			productId +
			'" data-option-selected="' +
			size +
			'" value="' +
			price +
			'" onchange="productOptionPrice(' +
			price +
			", '" +
			productId +
			"')\" /><span>" +
			size +
			"</span></label></li>";
	});

	optionsHTML = optionsHTML + "</ul>";

	return optionsHTML;
}

function productOptionPrice(option, productId) {
	var formattedSubTotal = option / 100.0;
	$("#product-option-price-" + productId).text("$" + formattedSubTotal + " ea.");
	$("#add-product-label-" + productId).text("Add to Cart");
	$(".isDisabled").removeClass("isDisabled");
}

function productAdded(component) {
	var productId = getProductId(component.id);
	var orderLineItem = orderLineItems[productId];
	var selectedOption = $('input[name="order_PRODoption_price_' + productId + '"]:checked');

	if (orderLineItem.product.options && selectedOption.length > 0) {
		orderLineItem.product.price = selectedOption.val();

		$('input[name="order_PRODoption_price_' + productId + '"]:checked').prop("checked", false);
		$("#add-product-label-" + productId).text("Select a size");
		$("#product-option-price-" + productId).empty();
		$(".isDisabled").addClass("isDisabled");
	}

	setTimeout(function () {
		$("#purchase-popup").popup("close");
	}, 1100);

	if (orderLineItem.product.options && selectedOption.length === 0) {
		$("#notification").html("<strong>Please select a size.</strong>");
	} else {
		orderLineItem.count = orderLineItem.count + 1;

		orderLineItems[productId] = orderLineItem;

		$("#notification").html("<strong>" + orderLineItem.product.name + "</strong><em> is added to the cart.</em>");

		calculatePrice();
		disableNonApplePayButton(false);
		repaintSelectedList();
	}
}

function productRemoved(component) {
	var productId = getProductId(component.id);
	var orderLineItem = orderLineItems[productId];
	if (orderLineItem.count > 0) {
		orderLineItem.count = orderLineItem.count - 1;
		orderLineItems[productId] = orderLineItem;
		console.log(productId + " - " + orderLineItem.count);
	}
	calculatePrice();
	repaintSelectedList();
	// if (orderLineItem.count == 0) disableNonApplePayButton(true);
}

function repaintSelectedList() {
	var listSelectedItems = [];
	$.each(orderLineItems, function (key, orderLineItem) {
		if (orderLineItem.count != 0) {
			var listSelectedItem =
				"<li>" +
				"<div class='list-item'>" +
				"<div class='list-heading'>" +
				'<img src="content/assets/productImages/' +
				orderLineItem.product.image +
				'" width="80" />' +
				"<h2>" +
				orderLineItem.product.name +
				"</h2>" +
				"</div>" +
				"<div class='list-count'>" +
				"<p>" +
				orderLineItem.count +
				"</p>" +
				"</div>" +
				"<div class='list-remove'>" +
				'<a id="btn_' +
				orderLineItem.product.id +
				'_add" onclick="productRemoved(this)" href="#purchase" class="ui-btn ui-nodisc-icon ui-icon-delete ui-corner-all ui-btn-icon ui-btn-icon-notext">Remove</a>' +
				"</div>" +
				"</div>" +
				"</li>";

			listSelectedItems.push(listSelectedItem);
		}
	});

	$("#selected-products").empty();
	$("#selected-products").append(listSelectedItems.join(""));
	$("#selected-products").listview("refresh");

	// if (listSelectedItems.length == 0) {
	// 	displaySelectedItemsDiv(false);
	// } else {
	// 	displaySelectedItemsDiv(true);
	// }
}

function getProductId(componentId) {
	var firstIndex = componentId.indexOf("_") + 1;
	var lastIndex = componentId.lastIndexOf("_");

	return componentId.substring(firstIndex, lastIndex);
}

function calculatePrice() {
	var subTotal = 0.0;
	var finalOrderItems = [];
	var totalOrderItems = 0;

	console.log(orderLineItems);

	$.each(orderLineItems, function (key, orderLineItem) {
		if (orderLineItem.count != 0) {
			totalOrderItems += orderLineItem.count;
			subTotal = subTotal + orderLineItem.count * orderLineItem.product.price;
			finalOrderItems.push(orderLineItem);
		}
	});
	var formattedSubTotal = subTotal / 100.0;

	$("#total-items").text("Items: " + totalOrderItems);
	$("#total-price").text("Total: $" + formattedSubTotal);
	$("#payment_amount").text("Total: $" + formattedSubTotal);

	finalOrder = {
		finalOrderItems: finalOrderItems,
		subTotal: subTotal,
		formattedSubTotal: formattedSubTotal,
	};

	finalAmount = subTotal;

	if (finalAmount == 0) disableNonApplePayButton(true);
	console.log("Final amount : " + finalAmount);
	console.log(JSON.stringify(finalOrder));
}

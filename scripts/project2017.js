// DIALLO IBRAHIMA

// === constants ===
const MAX_QTY = 9;
const productIdKey = "product";
const orderIdKey = "order";
const inputIdKey = "qte";

// === global variables  ===
// the total cost of selected products 
var total = 0;



// function called when page is loaded, it performs initializations 
var init = function () { 
    createShop();
    filterProducts();
    RecoverCart();
}
window.addEventListener("load", init);



// usefull functions

/*
* create and add all the div.produit elements to the div#boutique element
* according to the product objects that exist in 'catalog' variable
*/
var createShop = function () {
	var shop = document.getElementById("boutique");
	for(var i = 0; i < catalog.length; i++) {
		shop.appendChild(createProduct(catalog[i], i));
	}
}

/*
* create the div.produit elment corresponding to the given product
* The created element receives the id "index-product" where index is replaced by param's value
* @param product (product object) = the product for which the element is created
* @param index (int) = the index of the product in catalog, used to set the id of the created element
*/
var createProduct = function (product, index) {
	// build the div element for product
	var block = document.createElement("div");
	block.className = "produit";
	// set the id for this product
	block.id = index + "-" + productIdKey;
	// build the h4 part of 'block'
	block.appendChild(createBlock("h4", product.name));
	
	// build and add the figure of the product
	block.appendChild(createFigureBlock(product));

	// build and add the div.description part of 'block' 
	block.appendChild(createBlock("div", product.description, "description"));
	// build and add the div.price part of 'block'
	block.appendChild(createBlock("div", product.price, "prix"));
	// build and add control div block to product element
	block.appendChild(createOrderControlBlock(index));
	return block;
}


/* return a new element of tag 'tag' with content 'content' and class 'cssClass'
 * @param tag (string) = the type of the created element (example : "p")
 * @param content (string) = the html wontent of the created element (example : "bla bla")
 * @param cssClass (string) (optional) = the value of the 'class' attribute for the created element
 */
var createBlock = function (tag, content, cssClass) {
	var element = document.createElement(tag);
	if (cssClass != undefined) {
		element.className =  cssClass;
	}
	element.innerHTML = content;
	return element;
}

/*
* builds the control element (div.controle) for a product
* @param index = the index of the considered product 
*/
var createOrderControlBlock = function (index) {
	var control = document.createElement("div");
	control.className = "controle";

	// create input quantity element
	var input = document.createElement("input");
	input.id = index + '-' + inputIdKey;
	input.type = "number";
	input.step = "1";
	input.value = "0";
	input.min = "0";
	input.max = MAX_QTY.toString();
	// add input to control as its child
	control.appendChild(input);
	
	// create order button
	var button = document.createElement("button");
	button.className = 'commander';
	button.id = index + "-" + orderIdKey;
	// add control to control as its child
	control.appendChild(button);
    
    	// managers of input quantity element
    	input.addEventListener("input", ChangeOpacity);
    	input.addEventListener("blur", function (e) {
        controlCapture(e, input.min, input.max);
    	});
    
    	// manager of the order an article
    	button.addEventListener("click", OrderArticle);
    
	// the built control div node is returned
	return control;
}


/*
* create and return the figure block for this product
* see the static version of the project to know what the <figure> should be
* @param product (product object) = the product for which the figure block is created
*/
var createFigureBlock = function (product) {
    var content = '<img src="' + product.image + '" alt="' + product.name + '">'; 
	return createBlock("figure", content);
}

/*
* manages the search for a product in the catalog
* allows to filter the shop products
* displays only products that contain the character string present in the filter
*/
var filterProducts = function () {
    var filter = document.getElementById("filter");
    var shop = document.getElementById("boutique");
    filter.addEventListener("keyup", function () {
        for (var i = 0; i < catalog.length; i++) { 
            var productName = catalog[i].name.toLowerCase();
            var productId = i + "-" + productIdKey; 
            var product = document.getElementById(productId);
            var text = filter.value.toLowerCase();
            if (product === null) {
                /* take the product from the catalog corresponding to the characters entered 
                   in the filter and then put it in the shop following the order of the catalog */
                if (productName.indexOf(text) !== -1) {
                    shop.replaceChild(createProduct(catalog[i], i), shop.childNodes[i]);
                }
            } else {
                /* replaces in the shop the products that don't contain the characters entered 
                    in the filter by an empty node */
                if (productName.indexOf(text) === -1) {
                    shop.replaceChild(document.createElement("span"), product);
                }               
            }
        }
    });
};

/*
* change the cart button opacity. The button remains transparent 
* as long as the input quantity is not greater than zero
* @param event (object) = the event triggered
*/
var ChangeOpacity = function (event) {
    var input = event.target;
    var index = input.id.split('-')[0];
    var commanderButton = document.getElementById(index + "-" + orderIdKey);
    commanderButton.style.opacity = (input.value > input.min) ? "1" : "0.25";
}

/*
* controls the values entered in the quantity entry field
* @param event (object) = the event triggered
* @param minQte (string) = the minimum allowed quantity for an article
* @param maxQte (string) = the maximum allowed quantity for an article
*/
var controlCapture = function (event, minQte, maxQte) {
    var input = event.target;
    var regex = /^[0-9]/;
    if (regex.test(input.value)) {
        if (input.value.length > 1) {
            input.value = maxQte;
        }
    } else {
        input.value = minQte;
    }
}

/* 
* compute the purchases total cost and return the value computed
* @param purchases (element) = the element containing all articles to purchase
*/
var computeTotalCost = function (purchases) {
    total = 0;
    for (var i = 0; i < purchases.children.length - 1; i++) {
        var purchase = purchases.children[i];
        var quantity = Number(purchase.children[2].children[0].value);
        var price = Number(purchase.children[3].textContent);
        total += quantity * price;
    }
    return total;
}

/*
* manages the change an article's quantity in cart
* the allowed values are between 1 and MAX_QTY(9)
* @param event (object) = the event triggered
*/
var changeQuantityInCart = function (event) {
    var inputQuantity = event.target;
    var index = inputQuantity.id.split('-')[0];
    var price = catalog[index].price;
    var purchases = document.querySelector("#panier > .achats");  
    controlCapture(event, "1", MAX_QTY);
    document.getElementById(index + "-qtepanier").setAttribute("value", inputQuantity.value);
    document.getElementById("montant").textContent = computeTotalCost(purchases);
}

/*
* remove an ordered article from cart
* the article is completely removed from the cart regardless of its quantity
* @param event (object) = the event triggered
*/
var removeArticle = function (event) {
    var removeButton = event.target;
    var index = removeButton.id.split('-')[0];
    var price = catalog[index].price;
    var purchase = document.getElementById(index + "-achat");
    var purchases = document.querySelector("#panier > .achats");
    var store = document.getElementById("sauvegarder");
    purchase.parentNode.removeChild(purchase);
    document.getElementById("montant").textContent = computeTotalCost(purchases);
    if (purchases.childNodes.length === 1 && store) {
        purchases.removeChild(store);
    }
}

/*
* create a new element in the cart for an ordered article or update 
* the element in the cart that has changed its quantity
* @param index (number) = the article index in the catalog
* @param quantity (number) = the ordered article's quantity
* @param purchases (element) = the element containing all articles to purchase
* @param updateTotalCost (boolean) = the boolean for updating the total amount
*/
var CreateOrUpdatePurchase = function (index, quantity, purchases, updateTotalCost) {
    var product = catalog[index];
    var price = Number(product.price);
    var purchase = document.getElementById(index + "-achat");
    
    if (purchase === null) {
        var content = '<figure><img src="' + product.image + '" alt="' + product.name + '"></figure>'
            + '<h4>' + product.description + '</h4>'
            + '<div class="quantite"><input value="' + quantity + '"></div>'
            + '<div class="prix">' + price + '</div>'
            + '<div class = "controle"><button class="retirer" id="' + index + '-remove"></button></div>';
        // build the div.achat part of '#panier'
        purchase = createBlock("div", content, "achat");
        purchase.id = index + "-achat";
        // set style for input quantity element of '#panier'
        var inputQuantity = purchase.childNodes[2].childNodes[0];
        inputQuantity.id = index + "-qtepanier";
        inputQuantity.style.fontSize = "12px";
        inputQuantity.style.width = "14px";
        inputQuantity.style.textAlign = "center";
        inputQuantity.style.color = "red";
        inputQuantity.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
        inputQuantity.style.borderStyle = "none";
        inputQuantity.style.borderRadius = "3px";
        inputQuantity.style.marginRight = "2px";

        purchases.insertBefore(purchase, purchases.lastChild);
        
    } else {
        
        var oldQuantity = Number(document.getElementById(index + "-qtepanier").value);
        quantity += oldQuantity;
        if (quantity > MAX_QTY) {
            quantity = MAX_QTY;
        }
        document.getElementById(index + "-qtepanier").setAttribute("value", quantity);
        updateTotalCost = true;
    } 
    document.getElementById("montant").textContent = computeTotalCost(purchases);
}

/*
* order the selected article and add it to cart
* builds the cart by adding one by one the products to buy
* @param event (object) = the event triggered
*/
var OrderArticle = function (event) {
    var commanderButton = event.target;
    var index = commanderButton.id.split('-')[0];
    var input = document.getElementById(index + '-' + inputIdKey);
    var quantity = Number(input.value);
    
    if (quantity >= 1) {
        var updateTotalCost = false;
        var minimum = Number(input.min);
        var purchases = document.querySelector("#panier > .achats");
        var orderButton = document.getElementById(index + "-" + orderIdKey);
        input.value = input.min;
        orderButton.style.opacity = "0.25";
        
        // create or update a product to buy in the shopping cart
        CreateOrUpdatePurchase(index, quantity, purchases, updateTotalCost);
        
        // manager of deleting an article in cart
        var removeButton = document.getElementById(index + "-remove");
        removeButton.addEventListener("click", removeArticle);
        
        // manager of modifying an article's quantity in cart
        if (!updateTotalCost) {
            var inputQuantity = document.getElementById(index + "-qtepanier");
            inputQuantity.addEventListener("input", changeQuantityInCart); 
        }
        
        // manager of storing the cart in browser
        var storeButton = document.getElementById("sauvegarder");
        (storeButton) ? storeButton.addEventListener("click", storeCart) : createStoreButton();
    }
}

/*
* Create a backup button of cart in the browser
*/
var createStoreButton = function () {
    var store = document.createElement("input");
    store.type = "button";
    store.value = "Sauvegarder";
    store.style.opacity = "1";
    store.id = "sauvegarder";
    var purchases = document.querySelector("#panier > .achats");
    purchases.appendChild(store);
}

/*
* Store the cart in the browser
* She uses the 'API web storage' to do that
*/
var storeCart = function () {  
    // Check browser support
    if (typeof(Storage) !== undefined) {
        var panier = document.getElementById("panier");
        // Store the cart
        localStorage.setItem(0, panier.innerHTML);
        var message = document.createElement("p");
        message.textContent = "Votre panier a bien été sauvegardé.";
        var purchases = document.querySelector("#panier > .achats");
        purchases.appendChild(message);
        // Removes the message after 3 seconds
        setTimeout(function () {
            purchases.removeChild(message);
        }, 3000);
    } else {
        panier.innerHTML = "Sorry, your browser does not support Web Storage...";
    }
}

/*
* Recover the cart when you next load the page
* When loading the page, the cart is displayed in the state where it was left
* She uses the 'API web storage' to do that
*/
var RecoverCart = function () { 
    // Check brower support
    if (typeof(Storage) !== undefined) { 
        var panier = document.getElementById("panier");
        // Retrieve the cart
        panier.innerHTML = localStorage.getItem(0);
        filterProducts();
        var purchases = panier.children[2]; 
        for (var i = 0; i < purchases.children.length - 1; i++) {
            var purchase = purchases.children[i];
            var index = purchase.id.split('-')[0];
            
            // Manager of order an article
            var orderButton = document.getElementById(index + "-" + orderIdKey);
            orderButton.addEventListener("click", OrderArticle);
            
            // Manager of deleting an article in cart
            var removeButton = document.getElementById(index + "-remove");
            removeButton.addEventListener("click", removeArticle);
            
            // Manager of modifying an article's quantity in cart
            var inputQuantity = document.getElementById(index + "-qtepanier");
            inputQuantity.addEventListener("input", changeQuantityInCart); 
        }
        
        // Manager of storing cart in the browser
        var storeButton = document.getElementById("sauvegarder");
        storeButton.addEventListener("click", storeCart); 
        
    } else {
        panier.innerHTML = "Sorry, your browser does not support Web Storage...";
    }  
}

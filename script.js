// Define an asynchronous function named 'products'
async function products() {
    // Fetch data from the '/products/' endpoint
    let a = await fetch(`/products/`);
    // Convert the fetched response to text
    let response = await a.text();
    // Create a new div element
    let div = document.createElement("div");
    // Set the inner HTML of the div to the fetched response
    div.innerHTML = response;
    // Get all anchor elements from the fetched response
    let anchors = div.getElementsByTagName("a");
    // Select the container where product cards will be added
    let cardContainer = document.querySelector(".main");
    // Convert HTMLCollection to an array for iteration
    let array = Array.from(anchors);
    // Iterate through the array of anchor elements
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // Check if the anchor's href contains '/products' and does not contain '.htaccess'
        if (e.href.includes("/products") && !e.href.includes(".htaccess")) {
            // Extract the folder name from the href
            let folder = e.href.split("/").slice(-2)[0];
            // Fetch product data from the corresponding JSON file
            let a = await fetch(`/products/${folder}/products.json`);
            // Convert the fetched JSON response to an object
            let response = await a.json();
            // Append product card HTML to the cardContainer
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
<div class="image"><img src="./products/${folder}/product.png" alt="Chair Image"></div>
<h2>${response.title}</h2>
<p>${response.cost}</p>
<div class="buttons">
<button aria-label="Buy Now">Buy Now</button>
<button aria-label="Add to Cart" class="btn"><img src="./assets/cart.svg" alt="Cart Icon"></button>
</div>
</div>`;
        }
    }
    // Select all buttons with class 'btn'
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', async function () {
            const itemNoDisplay = document.querySelector('.itemNo');
            let itemNo = parseInt(itemNoDisplay.textContent);
            itemNo++;

            // Get the parent card element
            const card = button.closest('.card');
            // Get the title and cost of the product from the card
            const title = card.querySelector('h2').textContent;
            const cost = card.querySelector('p').textContent;

            // Check if a card with the same title already exists in the cart
            let existingCartItem = document.querySelector(`.cartItems .item-name[data-title='${title}']`);
            if (existingCartItem) {
                // If it exists, update its quantity
                let quantitySpan = existingCartItem.parentElement.querySelector('.num');
                let quantity = parseInt(quantitySpan.textContent);
                quantity++;
                quantitySpan.textContent = quantity;
            } else {
                // If it doesn't exist, create a new cart item element
                const cartItem = document.createElement('div');
                cartItem.classList.add('cartItems');
                cartItem.innerHTML = `
<div class="item-name" data-title="${title}">${title}</div>
<div class="quantity">
    <p>Quantity : <span class="num">1</span></p>
    <img class="pipe" src="./assets/pipe.svg" alt="">
    <img class="minus" src="./assets/minus.svg" alt="" data-decrement="1">
</div>
`;
                // Append the new cart item to the cart section
                const cart = document.querySelector('.cart');
                cart.appendChild(cartItem);

                // Add event listener to the minus button in the new cart item
                const minusButton = cartItem.querySelector('.minus');
                // Initialize data-decrement attribute to 1
                minusButton.dataset.decrement = 1;
            }

            itemNoDisplay.textContent = itemNo;
        });
    });
}

// Immediately invoked async function to load products
(async () => {
    try {
        await products(); // Call the products function
        console.log('Products loaded successfully');
    } catch (error) {
        console.error('Error loading products:', error);
    }
})();

// Function to handle decrementing itemNo when minus button is clicked
function decrementItemNo() {
    const itemNoDisplay = document.querySelector('.itemNo');
    let itemNo = parseInt(itemNoDisplay.textContent);
    if (itemNo > 0) {
        itemNo--; // Decrement itemNo
        itemNoDisplay.textContent = itemNo; // Update itemNo display
    }
}

// Add event listener to the minus button
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('minus')) { // Check if the clicked element has class 'minus'
        const minusButton = event.target; // Get the clicked minus button
        const quantitySpan = minusButton.parentElement.querySelector('.num'); // Find the quantity span in the same container
        let quantity = parseInt(quantitySpan.textContent); // Get the current quantity
        if (quantity > 0) { // Ensure quantity is positive
            let decrement = parseInt(minusButton.dataset.decrement) || 1; // Get decrement value from data attribute, default to 1 if not available
            quantity -= decrement; // Decrease quantity by decrement value
            quantitySpan.textContent = quantity; // Update quantity display
            decrementItemNo(); // Call decrementItemNo function to update total item count
            if (quantity === 0) { // If quantity becomes zero
                const cartItem = minusButton.closest('.cartItems'); // Find the parent cart item
                const cart = document.querySelector('.cart'); // Find the cart container
                cart.removeChild(cartItem); // Remove the cart item from the cart
            }
        }
    }
});

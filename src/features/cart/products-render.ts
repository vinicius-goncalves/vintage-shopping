import Product from '../../products/interfaces/Product.js';
import buildElement from '../../utils/element-builder.js';
import DBMethods from '../storage/DBMethods.js';
import CartMethods from './CartMethods.js';

const db = new DBMethods();
const addedProductsContainer = document.querySelector('section[data-cart="added-products-container"]') as HTMLElement;
const totalAddedProducts = document.querySelector('span[data-cart="total-added-products"') as HTMLSpanElement;
const DOMtotalPrice = document.querySelector('span[data-cart-product="price"]') as HTMLSpanElement;

const cm = new CartMethods();

function renderCartProduct(product: Product) {

    const productWrapper = buildElement('div')
        .setCustomAttribute('data-cart', 'product')
        .setCustomAttribute('data-product-id', product.id as string)
        .build();

    const productDetails = buildElement('figure')
        .setCustomAttribute('data-cart-product', 'details')
        .build();

        buildElement('img')
            .setAttribute('src', `../${product.image_src}`)
            .setCustomAttribute('data-cart-product', 'img')
            .appendOn(productDetails)
            .build();

        const productDescription = buildElement('figcaption')
            .setCustomAttribute('data-cart-product', 'description')
            .appendOn(productDetails)
            .build();

            buildElement('p')
                .setCustomAttribute('data-cart-product', 'title')
                .setText(product.name)
                .appendOn(productDescription)
                .build();

            buildElement('span')
                .setCustomAttribute('data-cart-product', 'price')
                .setText(`$${product.price}`)
                .appendOn(productDescription)
                .build();

            buildElement('button')
                .setCustomAttribute('data-cart', 'remove-from-cart')
                .setText('Remove')
                .appendOn(productDescription)
                .on('click', () => cm.removeProductFromCart(product))
                .build();

    productWrapper.appendChild(productDetails);

    return productWrapper;
}

function loadProducts() {

   db.getAllProducts().then(query => {

        if(!query) {
            return;
        }

        if(!Array.isArray(query.data)) {
            return;
        }

        const docFragment: DocumentFragment = document.createDocumentFragment();

        for(const product of query.data) {
            const productRendered: HTMLDivElement = renderCartProduct(product);
            docFragment.appendChild(productRendered);
        }

        addedProductsContainer.appendChild(docFragment);
    });
}

async function updateProductsAdded() {
    const { count } = await db.countAddedProducts();
    totalAddedProducts.textContent = String(count);
}

async function updatePrice() {

    const products = await db.getAllProducts();

    if(!products) {
        return;
    }

    const { data } = products;

    if(!Array.isArray(data)) {
        return;
    }

    const totalPrice = data.reduce((acc: number, product: Product): number => {
        return acc += Number(product.price);
    }, 0);

    DOMtotalPrice.textContent = `$${totalPrice.toFixed(2)}`
}

window.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateProductsAdded();
    updatePrice();
});
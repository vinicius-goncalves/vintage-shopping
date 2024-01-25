import type Product from '../../types/interfaces/IProduct.js';
import type ICartMethods from '../../types/interfaces/ICartMethods.js';

import { buildElement, removeDOMElement } from '../../utils/utils.js';

import DBMethods from '../storage/DBMethods.js';
import sendToast from '../toast.js';

const totalPrice = document.querySelector('span[data-cart-product="price"]') as HTMLSpanElement;
const emptyCartText = document.querySelector('p[data-cart="empty-cart-text"]') as HTMLParagraphElement;

const db: DBMethods = new DBMethods();

class CartMethods implements ICartMethods {

    addProductIntoCart(product: Product): void {

        db.addProduct(product)
            .then(() => sendToast({ title: 'Yeah!', body: 'You have added a new product to your cart!' }))
            .catch(() => sendToast({ title: 'Hey!', body: 'This product is already in your cart.' }));
    }

    removeProductFromCart(product: Product): void {

        db.removeProductById(product.id)
            .then(() => sendToast({ title: 'Ok', body: 'You have removed a product from your cart.' }))
            .then(() => removeDOMElement(`[data-product-id="${product.id}"]`));
    }

    async isCartEmpty(): Promise<boolean> {
        const { count } = await db.countAddedProducts();
        return count === 0;
    }

    async updateTotalPrice(): Promise<void> {

        const products: { data: Array<Product> } = await db.getAllProducts();

        if(!products || !Array.isArray(products.data)) {
            return;
        }

        const sumTotalPrice = (acc: number, product: Product): number => acc += Number(product.price);
        const priceSum = products.data.reduce(sumTotalPrice, 0);
        totalPrice.textContent = `$${priceSum.toFixed(2)}`;
    }

    async updateProductsCount(): Promise<void> {

        const totalAddedProducts = document.querySelector('span[data-cart="total-added-products"') as HTMLSpanElement;
        const { count } = await db.countAddedProducts();
        totalAddedProducts.textContent = String(count);
    }

    async updateCartText(): Promise<void> {
        const isCartEmpty: Awaited<boolean> = await this.isCartEmpty();
        emptyCartText.style.setProperty('display', isCartEmpty ? 'block' : 'none');
    }

    renderCartProduct(product: Product): HTMLDivElement {

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
                    .on('click', () => this.removeProductFromCart(product))
                    .build();

        productWrapper.appendChild(productDetails);

        return productWrapper;
    }

    async updateCart(): Promise<void> {
        await Promise.all([ this.updateCartText(), this.updateProductsCount(), this.updateTotalPrice() ]);
    }

    async loadProducts(container: Element): Promise<void> {

        const allProducts: { data: Array<Product> } = await db.getAllProducts();

        if(!allProducts || !Array.isArray(allProducts.data)) {
            return;
        }

        const docFragment: DocumentFragment = document.createDocumentFragment();

        for(const product of allProducts.data) {
            const productRendered: HTMLDivElement = this.renderCartProduct(product);
            docFragment.appendChild(productRendered);
        }

        container.appendChild(docFragment);

        await this.updateCart();
    }
}

export default CartMethods;
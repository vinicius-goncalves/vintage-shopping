import { buildElement } from '../utils/utils.js';
import CartMethods from '../cart/cart-methods.js';
import products from '../products/products-list.js';
const cm = new CartMethods();
class ProductsMethods {
    renderCategory(category) {
        const removeUnderlineRegExp = /_/g;
        const title = category.replace(removeUnderlineRegExp, ' ');
        const div = buildElement('div')
            .setCustomAttribute('class', 'categories')
            .build();
        buildElement('h2')
            .setText(title)
            .setCustomAttribute('class', 'category-title')
            .appendOn(div)
            .build();
        buildElement('div')
            .appendOn(div)
            .build();
        return div;
    }
    renderProduct(product, type) {
        const productContainer = buildElement('article')
            .setCustomAttribute('data-product-type', type)
            .setCustomAttribute('data-product-id', product.id)
            .on('click', () => cm.addProductIntoCart(product))
            .build();
        const hgroup = buildElement('hgroup')
            .appendOn(productContainer)
            .build();
        buildElement('h2')
            .setText(product.name)
            .appendOn(hgroup)
            .build();
        buildElement('p')
            .setText('Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, consequatur laboriosam odio laborum nobis inventore!')
            .appendOn(hgroup)
            .build();
        const productImg = buildElement('img')
            .setAttribute('src', product.image_src)
            .build();
        const figure = buildElement('figure')
            .append(productImg)
            .build();
        buildElement('figcaption')
            .appendOn(figure)
            .setText(`$${product.price}`)
            .build();
        productContainer.append(hgroup, figure);
        return productContainer;
    }
    loadProducts() {
        const docFragment = document.createDocumentFragment();
        for (const [categoryName, productsList] of Object.entries(products)) {
            const category = this.renderCategory(categoryName);
            const productContainer = category.querySelector('div');
            productsList.forEach((product) => {
                const productRendered = this.renderProduct(product, categoryName);
                productContainer.appendChild(productRendered);
            });
            docFragment.appendChild(category);
        }
        return docFragment;
    }
}
export default ProductsMethods;

import Product from '../../products/interfaces/Product.js';
import products from '../../products/products-list.js';

function flatProducts() {
    const productsFlatted = Object.entries(products).map(([ _, product ]) => product).flat();
    return productsFlatted;
}

function findProductById(id: string | number) {
    return flatProducts().find((product: Product) => product.id === id);
}

function startTransaction(db: IDBDatabase, options: { objectStoreName: string, mode: 'readwrite' | 'readonly' }): IDBObjectStore {
    const transaction: IDBTransaction = db.transaction(options.objectStoreName, options.mode);

    transaction.addEventListener('complete', (event) => {
        console.log('Transaction completed', event.timeStamp.toString().concat('ms'));
    });

    const objectStore: IDBObjectStore = transaction.objectStore(options.objectStoreName);
    return objectStore;
}

export {
    flatProducts,
    findProductById,
    startTransaction
};
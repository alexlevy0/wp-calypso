/**
 * Internal dependencies
 */
import { emptyResponseCart } from './shopping-cart-endpoint';
import type {
	CartLocation,
	RequestCart,
	RequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
	TempResponseCartProduct,
} from './types';

let lastUUID = 100;

function convertResponseCartProductToRequestCartProduct(
	product: ResponseCartProduct | TempResponseCartProduct
): RequestCartProduct {
	const { product_slug, meta, product_id, extra } = product;
	return {
		product_slug,
		meta,
		product_id,
		extra,
	};
}

export function convertResponseCartToRequestCart( {
	products,
	currency,
	locale,
	coupon,
	is_coupon_applied,
	tax,
}: ResponseCart ): RequestCart {
	let requestCartTax = null;
	if ( tax.location.country_code || tax.location.postal_code || tax.location.subdivision_code ) {
		requestCartTax = {
			location: {
				country_code: tax.location.country_code,
				postal_code: tax.location.postal_code,
				subdivision_code: tax.location.subdivision_code,
			},
		};
	}
	return {
		products: products.map( convertResponseCartProductToRequestCartProduct ),
		currency,
		locale,
		coupon,
		is_coupon_applied,
		temporary: false,
		tax: requestCartTax,
		extra: '', // This property doesn't appear to be used for anything
	};
}

export function removeItemFromResponseCart(
	cart: ResponseCart,
	uuidToRemove: string
): ResponseCart {
	return {
		...cart,
		products: cart.products.filter( ( product ) => {
			return product.uuid !== uuidToRemove;
		} ),
	};
}

export function addCouponToResponseCart( cart: ResponseCart, couponToAdd: string ): ResponseCart {
	return {
		...cart,
		coupon: couponToAdd,
		is_coupon_applied: false,
	};
}

export function removeCouponFromResponseCart( cart: ResponseCart ): ResponseCart {
	return {
		...cart,
		coupon: '',
		is_coupon_applied: false,
	};
}

export function addLocationToResponseCart(
	cart: ResponseCart,
	location: CartLocation
): ResponseCart {
	return {
		...cart,
		tax: {
			...cart.tax,
			location: {
				country_code: location.countryCode || undefined,
				postal_code: location.postalCode || undefined,
				subdivision_code: location.subdivisionCode || undefined,
			},
		},
	};
}

export function doesCartLocationDifferFromResponseCartLocation(
	cart: ResponseCart,
	location: CartLocation
): boolean {
	const { countryCode, postalCode, subdivisionCode } = location;
	const isMissing = ( value: null | undefined | string ) => value === null || value === undefined;
	if ( ! isMissing( countryCode ) && cart.tax.location.country_code !== countryCode ) {
		return true;
	}
	if ( ! isMissing( postalCode ) && cart.tax.location.postal_code !== postalCode ) {
		return true;
	}
	if ( ! isMissing( subdivisionCode ) && cart.tax.location.subdivision_code !== subdivisionCode ) {
		return true;
	}
	return false;
}

export function convertRawResponseCartToResponseCart(
	rawResponseCart: Partial< ResponseCart >
): ResponseCart {
	if ( typeof rawResponseCart !== 'object' || rawResponseCart === null ) {
		return emptyResponseCart;
	}

	// If tax.location is an empty PHP associative array, it will be JSON serialized to [] but we need {}
	const taxLocation =
		rawResponseCart.tax?.location && Array.isArray( rawResponseCart.tax.location )
			? rawResponseCart.tax.location
			: {};

	const rawProducts =
		rawResponseCart.products?.length && Array.isArray( rawResponseCart.products )
			? rawResponseCart.products
			: [];

	return {
		...emptyResponseCart,
		...rawResponseCart,
		tax: {
			location: taxLocation,
			display_taxes: rawResponseCart.tax?.display_taxes ?? false,
		},
		// Add uuid to products returned by the server
		products: rawProducts.map( ( product ) => {
			return {
				...product,
				uuid: product.product_slug + lastUUID++,
			};
		} ),
	};
}

export function addItemsToResponseCart(
	responseCart: ResponseCart,
	products: RequestCartProduct[]
): ResponseCart {
	const responseCartProducts: TempResponseCartProduct[] = products.map(
		convertRequestCartProductToResponseCartProduct
	);
	return {
		...responseCart,
		products: [ ...responseCart.products, ...responseCartProducts ],
	};
}

export function replaceAllItemsInResponseCart(
	responseCart: ResponseCart,
	products: RequestCartProduct[]
): ResponseCart {
	const responseCartProducts: TempResponseCartProduct[] = products.map(
		convertRequestCartProductToResponseCartProduct
	);
	return {
		...responseCart,
		products: [ ...responseCartProducts ],
	};
}

export function replaceItemInResponseCart(
	cart: ResponseCart,
	uuidToReplace: string,
	productPropertiesToChange: Partial< RequestCartProduct >
): ResponseCart {
	return {
		...cart,
		products: cart.products.map( ( item ) => {
			if ( item.uuid === uuidToReplace ) {
				return { ...item, ...productPropertiesToChange };
			}
			return item;
		} ),
	};
}

function convertRequestCartProductToResponseCartProduct(
	product: RequestCartProduct
): TempResponseCartProduct {
	const { product_slug, product_id, meta, extra } = product;
	return {
		product_name: '',
		product_slug,
		product_id,
		currency: null,
		item_original_cost_display: null,
		item_original_cost_integer: null,
		item_subtotal_monthly_cost_display: null,
		item_subtotal_monthly_cost_integer: null,
		item_original_subtotal_display: null,
		item_original_subtotal_integer: null,
		product_cost_integer: null,
		product_cost_display: null,
		item_subtotal_integer: null,
		item_subtotal_display: null,
		is_domain_registration: null,
		is_bundled: null,
		months_per_bill_period: null,
		meta,
		volume: 1,
		extra,
		uuid: 'calypso-shopping-cart-endpoint-uuid-' + lastUUID++,
		cost: null,
		price: null,
		product_type: null,
		included_domain_purchase_amount: null,
		is_renewal: undefined,
		is_sale_coupon_applied: false,
		subscription_id: undefined,
	};
}

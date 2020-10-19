/**
 * External dependencies
 */
import { useCallback, useMemo, useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	ResponseCart,
	RequestCartProduct,
	CartLocation,
	ShoppingCartManager,
	ShoppingCartManagerArguments,
	CacheStatus,
	CouponStatus,
	ShoppingCartError,
	ReplaceProductInCart,
} from './types';
import useShoppingCartReducer from './use-shopping-cart-reducer';
import useInitializeCartFromServer from './use-initialize-cart-from-server';
import useCartUpdateAndRevalidate from './use-cart-update-and-revalidate';
import useReloadCartIfCartKeyChanges from './use-reload-cart-if-cart-key-changes';

const debug = debugFactory( 'shopping-cart:use-shopping-cart-manager' );

export default function useShoppingCartManager( {
	cartKey,
	setCart,
	getCart,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const setServerCart = useCallback( ( cartParam ) => setCart( String( cartKey ), cartParam ), [
		cartKey,
		setCart,
	] );
	const getServerCart = useCallback( () => getCart( String( cartKey ) ), [ cartKey, getCart ] );

	const [ hookState, hookDispatch ] = useShoppingCartReducer();

	const responseCart: ResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string | undefined = hookState.loadingError;
	const loadingErrorType: ShoppingCartError | undefined = hookState.loadingErrorType;

	const canInitializeCart = !! cartKey;

	useInitializeCartFromServer(
		cacheStatus,
		canInitializeCart,
		getServerCart,
		setServerCart,
		hookDispatch
	);

	// Asynchronously re-validate when the cache is dirty.
	useCartUpdateAndRevalidate( cacheStatus, responseCart, setServerCart, hookDispatch );

	const addProductsToCart: ( products: RequestCartProduct[] ) => void = useCallback(
		( products ) => {
			hookDispatch( { type: 'CART_PRODUCTS_ADD', products } );
		},
		[ hookDispatch ]
	);

	const replaceProductsInCart: ( products: RequestCartProduct[] ) => void = useCallback(
		( products ) => {
			hookDispatch( { type: 'CART_PRODUCTS_REPLACE_ALL', products } );
		},
		[ hookDispatch ]
	);

	const removeProductFromCart: ( uuidToRemove: string ) => void = useCallback(
		( uuidToRemove ) => {
			hookDispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
		},
		[ hookDispatch ]
	);

	const replaceProductInCart: ReplaceProductInCart = useCallback(
		( uuidToReplace: string, productPropertiesToChange: Partial< RequestCartProduct > ) => {
			hookDispatch( { type: 'CART_PRODUCT_REPLACE', uuidToReplace, productPropertiesToChange } );
		},
		[ hookDispatch ]
	);

	const updateLocation: ( arg0: CartLocation ) => void = useCallback(
		( location ) => {
			hookDispatch( { type: 'SET_LOCATION', location } );
		},
		[ hookDispatch ]
	);

	const applyCoupon: ( arg0: string ) => void = useCallback(
		( newCoupon ) => {
			hookDispatch( { type: 'ADD_COUPON', couponToAdd: newCoupon } );
		},
		[ hookDispatch ]
	);

	const removeCoupon: () => void = useCallback( () => {
		hookDispatch( { type: 'REMOVE_COUPON' } );
	}, [ hookDispatch ] );

	const reloadFromServer: () => void = useCallback( () => {
		hookDispatch( { type: 'CART_RELOAD' } );
	}, [ hookDispatch ] );

	useReloadCartIfCartKeyChanges( cartKey, reloadFromServer );

	const isLoading = cacheStatus === 'fresh' || ! canInitializeCart;
	const loadingErrorForManager = cacheStatus === 'error' ? loadingError : null;
	const isPendingUpdate = cacheStatus !== 'valid' || ! canInitializeCart;

	const shoppingCartManager = useMemo(
		() => ( {
			isLoading,
			loadingError: loadingErrorForManager,
			loadingErrorType,
			isPendingUpdate,
			addProductsToCart,
			removeProductFromCart,
			applyCoupon,
			removeCoupon,
			couponStatus,
			updateLocation,
			replaceProductInCart,
			replaceProductsInCart,
			reloadFromServer,
			responseCart,
		} ),
		[
			isLoading,
			isPendingUpdate,
			loadingErrorForManager,
			loadingErrorType,
			addProductsToCart,
			removeProductFromCart,
			applyCoupon,
			removeCoupon,
			couponStatus,
			updateLocation,
			replaceProductInCart,
			replaceProductsInCart,
			reloadFromServer,
			responseCart,
		]
	);

	useEffect( () => {
		debug( 'shoppingCartManager:', shoppingCartManager );
	}, [ shoppingCartManager ] );

	return shoppingCartManager;
}

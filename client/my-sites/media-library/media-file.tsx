/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import ProxiedFile, { RenderedComponent } from './proxied-file';
import { mediaURLToProxyConfig } from 'lib/media/utils';

export interface MediaFileProps {
	src: string;

	component: RenderedComponent;
	proxiedComponent?: RenderedComponent;
	filePath: string;
	query: string;
	siteSlug: string;
	onLoad: () => any;
	placeholder: React.ReactNode | null;
	useProxy: boolean;
	dispatch: any;
}

const MediaFile: React.FC< MediaFileProps > = function MediaFile( {
	src,
	query,
	filePath,
	siteSlug,
	useProxy = false,
	placeholder = null,
	dispatch,
	component: Component,
	proxiedComponent,
	...rest
} ) {
	if ( useProxy ) {
		return (
			<ProxiedFile
				siteSlug={ siteSlug }
				filePath={ filePath }
				query={ query }
				component={ proxiedComponent || Component }
				placeholder={ placeholder }
				{ ...rest }
			/>
		);
	}

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <Component src={ src } { ...rest } />;
};

MediaFile.defaultProps = {
	placeholder: null,
	component: 'img',
};

export default connect( ( state, { src }: Pick< MediaFileProps, 'src' > ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state ) as string;
	const isAtomic = !! isSiteAutomatedTransfer( state, siteId as number );
	const isPrivate = !! isPrivateSite( state, siteId );
	const { filePath, query, isRelativeToSiteRoot } = mediaURLToProxyConfig( src, siteSlug );
	const useProxy = ( isAtomic && isPrivate && filePath && isRelativeToSiteRoot ) as boolean;

	return {
		query,
		siteSlug,
		useProxy,
		filePath,
	};
} )( MediaFile );

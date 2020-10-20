/**
 * External dependencies
 */
import React from 'react';
import type { Plans } from '@automattic/data-stores';
import { useI18n } from '@automattic/react-i18n';
import { useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

const TickIcon = <Icon icon={ check } size={ 25 } />;

type PlansSlug = Plans.PlanSlug;

type Props = {
	onSelect: ( plan: PlansSlug ) => void;
};

const PlansDetails: React.FunctionComponent< Props > = ( { onSelect } ) => {
	const { __, i18nLocale } = useI18n();

	const allPlansDetails = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlansDetails( i18nLocale )
	);

	const { features, featuresByType, plans } = allPlansDetails;

	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );

	return (
		<div className="plans-details">
			<table className="plans-details__table">
				<thead>
					<tr className="plans-details__header-row">
						<th>{ __( 'Feature' ) }</th>
						{ supportedPlans.map( ( plan ) => (
							<th key={ plan.storeSlug }>{ plan.title }</th>
						) ) }
					</tr>
				</thead>

				{ featuresByType.map( ( featureType ) => (
					<tbody key={ featureType.id }>
						{ featureType.name && (
							<tr className="plans-details__header-row">
								<th colSpan={ 6 }>{ featureType.name }</th>
							</tr>
						) }
						{ featureType.features?.map( ( feature: string, i ) => (
							<tr className="plans-details__feature-row" key={ i }>
								<th>{ features[ feature ].name }</th>
								{ supportedPlans.map( ( plan, j ) => (
									<td key={ j }>
										{ plans[ plan.storeSlug ].featuresSlugs?.[ feature ] ? (
											<>
												{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
												<span className="hidden">{ __( 'Available' ) }</span>
												{ TickIcon }
											</>
										) : (
											<>
												{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
												<span className="hidden">{ __( 'Unavailable' ) }</span>
											</>
										) }
									</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				) ) }

				<tbody>
					<tr className="plans-details__header-row">
						<th colSpan={ 6 }>{ __( 'Sign up' ) }</th>
					</tr>
					<tr className="plans-details__feature-row" key="price">
						<th>{ __( 'Monthly subscription (billed yearly)' ) }</th>
						{ supportedPlans.map( ( plan ) => (
							<td key={ plan.storeSlug }>{ prices[ plan.storeSlug ] }</td>
						) ) }
					</tr>

					<tr className="plans-details__feature-row" key="cta">
						<th></th>
						{ supportedPlans.map( ( plan ) => (
							<td key={ plan.storeSlug }>
								<Button
									className="plans-details__select-button"
									onClick={ () => {
										onSelect( plan.storeSlug );
									} }
									isPrimary
								>
									<span>{ __( 'Select' ) }</span>
								</Button>
							</td>
						) ) }
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default PlansDetails;

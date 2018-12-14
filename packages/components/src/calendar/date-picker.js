/** @format */
/**
 * External dependencies
 */
import 'core-js/fn/object/assign';
import 'core-js/fn/array/from';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { DayPickerSingleDateController } from 'react-dates';
import { Dropdown } from '@wordpress/components';
import { partial } from 'lodash';
import { TAB } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import DateInput from './input';
import phrases from './phrases';
import { toMoment } from '@woocommerce/date';
import { getOutsideRange } from './utils';
import { H, Section } from '../section';
import PropTypes from 'prop-types';
import { withViewportMatch } from '@wordpress/viewport';

class DatePicker extends Component {
	constructor( props ) {
		super( props );

		this.onDateChange = this.onDateChange.bind( this );
		this.onInputChange = this.onInputChange.bind( this );
	}

	handleKeyDown( isOpen, onToggle, { keyCode } ) {
		if ( TAB === keyCode && isOpen ) {
			onToggle();
		}
	}

	handleFocus( isOpen, onToggle ) {
		if ( ! isOpen ) {
			onToggle();
		}
	}

	onDateChange( onToggle, date ) {
		const { onUpdate, dateFormat } = this.props;
		onUpdate( {
			date,
			text: date ? date.format( dateFormat ) : '',
			error: null,
		} );
		onToggle();
	}

	onInputChange( event ) {
		const value = event.target.value;
		const { dateFormat } = this.props;
		const date = toMoment( dateFormat, value );
		const error = date ? null : __( 'Invalid date', 'wc-admin' );

		this.props.onUpdate( {
			date,
			text: value,
			error: value.length > 0 ? error : null,
		} );
	}

	render() {
		const { date, text, dateFormat, label, error, invalidDays, isViewportSmall } = this.props;
		const isOutsideRange = getOutsideRange( invalidDays );
		return (
			<Dropdown
				position="bottom center"
				focusOnMount={ false }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<DateInput
						value={ text }
						onChange={ this.onInputChange }
						dateFormat={ dateFormat }
						label={ label }
						error={ error }
						describedBy={ sprintf(
							__( 'Date input describing a selected date in format %s', 'wc-admin' ),
							dateFormat
						) }
						onFocus={ partial( this.handleFocus, isOpen, onToggle ) }
						aria-expanded={ isOpen }
						focusOnMount={ false }
						onKeyDown={ partial( this.handleKeyDown, isOpen, onToggle ) }
						errorPosition="top center"
					/>
				) }
				renderContent={ ( { onToggle } ) => (
					<Section component={ false }>
						<H className="woocommerce-calendar__date-picker-title">
							{ __( 'select a date', 'wc-admin' ) }
						</H>
						<div className="woocommerce-calendar__react-dates">
							<DayPickerSingleDateController
								date={ date }
								phrases={ phrases }
								hideKeyboardShortcutsPanel
								noBorder
								firstDayOfWeek={ Number( wcSettings.date.dow ) }
								onDateChange={ partial( this.onDateChange, onToggle ) }
								isOutsideRange={ isOutsideRange }
								daySize={ isViewportSmall ? 37 : undefined }
							/>
						</div>
					</Section>
				) }
			/>
		);
	}
}

DatePicker.propTypes = {
	/**
	 * A moment date object representing the selected date. `null` for no selection.
	 */
	date: PropTypes.object,
	/**
	 * The date in human-readable format. Displayed in the text input.
	 */
	text: PropTypes.string,
	/**
	 * A string error message, shown to the user.
	 */
	error: PropTypes.string,
	/**
	 * Optionally invalidate certain days. `past`, `future`, `none`, or function are accepted.
	 * A function will be passed to react-dates' `isOutsideRange` prop
	 */
	invalidDays: PropTypes.oneOfType( [
		PropTypes.oneOf( [ 'past', 'future', 'none' ] ),
		PropTypes.func,
	] ),
	/**
	 * A function called upon selection of a date or input change.
	 */
	onUpdate: PropTypes.func.isRequired,
	/**
	 * The date format in moment.js-style tokens.
	 */
	dateFormat: PropTypes.string.isRequired,
	/**
	 * An aria-label to be applied to the input.
	 */
	label: PropTypes.string,
};

export default withViewportMatch( {
	isViewportSmall: '< small',
} )( DatePicker );

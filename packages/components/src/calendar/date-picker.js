/** @format */
/**
 * External dependencies
 */
import 'core-js/fn/object/assign';
import 'core-js/fn/array/from';
import { __, sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
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
		// @TODO: add validation
		const error = date ? null : 'Invalid date';

		this.props.onUpdate( {
			date,
			text: value,
			error: value.length > 0 ? error : null,
		} );
	}

	render() {
		const { date, text, dateFormat, label, error, invalidDays } = this.props;
		const isOutsideRange = getOutsideRange( invalidDays );
		return (
			<Fragment>
				<Dropdown
					expandOnMobile
					position="bottom"
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
						<div className="woocommerce-calendar__react-dates">
							<DayPickerSingleDateController
								date={ date }
								phrases={ phrases }
								hideKeyboardShortcutsPanel
								noBorder
								focused={ true }
								firstDayOfWeek={ Number( wcSettings.date.dow ) }
								onDateChange={ partial( this.onDateChange, onToggle ) }
								isOutsideRange={ isOutsideRange }
							/>
						</div>
					) }
				/>
			</Fragment>
		);
	}
}

export default DatePicker;

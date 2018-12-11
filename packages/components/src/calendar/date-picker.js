/** @format */
/**
 * External dependencies
 */
import 'core-js/fn/object/assign';
import 'core-js/fn/array/from';
import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { Component, Fragment } from '@wordpress/element';
import { DayPicker, isInclusivelyAfterDay, isInclusivelyBeforeDay } from 'react-dates';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withViewportMatch } from '@wordpress/viewport';
import { Dropdown, Popover } from '@wordpress/components';

/**
 * WooCommerce dependencies
 */
import { validateDateInputForRange } from '@woocommerce/date';

/**
 * Internal dependencies
 */
import DateInput from './input';
import phrases from './phrases';

class DatePicker extends Component {
	render() {
		const { text, onInputChange, dateFormat, label, error } = this.props;
		return (
			<Fragment>
				<Dropdown
					expandOnMobile
					position="bottom"
					focusOnMount={ false }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<DateInput
							value={ text }
							onChange={ onInputChange }
							dateFormat={ dateFormat }
							label={ label }
							error={ error }
							describedBy={ sprintf(
								__( 'Date input describing a selected date in format %s', 'wc-admin' ),
								dateFormat
							) }
							onFocus={ onToggle }
							aria-expanded={ isOpen }
						/>
					) }
					renderContent={ ( { onToggle } ) => (
						<DayPicker
							phrases={ phrases }
							hideKeyboardShortcutsPanel
							noBorder
							firstDayOfWeek={ Number( wcSettings.date.dow ) }
							onDayClick={ a => {
								console.log( a );
								onToggle();
							} }
						/>
					) }
				/>
			</Fragment>
		);
	}
}

export default DatePicker;

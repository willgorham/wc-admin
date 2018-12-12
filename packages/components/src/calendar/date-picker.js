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
import { partial } from 'lodash';
import { TAB } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import DateInput from './input';
import phrases from './phrases';

class DatePicker extends Component {
	constructor( props ) {
		super( props );

		this.onDateChange = this.onDateChange.bind( this );
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

	render() {
		const { text, onUpdate, dateFormat, label, error } = this.props;
		return (
			<Fragment>
				<Dropdown
					expandOnMobile
					position="bottom"
					focusOnMount={ false }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<DateInput
							value={ text }
							onChange={ onUpdate }
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
						/>
					) }
					renderContent={ ( { onToggle } ) => (
						<DayPicker
							phrases={ phrases }
							hideKeyboardShortcutsPanel
							noBorder
							firstDayOfWeek={ Number( wcSettings.date.dow ) }
							onDayClick={ partial( this.onDateChange, onToggle ) }
						/>
					) }
				/>
			</Fragment>
		);
	}
}

export default DatePicker;

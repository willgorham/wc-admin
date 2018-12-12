```jsx
import { DateRange, DatePicker } from '@woocommerce/components';
import moment from 'moment';

const dateFormat = 'MM/DD/YYYY';

const MyDateRange =  withState( {
	after: moment( '2018-09-10' ),
	afterText: '09/10/2018',
	before: moment( '2018-09-20' ),
	beforeText: '09/20/2018',
	afterError: null,
	beforeError: null,
} )( ( { after, afterText, before, beforeText, setState } ) => {
	function onRangeUpdate( { after, afterText, before, beforeText } ) {
		setState( { after, afterText, before, beforeText } );
	}
	
	function onDatePickerUpdate( { date, text, error } ) {
		setState( { 
			after: date, 
			afterText: text,
			afterError: null,
		} );
	}
	
	return (
		<div>
			<H>Date Range Picker</H>
			<Section component={ false }>
				<DateRange
					after={ after }
					afterText={ afterText }
					before={ before }
					beforeText={ beforeText }
					onUpdate={ onRangeUpdate }
					shortDateFormat={ dateFormat }
					focusedInput="startDate"
					invalidDays="none"
				/>
			</Section>
	
			<H>Date Picker</H>
			<Section component={ false }>
				<DatePicker
					date={ after }
					text={ afterText }
					onUpdate={ onDatePickerUpdate }
					dateFormat={ dateFormat }
					invalidDays="none"
					label="hello world"
					onUpdate={ onDatePickerUpdate }
				/>
			</Section>
		</div>
	)
} );
```

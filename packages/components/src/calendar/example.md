```jsx
import { DateRange, DatePicker } from '@woocommerce/components';
import moment from 'moment';

const dateFormat = 'MM/DD/YYYY';

const MyDateRange =  withState( {
	after: null,
	afterText: '',
	before: null,
	beforeText: '',
	afterError: null,
	beforeError: null,
} )( ( { after, afterText, before, beforeText, afterError, beforeError, setState } ) => {
	function onRangeUpdate( { after, afterText, before, beforeText } ) {
		setState( { after, afterText, before, beforeText } );
	}
	
	function onDatePickerUpdate( { date, text, error } ) {
		setState( { 
			after: date, 
			afterText: text,
			afterError: error,
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
					error={ afterError } 
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

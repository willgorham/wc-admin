<?php
/**
 * WC_Admin_Note_Data_Store class file.
 *
 * @package WooCommerce Admin/Classes
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC Admin Note Data Store (Custom Tables)
 */
class WC_Admin_Notes_Data_Store extends WC_Data_Store_WP implements WC_Object_Data_Store_Interface {
	/**
	 * Method to create a new note in the database.
	 *
	 * @param WC_Admin_Note $note Admin note.
	 */
	public function create( &$note ) {
		$date_created = current_time( 'timestamp', 1 );
		$note->set_date_created( $date_created );

		global $wpdb;

		$note_to_be_inserted = array(
			'name'    => $note->get_name(),
			'type'    => $note->get_type(),
			'locale'  => $note->get_locale(),
			'title'   => $note->get_title(),
			'content' => $note->get_content(),
			'icon'    => $note->get_icon(),
			'status'  => $note->get_status(),
			'source'  => $note->get_source(),
		);

		$note_to_be_inserted['content_data']  = wp_json_encode( $note->get_content_data() );
		$note_to_be_inserted['date_created']  = gmdate( 'Y-m-d H:i:s', $date_created );
		$note_to_be_inserted['date_reminder'] = null;

		$wpdb->insert( $wpdb->prefix . 'woocommerce_admin_notes', $note_to_be_inserted );
		$note_id = $wpdb->insert_id;
		$note->set_id( $note_id );
		$note->save_meta_data();
		$this->save_actions( $note );
		$note->apply_changes();

		do_action( 'woocommerce_new_note', $note_id );
	}

	/**
	 * Method to read a note.
	 *
	 * @param WC_Admin_Note $note Admin note.
	 * @throws Exception Throws exception when invalid data is found.
	 */
	public function read( &$note ) {
		global $wpdb;

		$note->set_defaults();
		$note_row = false;

		$note_id = $note->get_id();
		if ( 0 !== $note_id || '0' !== $note_id ) {
			$note_row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT name, type, locale, title, content, icon, content_data, status, source, date_created, date_reminder FROM {$wpdb->prefix}woocommerce_admin_notes WHERE note_id = %d LIMIT 1",
					$note->get_id()
				)
			);
		}

		if ( 0 === $note->get_id() || '0' === $note->get_id() ) {
			$this->read_actions( $note );
			$note->read_meta_data();
			$note->set_object_read( true );
			do_action( 'woocommerce_admin_note_loaded', $note );
		} elseif ( $note_row ) {
			$note->set_name( $note_row->name );
			$note->set_type( $note_row->type );
			$note->set_locale( $note_row->locale );
			$note->set_title( $note_row->title );
			$note->set_content( $note_row->content );
			$note->set_icon( $note_row->icon );
			$note->set_content_data( json_decode( $note_row->content_data ) );
			$note->set_status( $note_row->status );
			$note->set_source( $note_row->source );
			$note->set_date_created( $note_row->date_created );
			$note->set_date_reminder( $note_row->date_reminder );
			$this->read_actions( $note );
			$note->read_meta_data();
			$note->set_object_read( true );
			do_action( 'woocommerce_admin_note_loaded', $note );
		} else {
			throw new Exception( __( 'Invalid data store for admin note.', 'wc-admin' ) );
		}
	}

	/**
	 * Updates a note in the database.
	 *
	 * @param WC_Admin_Note $note Admin note.
	 */
	public function update( &$note ) {
		global $wpdb;

		if ( $note->get_id() ) {
			$date_created           = $note->get_date_created();
			$date_created_timestamp = $date_created->getTimestamp();
			$date_created_to_db     = gmdate( 'Y-m-d H:i:s', $date_created_timestamp );

			$date_reminder = $note->get_date_reminder();
			if ( is_null( $date_reminder ) ) {
				$date_reminder_to_db = null;
			} else {
				$date_reminder_timestamp = $date_reminder->getTimestamp();
				$date_reminder_to_db     = gmdate( 'Y-m-d H:i:s', $date_reminder_timestamp );
			}

			$wpdb->update(
				$wpdb->prefix . 'woocommerce_admin_notes',
				array(
					'name'          => $note->get_name(),
					'type'          => $note->get_type(),
					'locale'        => $note->get_locale(),
					'title'         => $note->get_title(),
					'content'       => $note->get_content(),
					'icon'          => $note->get_icon(),
					'content_data'  => wp_json_encode( $note->get_content_data() ),
					'status'        => $note->get_status(),
					'source'        => $note->get_source(),
					'date_created'  => $date_created_to_db,
					'date_reminder' => $date_reminder_to_db,
				),
				array( 'note_id' => $note->get_id() )
			);
		}

		$note->save_meta_data();
		$this->save_actions( $note );
		$note->apply_changes();
		do_action( 'woocommerce_update_note', $note->get_id() );
	}

	/**
	 * Deletes a note from the database.
	 *
	 * @param WC_Admin_Note $note Admin note.
	 * @param array         $args Array of args to pass to the delete method (not used).
	 */
	public function delete( &$note, $args = array() ) {
		$note_id = $note->get_id();
		if ( $note_id ) {
			global $wpdb;
			$wpdb->delete( $wpdb->prefix . 'woocommerce_admin_notes', array( 'note_id' => $note_id ) );
			$wpdb->delete( $wpdb->prefix . 'woocommerce_admin_note_actions', array( 'note_id' => $note_id ) );
			$note->set_id( null );
		}
		do_action( 'woocommerce_trash_note', $note_id );
	}

	/**
	 * Read actions from the database.
	 *
	 * @param WC_Admin_Note $note Admin note.
	 */
	private function read_actions( &$note ) {
		global $wpdb;

		$actions = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT name, label, query FROM {$wpdb->prefix}woocommerce_admin_note_actions WHERE note_id = %d",
				$note->get_id()
			)
		);
		if ( $actions ) {
			foreach ( $actions as $action ) {
				$note->add_action( $action->name, $action->label, $action->query );
			}
		}
	}

	/**
	 * Save actions to the database.
	 * This function clears old actions, then re-inserts new if any changes are found.
	 *
	 * @param WC_Admin_Note $note Note object.
	 *
	 * @return bool|void
	 */
	private function save_actions( &$note ) {
		$changed_props = array_keys( $note->get_changes() );
		if ( ! in_array( 'actions', $changed_props, true ) ) {
			return false;
		}

		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'woocommerce_admin_note_actions', array( 'note_id' => $note->get_id() ) );
		foreach ( $note->get_actions( 'edit' ) as $action ) {
			$wpdb->insert(
				$wpdb->prefix . 'woocommerce_admin_note_actions',
				array(
					'note_id' => $note->get_id(),
					'name'    => $action->name,
					'label'   => $action->label,
					'query'   => $action->query,
				)
			);
		}
	}

	/**
	 * Return an ordered list of notes.
	 *
	 * @param array $args Query arguments.
	 * @return array An array of objects containing a note id.
	 */
	public function get_notes( $args = array() ) {
		global $wpdb;

		$per_page = isset( $args['per_page'] ) ? intval( $args['per_page'] ) : 10;
		if ( $per_page <= 0 ) {
			$per_page = 10;
		}

		$page = isset( $args['page'] ) ? intval( $args['page'] ) : 1;
		if ( $page <= 0 ) {
			$page = 1;
		}

		$offset = $per_page * ( $page - 1 );

		$allowed_types    = WC_Admin_Note::get_allowed_types();
		$where_type_array = array();
		if ( isset( $args['type'] ) ) {
			$args_types = explode( ',', $args['type'] );
			foreach ( (array) $args_types as $args_type ) {
				$args_type = trim( $args_type );
				if ( in_array( $args_type, $allowed_types, true ) ) {
					$where_type_array[] = "'" . esc_sql( $args_type ) . "'";
				}
			}
		}
		$escaped_where_types = implode( ',', $where_type_array );

		if ( empty( $escaped_where_types ) ) {
			$query = $wpdb->prepare(
				"SELECT note_id, title, content FROM {$wpdb->prefix}woocommerce_admin_notes ORDER BY note_id DESC LIMIT %d, %d",
				$offset,
				$per_page
			);
		} else {
			$query = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
				"SELECT note_id, title, content FROM {$wpdb->prefix}woocommerce_admin_notes WHERE type IN ($escaped_where_types) ORDER BY note_id DESC LIMIT %d, %d",
				$offset,
				$per_page
			);
		}

		return $wpdb->get_results( $query ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	}

	/**
	 * Return a count of notes.
	 *
	 * @return array An array of objects containing a note id.
	 */
	public function get_notes_count() {
		global $wpdb;
		return $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}woocommerce_admin_notes" );
	}

	/**
	 * Find all the notes with a given name.
	 *
	 * @param string $name Name to search for.
	 * @return array An array of matching note ids.
	 */
	public function get_notes_with_name( $name ) {
		global $wpdb;
		return $wpdb->get_col(
			$wpdb->prepare(
				"SELECT note_id FROM {$wpdb->prefix}woocommerce_admin_notes WHERE name = %s ORDER BY note_id ASC",
				$name
			)
		);
	}

}

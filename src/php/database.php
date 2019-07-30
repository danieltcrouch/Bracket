<?php

function getBracketMeta( $bracketId )
{
    $mysqli = getMySQL();

    $meta = null;
    $result = $mysqli->query( "SELECT title, image, help FROM meta WHERE id = '$bracketId' " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $meta = [
            'title' => $row['title'],
            'image' => $row['image'],
            'help'  => $row['help']
        ];
    }

    return $meta;
}

function getBracketId( $title )
{
    $mysqli = getMySQL();

    $id = null;
    $result = $mysqli->query( "SELECT id FROM meta WHERE name = '$title' LIMIT 1 " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $id = $row['id'];
    }

    return $id;
}

function getAllLogos()
{
    $mysqli = getMySQL();

    $logos = [];
    $result = $mysqli->query( "SELECT
            id,
            date,
            (CASE WHEN active = 0 THEN '' ELSE active END) as \"active\",
            title,
            image,
            help,
            mode
        FROM meta
        ORDER BY title DESC " );
    if ( $result && $result->num_rows > 0 ) {
        while ( $row = $result->fetch_array() ) {
            array_push( $logos, $row );
        }
    }

    return $logos;
}

function getBracket( $bracketId )
{
    $mysqli = getMySQL();

    $bracketInfo = null;
    $result = $mysqli->query( "SELECT
            m.id, m.active, m.title, m.image, m.help, m.mode,
            t.start_time, t.frequency, t.frequency_point, t.scheduled_close,
            r.top_wins,
            e_names,
            e_images
        FROM meta m
            JOIN timing t ON m.id = t.bracket_id
            LEFT OUTER JOIN results r ON m.id = r.bracket_id
            LEFT OUTER JOIN (
                SELECT
                    e.bracket_id,
                    GROUP_CONCAT(e.name ORDER BY e.seed ASC SEPARATOR '|') as \"e_names\",
                    GROUP_CONCAT(e.image ORDER BY e.seed ASC SEPARATOR '|') as \"e_images\"
                FROM entries e
                GROUP BY e.bracket_id
            ) ent ON m.id = ent.bracket_id
        WHERE m.id = '$bracketId' " );
    $mysqli->close();

    if ( $result ) {
        $row = $result->fetch_array();
        $bracketInfo = [
            'active'  => $row['active'],
            'title'   => $row['title'],
            'image'   => $row['image'],
            'help'    => $row['help'],
            'mode'    => $row['mode'],
            'winners' => $row['winners'],
            'timing' => [
                'startTime'      => $row['start_time'],
                'frequency'      => $row['frequency'],
                'frequencyPoint' => $row['frequency_point'],
                'scheduledClose' => $row['scheduled_close']
            ],
            'entries' => []
        ];

        $entryNames = explode( '|', $row['e_names'] );
        $entryImages = explode( '|', $row['e_images'] );
        foreach( $entryNames as $index => $name ) {
            array_push( $bracketInfo['entries'], ['name' => $name, 'image' => $entryImages[$index]] );
        }
    }

    return $bracketInfo;
}

function saveBracket( $bracket )
{
    $mysqli = getMySQL();

    $bracketId = getGUID();
    $bracket = json_decode( $bracket );

    $frequency      = $bracket->timing->frequency      ? ( "'" . $bracket->timing->frequency      . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint ? ( "'" . $bracket->timing->frequencyPoint . "'" ) : "NULL";
    $scheduledClose = $bracket->timing->scheduledClose ? ( "'" . $bracket->timing->scheduledClose . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint === "0" ? "'0'" : $frequencyPoint;

    $insertMeta     = "INSERT INTO meta (id, title, image, help, mode) 
        VALUES ('$bracketId', '" . cleanse( $bracket->title ) . "', '$bracket->image', '" . cleanse( $bracket->help ) . "', '$bracket->mode')";
    $insertTiming   = "INSERT INTO timing (bracket_id, start_time, frequency, frequency_point, scheduled_close)
        VALUES ('$bracketId', NULL, $frequency, $frequencyPoint, $scheduledClose)";
    $insertEntries  = "INSERT INTO entries (bracket_id, id, name, image, seed) VALUES ";
    for ( $i = 0; $i < count( $bracket->entries ); $i++ )
    {
        if ( $i != 0 )
        {
            $insertEntries .= ", ";
        }

        $entryId = getGUID();
        $name = $bracket->entries[$i]->name;
        $image = $bracket->entries[$i]->image;
        $insertEntries .= "('$bracketId', '$entryId', '" . cleanse( $name ) . "', '$image', $i)";
    }

    $query = $insertMeta . "; " .
        $insertTiming . "; " .
        $insertEntries;

	$mysqli->multi_query($query);
	$mysqli->close();

    return $bracketId;
}

function cleanse( $value )
{
    return $value;
}

function getMySQL() //todo 3 - use best php/mysql practices - bind variables
{
    return new mysqli('localhost', 'religiv3_admin', '1corinthians3:9', 'religiv3_bracket');
}

function getGUID()
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    if ( isset($_POST['bracket']) ) {
        $result = $action( $_POST['bracket'] );
    }
    elseif ( isset($_POST['id']) ) {
        $result = $action( $_POST['id'] );
    }
    elseif ( isset($_POST['title']) ) {
        $result = $action( $_POST['title'] );
    }
    else {
        $result = $action();
    }

    echo json_encode($result);
}